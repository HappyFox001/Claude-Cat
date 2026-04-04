# BongoCat Hook Uninstallation Script
# Removes hooks from Claude Code settings

$ErrorActionPreference = "Stop"

Write-Host "Uninstalling BongoCat hooks..." -ForegroundColor Cyan

# Claude settings file path
$claudeSettingsPath = Join-Path $env:USERPROFILE ".claude\settings.json"

# Check if settings file exists
if (-not (Test-Path $claudeSettingsPath)) {
    Write-Warning "Claude settings file not found at: $claudeSettingsPath"
    exit 0
}

# Read current settings
$settings = Get-Content $claudeSettingsPath -Raw | ConvertFrom-Json

# Remove all BongoCat hooks
$hookEvents = @(
    "UserPromptSubmit",
    "PreToolUse(Edit)",
    "PreToolUse(Write)",
    "PreToolUse(Read)",
    "PreToolUse(Glob)",
    "PreToolUse(Grep)",
    "PreToolUse(Bash)",
    "PostToolUseFailure",
    "TaskCompleted",
    "Stop"
)

$removedCount = 0
if ($settings.hooks) {
    foreach ($event in $hookEvents) {
        if ($settings.hooks.$event -and $settings.hooks.$event -like "*bongo-cat-hook.ps1*") {
            $settings.hooks.PSObject.Properties.Remove($event)
            $removedCount++
            Write-Host "  Removed: $event" -ForegroundColor Yellow
        }
    }
}

# Save updated settings
$settings | ConvertTo-Json -Depth 10 | Set-Content $claudeSettingsPath -Encoding utf8

Write-Host "`nRemoved $removedCount hook(s)." -ForegroundColor Green
Write-Host "Please restart Claude Code for changes to take effect." -ForegroundColor Yellow
