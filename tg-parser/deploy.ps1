$FunctionName = "work-parser"
$SecretId = "e6qbtcfos81lm38bv3k4"
$SecretVersionId = "e6qhp9gugn09innhdl6j"

Write-Host "-> Build..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAIL: build" -ForegroundColor Red
    exit 1
}

Write-Host "   bundle OK" -ForegroundColor Gray

if (Test-Path work-parser.zip) {
    Remove-Item work-parser.zip -Force
}

Push-Location dist
Compress-Archive -Path index.js -DestinationPath ..\work-parser.zip -Force
Pop-Location

Write-Host "-> Deploy..." -ForegroundColor Cyan

$ycArgs = @(
    "serverless", "function", "version", "create",
    "--function-name", $FunctionName,
    "--runtime", "nodejs22",
    "--entrypoint", "index.handler",
    "--memory", "256m",
    "--execution-timeout", "60s",
    "--source-path", "work-parser.zip",
    "--network-name", "default",

    "--secret", "id=$SecretId,version-id=$SecretVersionId,key=SUPABASE_URL,environment-variable=SUPABASE_URL",
    "--secret", "id=$SecretId,version-id=$SecretVersionId,key=SUPABASE_SERVICE_KEY,environment-variable=SUPABASE_SERVICE_KEY",
    "--secret", "id=$SecretId,version-id=$SecretVersionId,key=INTERNAL_SECRET,environment-variable=INTERNAL_SECRET",
    "--service-account-id", "ajeg4379g4lmrk423t7j"
)

& yc @ycArgs

if ($LASTEXITCODE -ne 0) {
    Write-Host "FAIL: deploy" -ForegroundColor Red
    exit 1
}

Remove-Item work-parser.zip -Force

Write-Host "OK: done" -ForegroundColor Green
