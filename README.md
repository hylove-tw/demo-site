# HyLove Demo Site v2

https://hylove-demo.good-nas.cc
admin / lovehy2025

主要更新：
- 安全性問題修正（密碼改成伺服器端驗證）
- 多使用者暫存功能，為多人社交平台demo準備（記錄在個人瀏覽器）
- 檔案暫存功能（記錄在個人瀏覽器）
- 分析結果暫存功能（記錄在個人瀏覽器）

## Deploy
### build image
```bash
# create a builder (for apple silicon)
docker buildx create --use --name mybuilder

# login to docker hub
docker login

# build image
docker buildx build --platform linux/amd64,linux/arm64 -t p988744/hylove-demo:2.1 -t p988744/hylove-demo:latest . --push

# prepare nginx basic auth file (Optional)
htpasswd -c ./nginx/.htpasswd admin
export HTPASSWD_PATH=$(pwd)/nginx/.htpasswd 

# run with docker-compose `docker-compose-prod.yml`
docker compose up -f docker-compose-prod.yml
```

## Extra
### setup cloudflare Tunnel
`網路` > `Tunnels` > `設定` > `公用主機名稱`