param(
    [string]$FunctionId = "d4epmr0826o14tll2giq",
    [string]$LockboxSecretId = "e6qbtcfos81lm38bv3k4",
    [string]$ServiceAccountId = "ajeg4379g4lmrk423t7j",
  

    [string]$Runtime = "nodejs22",
    [string]$EntryPoint = "index.handler",
    [string]$Memory = "256MB",
    [string]$Timeout = "30s",

    [switch]$SkipBuild,
    [switch]$SetWebhook
)

$ErrorActionPreference = "Stop"

function Fail($message) {
    Write-Host "FAIL: $message" -ForegroundColor Red
    exit 1
}

function Add-Args(
    [System.Collections.Generic.List[string]]$argList,
    [string[]]$values
) {
    foreach ($value in $values) {
        $argList.Add($value)
    }
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (!(Get-Command yc -ErrorAction SilentlyContinue)) {
    Fail "yc CLI is not installed or is not in PATH"
}

if (!$SkipBuild) {
    Write-Host "-> Build bot..." -ForegroundColor Cyan

    npm run build

    if ($LASTEXITCODE -ne 0) {
        Fail "npm build failed"
    }
}

$sourcePath = Join-Path $root "dist"
$indexFile = Join-Path $sourcePath "index.js"

if (!(Test-Path $indexFile)) {
    Fail "dist/index.js not found"
}

Write-Host "-> Deploy Yandex Cloud Function version..." -ForegroundColor Cyan
Write-Host "   function:   $FunctionId" -ForegroundColor DarkGray
Write-Host "   runtime:    $Runtime" -ForegroundColor DarkGray
Write-Host "   entrypoint: $EntryPoint" -ForegroundColor DarkGray
Write-Host "   memory:     $Memory" -ForegroundColor DarkGray
Write-Host "   timeout:    $Timeout" -ForegroundColor DarkGray
Write-Host "   source:     $sourcePath" -ForegroundColor DarkGray
Write-Host "   lockbox:    $LockboxSecretId" -ForegroundColor DarkGray

$ycArgs = New-Object System.Collections.Generic.List[string]

Add-Args $ycArgs @(
    "serverless",
    "function",
    "version",
    "create",

    "--function-id", $FunctionId,
    "--service-account-id", $ServiceAccountId,

    "--runtime", $Runtime,
    "--entrypoint", $EntryPoint,
    "--memory", $Memory,
    "--execution-timeout", $Timeout,

    "--source-path", $sourcePath,
    "--network-name", "default",

    "--environment",
    "NODE_OPTIONS=--enable-source-maps",

    "--secret", "id=$LockboxSecretId,key=BOT_TOKEN,environment-variable=BOT_TOKEN",
    "--secret", "id=$LockboxSecretId,key=OWNER_CHAT_ID,environment-variable=OWNER_CHAT_ID",
    "--secret", "id=$LockboxSecretId,key=INTERNAL_SECRET,environment-variable=INTERNAL_SECRET",

    "--secret", "id=$LockboxSecretId,key=N8N_VACANCY_WEBHOOK,environment-variable=N8N_VACANCY_WEBHOOK",
    "--secret", "id=$LockboxSecretId,key=N8N_CONFIRM_WEBHOOK,environment-variable=N8N_CONFIRM_WEBHOOK",
    "--secret", "id=$LockboxSecretId,key=N8N_STATUS_WEBHOOK,environment-variable=N8N_STATUS_WEBHOOK",
    "--secret", "id=$LockboxSecretId,key=N8N_FOLLOWUP_WEBHOOK,environment-variable=N8N_FOLLOWUP_WEBHOOK",

    "--secret", "id=$LockboxSecretId,key=SUPABASE_URL,environment-variable=SUPABASE_URL",
    "--secret", "id=$LockboxSecretId,key=SUPABASE_SERVICE_KEY,environment-variable=SUPABASE_SERVICE_KEY"
)

& yc @ycArgs

if ($LASTEXITCODE -ne 0) {
    Fail "yc function version create failed"
}

Write-Host "OK: function version deployed" -ForegroundColor Green

if ($SetWebhook) {
    Write-Host "-> Set Telegram webhook..." -ForegroundColor Cyan

    npm run setup-webhook

    if ($LASTEXITCODE -ne 0) {
        Fail "setup-webhook failed"
    }

    Write-Host "OK: webhook updated" -ForegroundColor Green
}