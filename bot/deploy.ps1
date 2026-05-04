param(
    [string]$FunctionName = $env:YC_FUNCTION_NAME,
    [string]$FunctionId = $env:YC_FUNCTION_ID,
    [string]$FolderId = $env:YC_FOLDER_ID,
    [string]$ServiceAccountId = $env:YC_SERVICE_ACCOUNT_ID,
    [string]$Runtime = $(if ($env:YC_RUNTIME) { $env:YC_RUNTIME } else { "nodejs22" }),
    [string]$EntryPoint = $(if ($env:YC_ENTRYPOINT) { $env:YC_ENTRYPOINT } else { "index.handler" }),
    [string]$Memory = $(if ($env:YC_MEMORY) { $env:YC_MEMORY } else { "256MB" }),
    [string]$Timeout = $(if ($env:YC_TIMEOUT) { $env:YC_TIMEOUT } else { "30s" }),
    [switch]$SkipBuild,
    [switch]$SetWebhook
)

$ErrorActionPreference = "Stop"

function Fail($message) {
    Write-Host "FAIL: $message" -ForegroundColor Red
    exit 1
}

function Read-DotEnv($path) {
    $result = @{}
    if (!(Test-Path $path)) { return $result }

    Get-Content $path | ForEach-Object {
        $line = $_.Trim()
        if (!$line -or $line.StartsWith("#")) { return }
        $idx = $line.IndexOf("=")
        if ($idx -le 0) { return }

        $key = $line.Substring(0, $idx).Trim()
        $value = $line.Substring($idx + 1).Trim()
        if (
            ($value.StartsWith('"') -and $value.EndsWith('"')) -or
            ($value.StartsWith("'") -and $value.EndsWith("'"))
        ) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        $result[$key] = $value
    }

    return $result
}

function Get-EnvValue($map, $key, [switch]$Required) {
    if ($map.ContainsKey($key) -and $map[$key]) { return $map[$key] }
    $value = [Environment]::GetEnvironmentVariable($key)
    if ($value) { return $value }
    if ($Required) { Fail "missing $key in .env or process environment" }
    return $null
}

function Get-FunctionIdFromWebhookDomain([string]$webhookDomain) {
    if (!$webhookDomain) { return $null }
    try {
        $uri = [Uri]$webhookDomain
        if ($uri.Host -ne "functions.yandexcloud.net") { return $null }
        $parts = $uri.AbsolutePath.Trim("/").Split("/", [System.StringSplitOptions]::RemoveEmptyEntries)
        if ($parts.Length -lt 1) { return $null }
        return $parts[0]
    } catch {
        return $null
    }
}

function Add-OptionalArg([System.Collections.Generic.List[string]]$argList, [string]$name, [string]$value) {
    if ($value) {
        $argList.Add($name)
        $argList.Add($value)
    }
}

function Add-Args([System.Collections.Generic.List[string]]$argList, [string[]]$values) {
    foreach ($value in $values) {
        $argList.Add($value)
    }
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (!(Get-Command yc -ErrorAction SilentlyContinue)) {
    Fail "yc CLI is not installed or is not in PATH"
}

$envFile = Join-Path $root ".env"
$envMap = Read-DotEnv $envFile

if (!$FunctionName) { $FunctionName = Get-EnvValue $envMap "YC_FUNCTION_NAME" }
if (!$FunctionId) { $FunctionId = Get-EnvValue $envMap "YC_FUNCTION_ID" }
if (!$FunctionId) {
    $webhookDomain = Get-EnvValue $envMap "WEBHOOK_DOMAIN"
    $FunctionId = Get-FunctionIdFromWebhookDomain $webhookDomain
}

if (!$FunctionName -and !$FunctionId) {
    Fail "set YC_FUNCTION_NAME or YC_FUNCTION_ID, or use WEBHOOK_DOMAIN=https://functions.yandexcloud.net/<function_id>"
}

$runtimeEnvKeys = @(
    "BOT_TOKEN",
    "OWNER_CHAT_ID",
    "INTERNAL_SECRET",
    "N8N_VACANCY_WEBHOOK",
    "N8N_CONFIRM_WEBHOOK",
    "N8N_STATUS_WEBHOOK",
    "N8N_FOLLOWUP_WEBHOOK",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_KEY"
)
$optionalRuntimeEnvKeys = @("N8N_TIMEOUT_MS")

$pairs = New-Object System.Collections.Generic.List[string]
foreach ($key in $runtimeEnvKeys) {
    $value = Get-EnvValue $envMap $key -Required
    if ($value.Contains(",")) {
        Fail "$key contains comma, yc --environment comma format cannot safely deploy it. Move this value to Yandex Lockbox or remove comma."
    }
    $pairs.Add("$key=$value")
}
foreach ($key in $optionalRuntimeEnvKeys) {
    $value = Get-EnvValue $envMap $key
    if ($value) {
        if ($value.Contains(",")) { Fail "$key contains comma" }
        $pairs.Add("$key=$value")
    }
}
$environment = [string]::Join(",", $pairs)

if (!$SkipBuild) {
    Write-Host "-> Build bot..." -ForegroundColor Cyan
    npm run build
}

$sourcePath = Join-Path $root "dist"
$indexFile = Join-Path $sourcePath "index.js"
if (!(Test-Path $indexFile)) {
    Fail "dist/index.js not found. Run npm run build first."
}

Write-Host "-> Deploy Yandex Cloud Function version..." -ForegroundColor Cyan
Write-Host "   runtime:    $Runtime" -ForegroundColor DarkGray
Write-Host "   entrypoint: $EntryPoint" -ForegroundColor DarkGray
Write-Host "   memory:     $Memory" -ForegroundColor DarkGray
Write-Host "   timeout:    $Timeout" -ForegroundColor DarkGray
Write-Host "   source:     $sourcePath" -ForegroundColor DarkGray

$ycArgs = New-Object System.Collections.Generic.List[string]
Add-Args $ycArgs @("serverless", "function", "version", "create")
if ($FunctionId) {
    $ycArgs.Add("--function-id")
    $ycArgs.Add($FunctionId)
} else {
    $ycArgs.Add("--function-name")
    $ycArgs.Add($FunctionName)
}
Add-Args $ycArgs @(
    "--runtime", $Runtime,
    "--entrypoint", $EntryPoint,
    "--memory", $Memory,
    "--execution-timeout", $Timeout,
    "--source-path", $sourcePath,
    "--environment", $environment
)

Add-OptionalArg $ycArgs "--folder-id" $FolderId
Add-OptionalArg $ycArgs "--service-account-id" $ServiceAccountId

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
