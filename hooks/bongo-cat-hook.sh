#!/bin/bash

# BongoCat Hook Script
# This script is called by Claude Code hooks to update the cat's expression

STATE=${1:-idle}
STATUS_DIR="$HOME/.bongo-cat"
STATUS_FILE="$STATUS_DIR/status.json"

# Create directory if it doesn't exist
mkdir -p "$STATUS_DIR"

# Get current timestamp (Unix epoch in seconds)
TIMESTAMP=$(date +%s)

# Write status to JSON file
cat > "$STATUS_FILE" << INNER_EOF
{"state":"$STATE","timestamp":$TIMESTAMP}
INNER_EOF

# Optional: Log for debugging (uncomment to enable)
# echo "[$(date)] BongoCat Hook: state=$STATE, timestamp=$TIMESTAMP" >> "$STATUS_DIR/hook.log"
