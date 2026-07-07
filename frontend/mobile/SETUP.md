# Local Setup Guide

Follow these steps to run any of the Pecafoo mobile apps locally.

## Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g eas-cli`)
- Expo Go app on your physical iOS/Android device, or an iOS Simulator / Android Emulator.

## Installation

1. Navigate to the mobile root: `cd frontend/mobile`
2. Install all dependencies across the monorepo using legacy peer deps to resolve React/Expo strictness:
   ```bash
   npm install --legacy-peer-deps
   ```

## Environment Configuration

Copy the example environment file to your local development environment:
```bash
cp .env.example .env.development
```
Edit `.env.development` and set `EXPO_PUBLIC_API_URL` to your local Django IP (e.g., `http://192.168.1.100:8000/api`). **Do not use `localhost`** if you are testing on a physical device.

## Running the Apps

Each app runs on a specific port. Run these from the `frontend/mobile` directory:

- Customer: `npm --workspace apps/customer run start` (Port 8081)
- Restaurant: `npm --workspace apps/restaurant run start` (Port 8082)
- Delivery: `npm --workspace apps/delivery run start` (Port 8083)
- Admin: `npm --workspace apps/admin run start` (Port 8084)

Scan the QR code that appears in your terminal using the Expo Go app.
