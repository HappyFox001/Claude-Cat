#!/bin/bash

# Test script to cycle through different Claude Code states
# This helps verify that the cat expression changes are working

HOOK_SCRIPT="$(dirname "$0")/bongo-cat-hook.sh"

echo "🐱 Testing BongoCat Expression System"
echo "======================================"
echo ""

# Array of states to test
STATES=("idle" "thinking" "coding" "reading" "running" "error" "celebrate")

for STATE in "${STATES[@]}"; do
    echo "Testing state: $STATE"
    bash "$HOOK_SCRIPT" "$STATE"
    
    # Show current status file content
    cat ~/.claude-cat/status.json
    echo ""
    
    # Wait 3 seconds before next state
    sleep 3
done

echo "✅ Test complete! Check your BongoCat window."
echo "The cat should have cycled through all expressions."
