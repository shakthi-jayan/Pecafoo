# Mobile App Build Commands

This document contains the exact commands required to build the mobile applications for different environments.

## Customer

### Development
```bash
cd frontend/mobile/apps/customer
eas build --profile development --platform android
```

### APK
```bash
cd frontend/mobile/apps/customer
eas build --profile preview --platform android
```

### Play Store
```bash
cd frontend/mobile/apps/customer
eas build --profile production --platform android
```

## Restaurant

### Development
```bash
cd frontend/mobile/apps/restaurant
eas build --profile development --platform android
```

### APK
```bash
cd frontend/mobile/apps/restaurant
eas build --profile preview --platform android
```

### Play Store
```bash
cd frontend/mobile/apps/restaurant
eas build --profile production --platform android
```

## Delivery

### Development
```bash
cd frontend/mobile/apps/delivery
eas build --profile development --platform android
```

### APK
```bash
cd frontend/mobile/apps/delivery
eas build --profile preview --platform android
```

### Play Store
```bash
cd frontend/mobile/apps/delivery
eas build --profile production --platform android
```

## Admin

### Development
```bash
cd frontend/mobile/apps/admin
eas build --profile development --platform android
```

### APK
```bash
cd frontend/mobile/apps/admin
eas build --profile preview --platform android
```

### Play Store
```bash
cd frontend/mobile/apps/admin
eas build --profile production --platform android
```
