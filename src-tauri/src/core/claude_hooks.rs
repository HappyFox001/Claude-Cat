use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize)]
pub struct HookStatus {
    pub claude_settings_exists: bool,
    pub hooks_configured: bool,
    pub hook_script_exists: bool,
    pub required_hooks: Vec<String>,
    pub configured_hooks: Vec<String>,
}

/// Get the path to Claude settings file
fn get_claude_settings_path() -> Option<PathBuf> {
    dirs::home_dir().map(|home| home.join(".claude").join("settings.json"))
}

/// Get the path to the hook script
fn get_hook_script_path(app_handle: &AppHandle) -> Option<PathBuf> {
    #[cfg(target_os = "windows")]
    let script_name = "bongo-cat-hook.ps1";
    #[cfg(not(target_os = "windows"))]
    let script_name = "bongo-cat-hook.sh";

    // Try current working directory first (works in both dev and some production scenarios)
    if let Ok(current_dir) = std::env::current_dir() {
        let script_path = current_dir.join("hooks").join(script_name);
        if script_path.exists() {
            return Some(script_path);
        }
    }

    // Try resource directory (production mode after packaging)
    if let Ok(resource_dir) = app_handle.path().resource_dir() {
        let script_path = resource_dir.join("hooks").join(script_name);
        if script_path.exists() {
            return Some(script_path);
        }
    }

    // Try executable directory
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            // Try hooks in same directory as executable
            let script_path = exe_dir.join("hooks").join(script_name);
            if script_path.exists() {
                return Some(script_path);
            }

            // Try going up one directory (for macOS .app bundles)
            if let Some(parent_dir) = exe_dir.parent() {
                let script_path = parent_dir.join("hooks").join(script_name);
                if script_path.exists() {
                    return Some(script_path);
                }
            }
        }
    }

    None
}

