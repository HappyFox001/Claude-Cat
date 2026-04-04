#!/bin/bash
# BongoCat Claude Code Hook (macOS/Linux)
# Maps Claude Code events to expression states

set -e

# Validate state parameter
STATE=$1
VALID_STATES=("idle" "thinking" "coding" "reading" "running" "error" "celebrate")

if [[ -z "$STATE" ]]; then
    echo "Error: State parameter required"
    echo "Usage: $0 <state>"
    echo "Valid states: ${VALID_STATES[*]}"
    exit 1
fi

# Check if state is valid
if [[ ! " ${VALID_STATES[@]} " =~ " ${STATE} " ]]; then
    echo "Error: Invalid state: $STATE"
    echo "Valid states: ${VALID_STATES[*]}"
    exit 1
fi

# Create status directory if it doesn't exist
STATUS_DIR="$HOME/.bongo-cat"
mkdir -p "$STATUS_DIR"

# Prepare status data
TIMESTAMP=$(date +%s)
STATUS_DATA="{\"state\":\"$STATE\",\"timestamp\":$TIMESTAMP}"

# Write to temporary file first (atomic operation)
STATUS_FILE="$STATUS_DIR/status.json"
TEMP_FILE="$STATUS_DIR/status.json.tmp"

echo "$STATUS_DATA" > "$TEMP_FILE"
mv -f "$TEMP_FILE" "$STATUS_FILE"
