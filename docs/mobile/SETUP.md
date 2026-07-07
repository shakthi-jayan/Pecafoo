# Pecafoo Mobile - Local Setup

Each app in the Pecafoo monorepo operates as a standalone Expo project.

## 1. Install Dependencies
Always install dependencies from the root of the mobile workspace:
```bash
cd frontend/mobile
npm install --legacy-peer-deps
```

## 2. Environment Variables
Navigate into the app you want to run (e.g., `apps/customer`) and create a `.env.development` file:
```bash
cd apps/customer
cp .env.example .env.development
```
Populate the `EXPO_PUBLIC_API_URL` to point to your local backend IP.

## 3. Start the App
Start the app directly from its own directory using Expo:
```bash
npx expo start
```
