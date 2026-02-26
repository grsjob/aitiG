FROM node:20.19.0 AS builder
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --legacy-peer-deps && npm install @rollup/rollup-linux-x64-gnu --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine
RUN apk add --no-cache ca-certificates
COPY --from=builder /app/dist /usr/share/nginx/html
COPY /config/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]