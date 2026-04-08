# BongoCat Hook Installation Script
# Registers hooks with Claude Code settings

$ErrorActionPreference = "Stop"

Write-Host "Installing BongoCat hooks..." -ForegroundColor Cyan

# Get the absolute path to the hook script
$hookScriptPath = Join-Path $PSScriptRoot "..\hooks\bongo-cat-hook.ps1" | Resolve-Path
Write-Host "Hook script: $hookScriptPath" -ForegroundColor Gray

# Claude settings file path
$claudeSettingsPath = Join-Path $env:USERPROFILE ".claude\settings.json"

# Check if settings file exists
if (-not (Test-Path $claudeSettingsPath)) {
    Write-Error "Claude settings file not found at: $claudeSettingsPath"
    Write-Host "Please make sure Claude Code is installed and has been run at least once." -ForegroundColor Yellow
    exit 1
}

# Read current settings
$settings = Get-Content $claudeSettingsPath -Raw | ConvertFrom-Json

# Initialize hooks object if it doesn't exist
if (-not $settings.hooks) {
    $settings | Add-Member -MemberType NoteProperty -Name "hooks" -Value @{}
}

# Define hook mappings
$hookMappings = @{
    "UserPromptSubmit" = "thinking"
    "PreToolUse(Edit)" = "coding"
    "PreToolUse(Write)" = "coding"
    "PreToolUse(Read)" = "reading"
    "PreToolUse(Glob)" = "reading"
    "PreToolUse(Grep)" = "reading"
    "PreToolUse(Bash)" = "running"
    "PostToolUseFailure" = "error"
    "TaskCompleted" = "celebrate"
    "Stop" = "idle"
}

Write-Host "`nRegistering hooks:" -ForegroundColor Cyan
foreach ($event in $hookMappings.Keys) {
    $state = $hookMappings[$event]
    $hookCommand = "powershell.exe -ExecutionPolicy Bypass -File `"$hookScriptPath`" -State $state"

    $settings.hooks.$event = $hookCommand
    Write-Host "  $event -> $state" -ForegroundColor Green
}

# Save updated settings
$settings | ConvertTo-Json -Depth 10 | Set-Content $claudeSettingsPath -Encoding utf8

Write-Host "`nHooks installed successfully!" -ForegroundColor Green
Write-Host "Please restart Claude Code for changes to take effect." -ForegroundColor Yellow
Write-Host "`nStatus file will be written to: $env:USERPROFILE\.claude-cat\status.json" -ForegroundColor Gray
