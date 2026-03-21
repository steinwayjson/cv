#!/bin/bash
BUCKET="andrey-mikhaylichenko.ru"
BUILD_DIR="dist"

upload() {
  local file="$1"
  local key="${file#$BUILD_DIR/}"
  local content_type=""
  case "$file" in
    *.html) content_type="text/html; charset=utf-8" ;;
    *.css)  content_type="text/css; charset=utf-8" ;;
    *.js)   content_type="application/javascript; charset=utf-8" ;;
    *.svg)  content_type="image/svg+xml" ;;
    *.png)  content_type="image/png" ;;
    *.jpg)  content_type="image/jpeg" ;;
    *.webp) content_type="image/webp" ;;
    *.woff2) content_type="font/woff2" ;;
    *.json) content_type="application/json" ;;
    *)      content_type="application/octet-stream" ;;
  esac
  yc storage s3 cp "$file" "s3://${BUCKET}/${key}" \
    --content-type "$content_type" --quiet
}

find "$BUILD_DIR" -type f | while read file; do
  upload "$file"
done

echo "Деплой завершён"