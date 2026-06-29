FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY packages/shared-ui ./packages/shared-ui
COPY apps/restaurant-app ./apps/restaurant-app

RUN npm install --legacy-peer-deps

WORKDIR /app/apps/restaurant-app
RUN npm run build

FROM nginx:1.27-alpine
RUN apk add --no-cache wget
COPY --from=build /app/apps/restaurant-app/dist /usr/share/nginx/html
COPY apps/restaurant-app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://0.0.0.0/health || exit 1
CMD ["nginx", "-g", "daemon off;"]