import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configure notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions and get Expo push token
 */
export async function registerForPushNotificationsAsync() {
  let token;

  // Check if device is physical (not a simulator)
  if (Constants.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not already granted
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Exit if permission not granted
    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return;
    }

    // Get the token
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })
    ).data;

    // Store token locally
    await AsyncStorage.setItem("expoPushToken", token);

    console.log("Push token:", token);
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  // Set up specific Android channel
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

/**
 * Save the push token to the backend
 */
export async function savePushToken(token) {
  try {
    // Get the JWT auth token
    const authToken = await AsyncStorage.getItem("token");

    if (!authToken) {
      console.log("User not authenticated, cannot save push token");
      return;
    }

    // Get the API base URL from the app settings or environment
    // Here we use a fallback if it's not available
    const API_URL = process.env.API_URL || "http://localhost:5050";

    // Send the push token to your backend
    const response = await fetch(`${API_URL}/users/push-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ pushToken: token }),
    });

    const data = await response.json();
    console.log("Push token saved successfully:", data);
    return data;
  } catch (error) {
    console.error("Error saving push token:", error);
    throw error;
  }
}

/**
 * Set up notification listeners
 */
export function setupNotificationListeners(onNotification) {
  // Handle notifications that are received while app is foregrounded
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log("Notification received in foreground:", notification);
      if (onNotification) onNotification(notification);
    }
  );

  // Handle notifications that are tapped by the user
  const responseListener =
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification tapped:", response);
    });

  return {
    remove: () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    },
  };
}
