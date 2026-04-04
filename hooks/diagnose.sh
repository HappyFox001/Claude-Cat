#!/bin/bash

echo "🔍 BongoCat Diagnostic Tool"
echo "==========================="
echo ""

# 1. Check if hook script exists and is executable
echo "1. Checking hook script..."
HOOK_PATH="/Users/0xhacker/Desktop/work/DeskSpirit/Cat/hooks/bongo-cat-hook.sh"
if [ -x "$HOOK_PATH" ]; then
    echo "   ✅ Hook script exists and is executable"
else
    echo "   ❌ Hook script missing or not executable"
fi
echo ""

# 2. Check if status directory exists
echo "2. Checking status directory..."
if [ -d "$HOME/.bongo-cat" ]; then
    echo "   ✅ Status directory exists"
else
    echo "   ❌ Status directory missing"
fi
echo ""

# 3. Check if status file exists and is readable
echo "3. Checking status file..."
if [ -f "$HOME/.bongo-cat/status.json" ]; then
    echo "   ✅ Status file exists"
    echo "   Current content:"
    cat "$HOME/.bongo-cat/status.json"
else
    echo "   ❌ Status file missing"
fi
echo ""

# 4. Test hook script
echo "4. Testing hook script..."
bash "$HOOK_PATH" "thinking"
if [ $? -eq 0 ]; then
    echo "   ✅ Hook script executed successfully"
    echo "   Updated status:"
    cat "$HOME/.bongo-cat/status.json"
else
    echo "   ❌ Hook script failed to execute"
fi
echo ""

# 5. Check Claude Code settings
echo "5. Checking Claude Code hooks configuration..."
if grep -q "Cat/hooks/bongo-cat-hook.sh" "$HOME/.claude/settings.json" 2>/dev/null; then
    echo "   ✅ Claude Code hooks configured correctly"
else
    echo "   ⚠️  Claude Code hooks may need updating"
    echo "   Check ~/.claude/settings.json"
fi
echo ""

# 6. Check if BongoCat app is running
echo "6. Checking if BongoCat app is running..."
if pgrep -f "Cat" > /dev/null; then
    echo "   ✅ App appears to be running"
else
    echo "   ⚠️  App may not be running"
    echo "   Start the app from: /Users/0xhacker/Desktop/work/DeskSpirit/Cat"
fi
echo ""

echo "==========================="
echo "Diagnostic complete!"
echo ""
echo "To manually test expressions, run:"
echo "  bash /Users/0xhacker/Desktop/work/DeskSpirit/Cat/hooks/test-expressions.sh"
