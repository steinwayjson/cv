$ErrorActionPreference = "Stop"
$BUCKET = "work.andrey-mikhaylichenko.ru"
$BUILD_DIR = "dist"
$SECRET_ID = "e6qbtcfos81lm38bv3k4" # Вставь сюда ID из консоли Яндекса

# --- НОВЫЙ БЛОК: Загрузка секретов ---
Write-Host "-> Fetching secrets from Yandex Lockbox..." -ForegroundColor Cyan
try {
    # Получаем JSON и преобразуем его в объект PowerShell
    $secretsJson = yc lockbox payload get --id $SECRET_ID --format json | ConvertFrom-Json
    
    # Проходим по всем записям и создаем переменные окружения в памяти
    foreach ($entry in $secretsJson.entries) {
        $name = $entry.key
        $value = $entry.text_value
        Set-Item -Path "Env:\$name" -Value $value
        # Write-Host "Loaded: $name" -ForegroundColor Gray # Раскомментируй для отладки
    }
    Write-Host "Secrets injected into memory successfully." -ForegroundColor Green
} catch {
    Write-Host "FAIL: Could not fetch secrets. Check 'yc' auth." -ForegroundColor Red
    exit 1
}
# -------------------------------------

Write-Host "-> Build..." -ForegroundColor Cyan
$ErrorActionPreference = "Continue"
npm run build 2>&1
$ErrorActionPreference = "Stop"

if (!(Test-Path "$BUILD_DIR\index.html")) { 
    Write-Host "FAIL: build failed, index.html not found" -ForegroundColor Red
    exit 1 
}
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

Write-Host "-> Deploy to S3 ($BUCKET)..." -ForegroundColor Cyan

Get-ChildItem -Path $BUILD_DIR -Recurse -File | ForEach-Object {
    $file = $_.FullName
    $key = $_.FullName.Substring((Resolve-Path $BUILD_DIR).Path.Length + 1).Replace("\", "/")
    $ct = Get-ContentType $file
    yc storage s3 cp $file ("s3://" + $BUCKET + "/" + $key) --content-type $ct --quiet
}

Write-Host ("OK: https://" + $BUCKET) -ForegroundColor Green