#!/bin/bash
# BongoCat Hook Installation Script (macOS/Linux)
# Registers hooks with Claude Code settings

set -e

echo -e "\033[36mInstalling BongoCat hooks...\033[0m"

# Get the absolute path to the hook script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOOK_SCRIPT="$SCRIPT_DIR/../hooks/bongo-cat-hook.sh"
HOOK_SCRIPT=$(cd "$(dirname "$HOOK_SCRIPT")" && pwd)/$(basename "$HOOK_SCRIPT")

if [[ ! -f "$HOOK_SCRIPT" ]]; then
    echo -e "\033[31mError: Hook script not found at: $HOOK_SCRIPT\033[0m"
    exit 1
fi

# Make sure hook script is executable
chmod +x "$HOOK_SCRIPT"

echo -e "\033[90mHook script: $HOOK_SCRIPT\033[0m"

# Claude settings file path
CLAUDE_SETTINGS="$HOME/.claude/settings.json"

# Check if settings file exists
if [[ ! -f "$CLAUDE_SETTINGS" ]]; then
    echo -e "\033[31mError: Claude settings file not found at: $CLAUDE_SETTINGS\033[0m"
    echo -e "\033[33mPlease make sure Claude Code is installed and has been run at least once.\033[0m"
    exit 1
fi

# Backup current settings
cp "$CLAUDE_SETTINGS" "$CLAUDE_SETTINGS.backup"
echo -e "\033[90mBackup created: $CLAUDE_SETTINGS.backup\033[0m"

# Read current settings
SETTINGS=$(cat "$CLAUDE_SETTINGS")

# Build the hooks object with correct format
HOOKS_JSON=$(cat <<EOF
{
  "UserPromptSubmit": [
    {
      "hooks": [
        {"type": "command", "command": "bash $HOOK_SCRIPT thinking"}
      ]
    }
  ],
  "PreToolUse": [
    {
      "matcher": "Edit|Write",
      "hooks": [
        {"type": "command", "command": "bash $HOOK_SCRIPT coding"}
      ]
    },
    {
      "matcher": "Read|Glob|Grep",
      "hooks": [
        {"type": "command", "command": "bash $HOOK_SCRIPT reading"}
      ]
    },
    {
      "matcher": "Bash",
      "hooks": [
        {"type": "command", "command": "bash $HOOK_SCRIPT running"}
      ]
    }
  ],
  "PostToolUse": [
    {
      "matcher": "",
      "hooks": [
        {"type": "command", "command": "bash $HOOK_SCRIPT idle"}
      ]
    }
  ],
  "Stop": [
    {
      "hooks": [
        {"type": "command", "command": "bash $HOOK_SCRIPT idle"}
      ]
    }
  ]
}
EOF
)

# Merge hooks into settings
SETTINGS=$(echo "$SETTINGS" | jq --argjson hooks "$HOOKS_JSON" '.hooks = $hooks')

# Save updated settings
echo "$SETTINGS" | jq '.' > "$CLAUDE_SETTINGS"

echo -e "\n\033[36mRegistered hooks:\033[0m"
echo -e "  \033[32mUserPromptSubmit -> thinking\033[0m"
echo -e "  \033[32mPreToolUse(Edit|Write) -> coding\033[0m"
echo -e "  \033[32mPreToolUse(Read|Glob|Grep) -> reading\033[0m"
echo -e "  \033[32mPreToolUse(Bash) -> running\033[0m"
echo -e "  \033[32mPostToolUse -> idle\033[0m"
echo -e "  \033[32mStop -> idle\033[0m"

echo -e "\n\033[32mHooks installed successfully!\033[0m"
echo -e "\033[33mPlease restart Claude Code for changes to take effect.\033[0m"
echo -e "\n\033[90mStatus file will be written to: $HOME/.claude-cat/status.json\033[0m"
