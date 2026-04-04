#!/bin/bash
# BongoCat Hook Uninstallation Script (macOS/Linux)
# Removes hooks from Claude Code settings

set -e

echo -e "\033[36mUninstalling BongoCat hooks...\033[0m"

# Claude settings file path
CLAUDE_SETTINGS="$HOME/.claude/settings.json"

# Check if settings file exists
if [[ ! -f "$CLAUDE_SETTINGS" ]]; then
    echo -e "\033[33mWarning: Claude settings file not found at: $CLAUDE_SETTINGS\033[0m"
    exit 0
fi

# Read current settings
SETTINGS=$(cat "$CLAUDE_SETTINGS")

# Remove all BongoCat hooks
HOOK_EVENTS=(
    "UserPromptSubmit"
    "PreToolUse(Edit)"
    "PreToolUse(Write)"
    "PreToolUse(Read)"
    "PreToolUse(Glob)"
    "PreToolUse(Grep)"
    "PreToolUse(Bash)"
    "PostToolUseFailure"
    "TaskCompleted"
    "Stop"
)

REMOVED_COUNT=0
for EVENT in "${HOOK_EVENTS[@]}"; do
    # Check if hook exists and contains "bongo-cat"
    if echo "$SETTINGS" | jq -e ".hooks[\"$EVENT\"]" > /dev/null 2>&1; then
        HOOK_VALUE=$(echo "$SETTINGS" | jq -r ".hooks[\"$EVENT\"]")
        if [[ "$HOOK_VALUE" == *"bongo-cat"* ]]; then
            SETTINGS=$(echo "$SETTINGS" | jq "del(.hooks[\"$EVENT\"])")
            echo -e "  \033[33mRemoved: $EVENT\033[0m"
            ((REMOVED_COUNT++))
        fi
    fi
done

# Save updated settings
echo "$SETTINGS" | jq '.' > "$CLAUDE_SETTINGS"

echo -e "\n\033[32mRemoved $REMOVED_COUNT hook(s).\033[0m"
echo -e "\033[33mPlease restart Claude Code for changes to take effect.\033[0m"
