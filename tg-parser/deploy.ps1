$FunctionName = "work-parser"

Write-Host "-> Build..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "FAIL: build" -ForegroundColor Red; exit 1 }
Write-Host "   bundle OK" -ForegroundColor Gray

if (Test-Path work-parser.zip) { Remove-Item work-parser.zip -Force }
Push-Location dist
Compress-Archive -Path index.js -DestinationPath ..\work-parser.zip -Force
Pop-Location

$envArgs = @()
Get-Content .env | Where-Object { $_ -match "^\s*[^#]\w+=.+" } | ForEach-Object {
    $line = $_.Trim()
    if ($line -match "^(\w+)=(.+)$") {
        $key = $Matches[1]
        $val = $Matches[2].Trim([char]39).Trim([char]34)
        $envArgs += "--environment"
        $envArgs += "$key=$val"
    }
}

Write-Host "-> Deploy..." -ForegroundColor Cyan
$ycArgs = @(
    "serverless", "function", "version", "create",
    "--function-name", $FunctionName,
    "--runtime", "nodejs22",
    "--entrypoint", "index.handler",
    "--memory", "256m",
    "--execution-timeout", "60s",
    "--source-path", "work-parser.zip",
    "--network-name", "default"
) + $envArgs

& yc @ycArgs
if ($LASTEXITCODE -ne 0) { Write-Host "FAIL: deploy" -ForegroundColor Red; exit 1 }

Remove-Item work-parser.zip -Force
Write-Host "OK: done" -ForegroundColor Green