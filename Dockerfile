# node 构建
#FROM node:18.20.2-alpine as build-stage
# 署名
# MAINTAINER Adoin 'adoin@qq.com'
#WORKDIR /app
#COPY ./ ./
# RUN ls
# 设置 node 阿里镜像
#RUN npm config set registry https://registry.npmmirror.com
# 设置--max-old-space-size
#ENV NODE_OPTIONS=--max-old-space-size=1536
# 设置阿里镜像、pnpm、依赖、编译
#RUN npm install pnpm -g
#RUN pnpm install
#RUN pnpm build
# node部分结束
#RUN echo "🎉 编 🎉 译 🎉 成 🎉 功 🎉"
# nginx 部署
FROM nginx:1.18.0 as production-stage
COPY ./dist /home/apps/3x-web
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY ./nginx.conf /etc/nginx/conf.d/3xweb.conf
EXPOSE 80
## 将/usr/share/nginx/html/dist/assets/index.js 和/usr/share/nginx/html/dist/_app.config.js中的"$vg_base_url"替换为环境变量中的VG_BASE_URL,$vg_sub_domain 替换成VG_SUB_DOMAIN，$vg_default_user替换成VG_DEFAULT_USER，$vg_default_password替换成VG_DEFAULT_PASSWORD 而后启动nginx
CMD ["nginx", "-g", "daemon off;"]
