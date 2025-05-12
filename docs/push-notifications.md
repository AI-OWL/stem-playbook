# Push Notification System

This document describes the push notification system implemented in the STEM All-Stars application.

## Overview

The system uses Expo's push notification services to send notifications to users' devices. It consists of:

1. **Client-side code** to request permissions, get push tokens, and handle incoming notifications
2. **Backend API** to store tokens and send notifications

## Client-Side Setup

### Registration Flow

1. When a user logs in, the app automatically:
   - Requests notification permissions
   - Gets an Expo push token
   - Sends the token to the backend

The token is tied to the user's account in DynamoDB, enabling targeted notifications.

### Implementation Details

- **Notification Utils** (`src/utils/notificationUtils.js`):

  - `registerForPushNotificationsAsync()`: Handles permission requests and gets the token
  - `savePushToken()`: Sends the token to the backend
  - `setupNotificationListeners()`: Sets up handling for received notifications

- **Auth Integration** (`app/services/authService.ts`):

  - Modified `login()` function to request permissions and save token after login

- **App Layout** (`app/_layout.tsx`):
  - Sets up global notification handlers
  - Configures notification appearance

## Backend Setup

### API Endpoints

- `POST /users/push-token`: Saves a user's push token to DynamoDB

### Components

- **Routes** (`routes/userRoutes.ts`): Defines the endpoint
- **Controller** (`controllers/userController.ts`): Handles the API request
- **Service** (`services/notificationService.ts`): Business logic for notifications

### Sending Notifications

To send notifications, use the `sendPushNotifications` function:

```typescript
import { sendPushNotifications } from "../services/notificationService";

// Send to specific users
await sendPushNotifications(
  ["user-id-1", "user-id-2"],
  "Notification Title",
  "This is the notification body",
  { additionalData: "Custom data here" }
);
```

## Dependencies

- `expo-notifications`: Client-side notification handling
- `expo-server-sdk`: Backend SDK for sending to Expo push service
- `expo-constants`: Access to Expo project configuration

## Testing

To test push notifications:

1. Use a physical device (not a simulator)
2. Log in to the app to register for notifications
3. Send a test notification from the backend

**Note:** Use the Expo push notification tool for quick testing: https://expo.dev/notifications

## Troubleshooting

- Ensure the device is physical (not a simulator/emulator)
- Verify the user has granted permission
- Check logs for token registration errors
- Verify the token format is valid (should start with `ExponentPushToken[`)
