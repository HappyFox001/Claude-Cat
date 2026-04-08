# Claude Cat Hook Script
# Maps Claude Code events to expression states

param(
    [Parameter(Mandatory=$true)]
    [string]$State
)

# Validate state parameter
$validStates = @('idle', 'thinking', 'coding', 'reading', 'running', 'error', 'celebrate')
if ($State -notin $validStates) {
    Write-Error "Invalid state: $State. Must be one of: $($validStates -join ', ')"
    exit 1
}

# Create status directory if it doesn't exist
$statusDir = Join-Path $env:USERPROFILE ".claude-cat"
if (-not (Test-Path $statusDir)) {
    New-Item -ItemType Directory -Path $statusDir -Force | Out-Null
}

# Prepare status data
$statusData = @{
    state = $State
    timestamp = [int][double]::Parse((Get-Date -UFormat %s))
} | ConvertTo-Json -Compress

# Write to temporary file first (atomic operation)
$statusFile = Join-Path $statusDir "status.json"
$tempFile = Join-Path $statusDir "status.json.tmp"

$statusData | Out-File -FilePath $tempFile -Encoding utf8 -NoNewline
Move-Item -Path $tempFile -Destination $statusFile -Force
