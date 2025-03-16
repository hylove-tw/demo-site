#!/bin/sh

if [ "$ENABLE_AUTH" = "true" ] && [ -f /etc/nginx/.htpasswd ]; then
  echo "Enabling Basic Auth"
  export AUTH_CONFIG='auth_basic "Restricted Content"; auth_basic_user_file /etc/nginx/.htpasswd;'
else
  echo "Basic Auth not enabled"
  export AUTH_CONFIG=''
fi

# 使用 envsubst 將 nginx.conf.template 中的 $AUTH_CONFIG 變數替換掉，生成 nginx.conf
envsubst '$AUTH_CONFIG' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# 啟動 Nginx
exec nginx -g 'daemon off;'