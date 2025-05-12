import React from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, Redirect, useSegments, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useRef } from "react";
import "react-native-reanimated";
import "@/app/global-styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "@/hooks/useColorScheme";
import { View } from "react-native";
import { setupNotificationListeners } from "@/src/utils/notificationUtils";
import * as Notifications from "expo-notifications";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  const notificationListener = useRef();
  const responseListener = useRef();

  const [loaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins/Poppins-Bold.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins/Poppins-Medium.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins/Poppins-Light.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins/Poppins-SemiBold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins/Poppins-ExtraBold.ttf"),
    "Poppins-Italic": require("../assets/fonts/Poppins/Poppins-Italic.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Set up notification listeners
  useEffect(() => {
    // Set up notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Set up notification listeners if authenticated
    if (isAuthenticated) {
      const listeners = setupNotificationListeners(
        (notification: Notifications.Notification) => {
          // Handle received notifications here
          console.log("Notification received:", notification);
        }
      );

      // Clean up listeners on unmount
      return () => {
        listeners.remove();
      };
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!loaded) return;

    const checkAuth = async () => {
      try {
        const authStatus = await AsyncStorage.getItem("isAuthenticated");
        setIsAuthenticated(authStatus === "true");
      } catch (error) {
        console.error("Error checking auth:", error);
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [loaded]);

  // Always render the Stack to maintain navigation context
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {/* Use a View wrapper to prevent layout issues */}
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          {!loaded || !authChecked ? (
            // Show loading screen route while checking
            <Stack.Screen
              name="loading"
              options={{
                headerShown: false,
              }}
            />
          ) : !isAuthenticated ? (
            // Show landing route when not authenticated
            <Stack.Screen
              name="landing"
              options={{
                headerShown: false,
                gestureEnabled: false,
              }}
            />
          ) : (
            // Show main app routes when authenticated
            <>
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen
                name="profile"
                options={{
                  presentation: "card",
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="cardDetails/[id]"
                options={{
                  presentation: "modal",
                  headerShown: false,
                }}
              />
              <Stack.Screen name="+not-found" />
            </>
          )}
        </Stack>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </View>
    </ThemeProvider>
  );
}
