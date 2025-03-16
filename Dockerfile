# Stage 1: Build React App
FROM node:16-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Use Nginx to serve the built app with optional Basic Auth
FROM nginx:alpine

# 複製建構出來的靜態檔案
COPY --from=build /app/build /usr/share/nginx/html

# 複製自訂的 Nginx 配置模板
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# 複製 entrypoint 腳本並設定權限
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]