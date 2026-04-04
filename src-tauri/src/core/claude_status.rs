use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter, Runtime};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClaudeStatus {
    pub state: String,
    pub timestamp: u64,
}

const POLL_INTERVAL_MS: u64 = 500;
const IDLE_TIMEOUT_SECONDS: u64 = 30;

pub struct StatusWatcher {
    status_path: PathBuf,
    last_status: Arc<Mutex<Option<ClaudeStatus>>>,
}

impl StatusWatcher {
    pub fn new() -> Self {
        let home_dir = dirs::home_dir().expect("Failed to get home directory");
        let status_path = home_dir.join(".bongo-cat").join("status.json");

        Self {
            status_path,
            last_status: Arc::new(Mutex::new(None)),
        }
    }

    fn read_status(&self) -> Option<ClaudeStatus> {
        if !self.status_path.exists() {
            return None;
        }

        match fs::read_to_string(&self.status_path) {
            Ok(content) => {
                // Remove BOM if present (PowerShell UTF-8 with BOM)
                let content = content.trim_start_matches('\u{feff}');

                match serde_json::from_str::<ClaudeStatus>(content) {
                    Ok(status) => Some(status),
                    Err(e) => {
                        log::warn!("Failed to parse status file: {}", e);
                        None
                    }
                }
            }
            Err(e) => {
                log::warn!("Failed to read status file: {}", e);
                None
            }
        }
    }

    fn get_current_timestamp() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs()
    }

    fn should_emit_update(&self, new_status: &ClaudeStatus) -> bool {
        let last_status = self.last_status.lock().unwrap();

        match &*last_status {
            None => true,
            Some(last) => {
                // Emit if state changed
                last.state != new_status.state ||
                // Or if timestamp is significantly different
                last.timestamp.abs_diff(new_status.timestamp) > 1
            }
        }
    }

    pub fn start_watching<R: Runtime>(&self, app_handle: AppHandle<R>) {
        let status_path = self.status_path.clone();
        let last_status = self.last_status.clone();

        thread::spawn(move || {
            log::info!("Started Claude status watcher");
            log::info!("Watching: {:?}", status_path);

            loop {
                thread::sleep(Duration::from_millis(POLL_INTERVAL_MS));

                let watcher = StatusWatcher {
                    status_path: status_path.clone(),
                    last_status: last_status.clone(),
                };

                if let Some(status) = watcher.read_status() {
                    let current_time = Self::get_current_timestamp();
                    let age = current_time.saturating_sub(status.timestamp);

                    // Check if status is too old (timeout)
                    if age > IDLE_TIMEOUT_SECONDS {
                        let idle_status = ClaudeStatus {
                            state: "idle".to_string(),
                            timestamp: current_time,
                        };

                        if watcher.should_emit_update(&idle_status) {
                            log::info!("Status timeout - switching to idle");
                            let _ = app_handle.emit("claude-state-change", idle_status.clone());
                            *last_status.lock().unwrap() = Some(idle_status);
                        }
                    } else if watcher.should_emit_update(&status) {
                        log::info!("State changed: {}", status.state);
                        let _ = app_handle.emit("claude-state-change", status.clone());
                        *last_status.lock().unwrap() = Some(status);
                    }
                }
            }
        });
    }
}
