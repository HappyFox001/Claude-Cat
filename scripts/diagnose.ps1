# BongoCat Diagnostic Script
# Checks if everything is set up correctly

$ErrorActionPreference = "Continue"

Write-Host "`n=== BongoCat Diagnostic ===" -ForegroundColor Cyan

# 1. Check Claude settings
Write-Host "`n[1] Checking Claude settings..." -ForegroundColor Yellow
$claudeSettingsPath = Join-Path $env:USERPROFILE ".claude\settings.json"
if (Test-Path $claudeSettingsPath) {
    Write-Host "  ✓ Claude settings file exists" -ForegroundColor Green

    $settings = Get-Content $claudeSettingsPath -Raw | ConvertFrom-Json
    if ($settings.hooks) {
        $hookCount = ($settings.hooks.PSObject.Properties | Where-Object { $_.Value -like "*bongo-cat*" }).Count
        Write-Host "  ✓ Found $hookCount BongoCat hook(s)" -ForegroundColor Green

        $settings.hooks.PSObject.Properties | Where-Object { $_.Value -like "*bongo-cat*" } | ForEach-Object {
            Write-Host "    - $($_.Name)" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ✗ No hooks found in settings" -ForegroundColor Red
        Write-Host "    Run: .\scripts\install-hooks.ps1" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✗ Claude settings file not found" -ForegroundColor Red
    Write-Host "    Expected: $claudeSettingsPath" -ForegroundColor Yellow
}

# 2. Check hook script
Write-Host "`n[2] Checking hook script..." -ForegroundColor Yellow
$hookScriptPath = Join-Path $PSScriptRoot "..\hooks\bongo-cat-hook.ps1"
if (Test-Path $hookScriptPath) {
    Write-Host "  ✓ Hook script exists: $hookScriptPath" -ForegroundColor Green
} else {
    Write-Host "  ✗ Hook script not found" -ForegroundColor Red
}

# 3. Check status directory
Write-Host "`n[3] Checking status directory..." -ForegroundColor Yellow
$statusDir = Join-Path $env:USERPROFILE ".bongo-cat"
if (Test-Path $statusDir) {
    Write-Host "  ✓ Status directory exists: $statusDir" -ForegroundColor Green

    $statusFile = Join-Path $statusDir "status.json"
    if (Test-Path $statusFile) {
        Write-Host "  ✓ Status file exists" -ForegroundColor Green
        $content = Get-Content $statusFile -Raw
        Write-Host "    Content: $content" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠ Status file not created yet" -ForegroundColor Yellow
        Write-Host "    Will be created when Claude triggers an event" -ForegroundColor Gray
    }
} else {
    Write-Host "  ⚠ Status directory not created yet" -ForegroundColor Yellow
    Write-Host "    Will be created on first hook trigger" -ForegroundColor Gray
}

# 4. Test hook script
Write-Host "`n[4] Testing hook script..." -ForegroundColor Yellow
try {
    & $hookScriptPath -State "thinking"
    Write-Host "  ✓ Hook script executed successfully" -ForegroundColor Green

    Start-Sleep -Milliseconds 500

    $statusFile = Join-Path $statusDir "status.json"
    if (Test-Path $statusFile) {
        $content = Get-Content $statusFile -Raw
        Write-Host "  ✓ Status file created/updated" -ForegroundColor Green
        Write-Host "    Content: $content" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ✗ Hook script failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Check Rust dependencies
Write-Host "`n[5] Checking Rust project..." -ForegroundColor Yellow
$cargoTomlPath = Join-Path $PSScriptRoot "..\src-tauri\Cargo.toml"
if (Test-Path $cargoTomlPath) {
    Write-Host "  ✓ Cargo.toml exists" -ForegroundColor Green

    $cargoContent = Get-Content $cargoTomlPath -Raw
    if ($cargoContent -match 'dirs\s*=') {
        Write-Host "  ✓ 'dirs' dependency found" -ForegroundColor Green
    } else {
        Write-Host "  ✗ 'dirs' dependency missing" -ForegroundColor Red
    }

    if ($cargoContent -match 'log\s*=') {
        Write-Host "  ✓ 'log' dependency found" -ForegroundColor Green
    } else {
        Write-Host "  ✗ 'log' dependency missing" -ForegroundColor Red
    }
}

# 6. Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "To start BongoCat properly, run:" -ForegroundColor Yellow
Write-Host "  pnpm tauri dev" -ForegroundColor Green
Write-Host "`nOr on Windows:" -ForegroundColor Yellow
Write-Host "  pnpm tauri dev" -ForegroundColor Green
Write-Host "`nTo test the hook manually:" -ForegroundColor Yellow
Write-Host "  .\hooks\bongo-cat-hook.ps1 -State thinking" -ForegroundColor Green
Write-Host "`nTo monitor the status file:" -ForegroundColor Yellow
Write-Host "  Get-Content ~\.bongo-cat\status.json -Wait" -ForegroundColor Green
Write-Host ""
