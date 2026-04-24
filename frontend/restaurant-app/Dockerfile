FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --frozen-lockfile

# Copy source code
COPY . .

# Build arguments for API URLs
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL:-/api}
ARG VITE_WS_URL
ENV VITE_WS_URL=${VITE_WS_URL:-/ws}
ARG VITE_APP_NAME="Pecafoo"
ENV VITE_APP_NAME=$VITE_APP_NAME

# Build the app
RUN npm run build

# Production stage
FROM nginx:1.27-alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf.bak

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
