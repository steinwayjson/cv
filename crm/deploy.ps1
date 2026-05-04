$ErrorActionPreference = "Stop"
$BUCKET = "work.andrey-mikhaylichenko.ru"
$BUILD_DIR = "dist"

Write-Host "-> Build..." -ForegroundColor Cyan
$ErrorActionPreference = "Continue"
npm run build 2>&1
$ErrorActionPreference = "Stop"
if (!(Test-Path "$BUILD_DIR\index.html")) { Write-Host "FAIL: build" -ForegroundColor Red; exit 1 }
Write-Host "bundle OK" -ForegroundColor Gray

function Get-ContentType($file) {
    switch -Wildcard ($file) {
        "*.html"  { return "text/html; charset=utf-8" }
        "*.css"   { return "text/css; charset=utf-8" }
        "*.js"    { return "application/javascript; charset=utf-8" }
        "*.svg"   { return "image/svg+xml" }
        "*.png"   { return "image/png" }
        "*.jpg"   { return "image/jpeg" }
        "*.webp"  { return "image/webp" }
        "*.woff2" { return "font/woff2" }
        "*.json"  { return "application/json" }
        default   { return "application/octet-stream" }
    }
}

Write-Host "-> Deploy..." -ForegroundColor Cyan

Get-ChildItem -Path $BUILD_DIR -Recurse -File | ForEach-Object {
    $file = $_.FullName
    $key = $_.FullName.Substring((Resolve-Path $BUILD_DIR).Path.Length + 1).Replace("\", "/")
    $ct = Get-ContentType $file
    yc storage s3 cp $file ("s3://" + $BUCKET + "/" + $key) --content-type $ct --quiet
}

Write-Host ("OK: https://" + $BUCKET) -ForegroundColor Green