/// Check the status of Claude hooks configuration
#[tauri::command]
pub fn check_claude_hooks_status(app_handle: AppHandle) -> Result<HookStatus, String> {
    let settings_path = get_claude_settings_path().ok_or("Cannot get home directory")?;
    let hook_script_path = get_hook_script_path(&app_handle);

    let claude_settings_exists = settings_path.exists();
    let hook_script_exists = hook_script_path.as_ref().map(|p| p.exists()).unwrap_or(false);

    let required_hooks = vec![
        "UserPromptSubmit".to_string(),
        "PreToolUse".to_string(),
        "PostToolUse".to_string(),
        "PostToolUseFailure".to_string(),
        "TaskCompleted".to_string(),
        "Stop".to_string(),
    ];

    let mut configured_hooks = Vec::new();

    if claude_settings_exists {
        if let Ok(content) = fs::read_to_string(&settings_path) {
            if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
                if let Some(hooks) = json.get("hooks").and_then(|h| h.as_object()) {
                    for hook_name in &required_hooks {
                        if hooks.contains_key(hook_name) {
                            // Check if it contains bongo-cat hook
                            if let Some(hook_configs) = hooks.get(hook_name).and_then(|h| h.as_array()) {
                                for config in hook_configs {
                                    if let Some(hook_list) = config.get("hooks").and_then(|h| h.as_array()) {
                                        for hook in hook_list {
                                            if let Some(command) = hook.get("command").and_then(|c| c.as_str()) {
                                                if command.contains("bongo-cat-hook") {
                                                    configured_hooks.push(hook_name.clone());
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Consider hooks configured if at least UserPromptSubmit and PreToolUse are configured
    let hooks_configured = configured_hooks.contains(&"UserPromptSubmit".to_string())
        && configured_hooks.contains(&"PreToolUse".to_string());

    Ok(HookStatus {
        claude_settings_exists,
        hooks_configured,
        hook_script_exists,
        required_hooks,
        configured_hooks,
    })
}

/// Install Claude hooks by modifying settings.json
#[tauri::command]
pub fn install_claude_hooks(app_handle: AppHandle) -> Result<String, String> {
    let settings_path = get_claude_settings_path().ok_or("Cannot get home directory")?;
    let hook_script_path = get_hook_script_path(&app_handle)
        .ok_or_else(|| {
            let cwd = std::env::current_dir()
                .map(|p| p.display().to_string())
                .unwrap_or_else(|_| "unknown".to_string());
            format!("Cannot find hook script in current directory: {}. Please ensure hooks directory exists.", cwd)
        })?;

    if !hook_script_path.exists() {
        return Err(format!("Hook script not found at: {:?}", hook_script_path));
    }

    let hook_script_str = hook_script_path
        .to_str()
        .ok_or("Invalid hook script path")?
        .to_string();

    // Create .claude directory if it doesn't exist
    if let Some(parent) = settings_path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create .claude directory: {}", e))?;
    }

    // Read existing settings or create new
    let mut settings: serde_json::Value = if settings_path.exists() {
        let content = fs::read_to_string(&settings_path)
            .map_err(|e| format!("Failed to read settings.json: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse settings.json: {}", e))?
    } else {
        serde_json::json!({})
    };

    // Create backup
    if settings_path.exists() {
        let backup_path = settings_path.with_extension("json.backup");
        fs::copy(&settings_path, &backup_path)
            .map_err(|e| format!("Failed to create backup: {}", e))?;
    }

    // Prepare hook command generator
    let hook_commands = |state: &str| -> serde_json::Value {
        #[cfg(target_os = "windows")]
        let command = format!("powershell -ExecutionPolicy Bypass -File \"{}\" {}", hook_script_str, state);

        #[cfg(not(target_os = "windows"))]
        let command = format!("bash \"{}\" {}", hook_script_str, state);

        serde_json::json!([{
            "hooks": [{
                "type": "command",
                "command": command
            }]
        }])
    };

    // Get or create hooks object
    let hooks = settings
        .as_object_mut()
        .ok_or("Settings is not an object")?
        .entry("hooks")
        .or_insert_with(|| serde_json::json!({}))
        .as_object_mut()
        .ok_or("Hooks is not an object")?;

    // Configure hooks
    hooks.insert("UserPromptSubmit".to_string(), hook_commands("thinking"));

    // Helper to create command string based on platform
    let make_command = |state: &str| -> String {
        #[cfg(target_os = "windows")]
        {
            format!("powershell -ExecutionPolicy Bypass -File \"{}\" {}", hook_script_str, state)
        }
        #[cfg(not(target_os = "windows"))]
        {
            format!("bash \"{}\" {}", hook_script_str, state)
        }
    };

    hooks.insert("PreToolUse".to_string(), serde_json::json!([
        {
            "matcher": "Edit|Write",
            "hooks": [{
                "type": "command",
                "command": make_command("coding")
            }]
        },
        {
            "matcher": "Read|Glob|Grep",
            "hooks": [{
                "type": "command",
                "command": make_command("reading")
            }]
        },
        {
            "matcher": "Bash",
            "hooks": [{
                "type": "command",
                "command": make_command("running")
            }]
        },
        {
            "matcher": "WebSearch",
            "hooks": [{
                "type": "command",
                "command": make_command("searching")
            }]
        }
    ]));

    hooks.insert("PostToolUse".to_string(), hook_commands("idle"));
    hooks.insert("PostToolUseFailure".to_string(), hook_commands("error"));
    hooks.insert("TaskCompleted".to_string(), hook_commands("celebrate"));
    hooks.insert("Stop".to_string(), hook_commands("idle"));

    // Write settings back
    let settings_json = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;

    fs::write(&settings_path, settings_json)
        .map_err(|e| format!("Failed to write settings.json: {}", e))?;

    Ok(format!("Claude hooks installed successfully at {:?}", settings_path))
}

/// Debug command to check paths
#[tauri::command]
pub fn debug_hook_paths(app_handle: AppHandle) -> Result<String, String> {
    let mut info = String::new();

    info.push_str(&format!("Current dir: {:?}\n", std::env::current_dir()));
    info.push_str(&format!("Current exe: {:?}\n", std::env::current_exe()));
    info.push_str(&format!("Resource dir: {:?}\n", app_handle.path().resource_dir()));
    info.push_str(&format!("App config dir: {:?}\n", app_handle.path().app_config_dir()));

    #[cfg(target_os = "windows")]
    let script_name = "bongo-cat-hook.ps1";
    #[cfg(not(target_os = "windows"))]
    let script_name = "bongo-cat-hook.sh";

    info.push_str(&format!("\nLooking for: hooks/{}\n", script_name));

    if let Ok(cwd) = std::env::current_dir() {
        let path = cwd.join("hooks").join(script_name);
        info.push_str(&format!("CWD path: {:?}, exists: {}\n", path, path.exists()));
    }

    if let Some(script_path) = get_hook_script_path(&app_handle) {
        info.push_str(&format!("\nFound script at: {:?}", script_path));
    } else {
        info.push_str("\nScript NOT found!");
    }

    Ok(info)
}

/// Open Claude settings file in default editor
#[tauri::command]
pub fn open_claude_settings() -> Result<(), String> {
    let settings_path = get_claude_settings_path().ok_or("Cannot get home directory")?;

    if !settings_path.exists() {
        return Err(format!("Settings file not found at {:?}", settings_path));
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/C", "start", "", settings_path.to_str().unwrap()])
            .spawn()
            .map_err(|e| format!("Failed to open settings file: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&settings_path)
            .spawn()
            .map_err(|e| format!("Failed to open settings file: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&settings_path)
            .spawn()
            .map_err(|e| format!("Failed to open settings file: {}", e))?;
    }

    Ok(())
}
