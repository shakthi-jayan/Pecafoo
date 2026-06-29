FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build arguments for API URLs
ARG VITE_API_BASE_URL=https://api.pecafoo.com/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ARG VITE_WS_BASE_URL=wss://api.pecafoo.com/ws
ENV VITE_WS_BASE_URL=$VITE_WS_BASE_URL
ARG VITE_APP_NAME="Pecafoo"
ENV VITE_APP_NAME=$VITE_APP_NAME

# Firebase arguments
ARG VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID
ENV VITE_FIREBASE_MEASUREMENT_ID=$VITE_FIREBASE_MEASUREMENT_ID
ARG VITE_RAZORPAY_KEY_ID
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID
ARG VITE_GOOGLE_MAPS_API_KEY
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
ARG VITE_CUSTOMER_APP_URL=https://pecafoo.com
ENV VITE_CUSTOMER_APP_URL=$VITE_CUSTOMER_APP_URL
ARG VITE_RESTAURANT_APP_URL=https://restaurant.pecafoo.com
ENV VITE_RESTAURANT_APP_URL=$VITE_RESTAURANT_APP_URL
ARG VITE_DELIVERY_APP_URL=https://delivery.pecafoo.com
ENV VITE_DELIVERY_APP_URL=$VITE_DELIVERY_APP_URL
ARG VITE_ADMIN_APP_URL=https://admin.pecafoo.com
ENV VITE_ADMIN_APP_URL=$VITE_ADMIN_APP_URL

# Diagnostic to check if Dokploy passed the build args
RUN echo "API_KEY=${VITE_FIREBASE_API_KEY}"
RUN test -n "$VITE_FIREBASE_API_KEY" || (echo "FATAL: VITE_FIREBASE_API_KEY is empty. Dokploy is not passing build args!" && exit 1)

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

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://0.0.0.0/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
