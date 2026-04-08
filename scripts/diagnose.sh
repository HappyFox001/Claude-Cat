#!/bin/bash
# BongoCat Diagnostic Script (macOS/Linux)
# Checks if everything is set up correctly

echo -e "\n\033[36m=== BongoCat Diagnostic ===\033[0m"

# 1. Check Claude settings
echo -e "\n\033[33m[1] Checking Claude settings...\033[0m"
CLAUDE_SETTINGS="$HOME/.claude/settings.json"
if [[ -f "$CLAUDE_SETTINGS" ]]; then
    echo -e "  \033[32m✓ Claude settings file exists\033[0m"

    HOOK_COUNT=$(jq -r '.hooks | to_entries[] | select(.value | contains("bongo-cat")) | .key' "$CLAUDE_SETTINGS" 2>/dev/null | wc -l | tr -d ' ')
    echo -e "  \033[32m✓ Found $HOOK_COUNT BongoCat hook(s)\033[0m"

    jq -r '.hooks | to_entries[] | select(.value | contains("bongo-cat")) | "    - \(.key)"' "$CLAUDE_SETTINGS" 2>/dev/null | while read -r line; do
        echo -e "\033[90m$line\033[0m"
    done
else
    echo -e "  \033[31m✗ Claude settings file not found\033[0m"
    echo -e "    \033[33mExpected: $CLAUDE_SETTINGS\033[0m"
fi

# 2. Check hook script
echo -e "\n\033[33m[2] Checking hook script...\033[0m"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOOK_SCRIPT="$SCRIPT_DIR/../hooks/bongo-cat-hook.sh"
if [[ -f "$HOOK_SCRIPT" ]]; then
    echo -e "  \033[32m✓ Hook script exists: $HOOK_SCRIPT\033[0m"
    if [[ -x "$HOOK_SCRIPT" ]]; then
        echo -e "  \033[32m✓ Hook script is executable\033[0m"
    else
        echo -e "  \033[31m✗ Hook script is not executable\033[0m"
        echo -e "    \033[33mRun: chmod +x $HOOK_SCRIPT\033[0m"
    fi
else
    echo -e "  \033[31m✗ Hook script not found\033[0m"
fi

# 3. Check status directory
echo -e "\n\033[33m[3] Checking status directory...\033[0m"
STATUS_DIR="$HOME/.claude-cat"
if [[ -d "$STATUS_DIR" ]]; then
    echo -e "  \033[32m✓ Status directory exists: $STATUS_DIR\033[0m"

    STATUS_FILE="$STATUS_DIR/status.json"
    if [[ -f "$STATUS_FILE" ]]; then
        echo -e "  \033[32m✓ Status file exists\033[0m"
        CONTENT=$(cat "$STATUS_FILE")
        echo -e "    \033[90mContent: $CONTENT\033[0m"
    else
        echo -e "  \033[33m⚠ Status file not created yet\033[0m"
        echo -e "    \033[90mWill be created when Claude triggers an event\033[0m"
    fi
else
    echo -e "  \033[33m⚠ Status directory not created yet\033[0m"
    echo -e "    \033[90mWill be created on first hook trigger\033[0m"
fi

# 4. Test hook script
echo -e "\n\033[33m[4] Testing hook script...\033[0m"
if [[ -f "$HOOK_SCRIPT" && -x "$HOOK_SCRIPT" ]]; then
    "$HOOK_SCRIPT" "thinking" 2>&1
    echo -e "  \033[32m✓ Hook script executed successfully\033[0m"

    sleep 0.5

    STATUS_FILE="$STATUS_DIR/status.json"
    if [[ -f "$STATUS_FILE" ]]; then
        CONTENT=$(cat "$STATUS_FILE")
        echo -e "  \033[32m✓ Status file created/updated\033[0m"
        echo -e "    \033[90mContent: $CONTENT\033[0m"
    fi
else
    echo -e "  \033[31m✗ Cannot test hook script\033[0m"
fi

# 5. Check Rust dependencies
echo -e "\n\033[33m[5] Checking Rust project...\033[0m"
CARGO_TOML="$SCRIPT_DIR/../src-tauri/Cargo.toml"
if [[ -f "$CARGO_TOML" ]]; then
    echo -e "  \033[32m✓ Cargo.toml exists\033[0m"

    if grep -q 'dirs\s*=' "$CARGO_TOML"; then
        echo -e "  \033[32m✓ 'dirs' dependency found\033[0m"
    else
        echo -e "  \033[31m✗ 'dirs' dependency missing\033[0m"
    fi

    if grep -q 'log\s*=' "$CARGO_TOML"; then
        echo -e "  \033[32m✓ 'log' dependency found\033[0m"
    else
        echo -e "  \033[31m✗ 'log' dependency missing\033[0m"
    fi
fi

# 6. Summary
echo -e "\n\033[36m=== Summary ===\033[0m"
echo -e "\033[33mTo start BongoCat properly, run:\033[0m"
echo -e "  \033[32mpnpm dev\033[0m"
echo -e "\n\033[33mTo test the hook manually:\033[0m"
echo -e "  \033[32m./hooks/bongo-cat-hook.sh thinking\033[0m"
echo -e "\n\033[33mTo monitor the status file:\033[0m"
echo -e "  \033[32mtail -f ~/.claude-cat/status.json\033[0m"
echo ""
