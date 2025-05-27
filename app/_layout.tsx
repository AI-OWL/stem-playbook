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
import { useEffect, useState } from "react";
import "react-native-reanimated";
import "@/app/global-styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "@/hooks/useColorScheme";
import { View, Alert } from "react-native";
import {
  initializeAnalytics,
  trackSessionEnd,
  initializeAmplitudeDirectly,
} from "./services/analyticsService";
import { AppState } from "react-native";
// Direct import for testing
import * as amplitude from "@amplitude/analytics-react-native";

// Try to initialize Amplitude directly as early as possible
console.log("🔊 AMPLITUDE: Attempting direct initialization from app startup");
try {
  amplitude.init("5e1773f70602db5eabb266dc70375b62");
  console.log("🔊 AMPLITUDE: Direct initialization successful");
} catch (error) {
  console.error("🔊 AMPLITUDE ERROR: Direct initialization failed", error);
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const segments = useSegments();
  const router = useRouter();

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

  useEffect(() => {
    if (!loaded) return;

    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error("Error checking auth:", error);
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [loaded]);

  // Enhanced app state tracking for analytics
  useEffect(() => {
    if (isAuthenticated) {
      // Try direct initialization again (redundant but helps ensure it works)
      try {
        console.log("🔊 AMPLITUDE: Trying direct init in authenticated state");
        amplitude.init("5e1773f70602db5eabb266dc70375b62");

        // Send a test event to verify it's working
        amplitude.track("App Started");
        console.log("🔊 AMPLITUDE: Direct init + test event sent from layout");
      } catch (error) {
        console.error(
          "🔊 AMPLITUDE ERROR: Direct init in layout failed",
          error
        );
      }

      const appStateSubscription = AppState.addEventListener(
        "change",
        (nextAppState) => {
          if (nextAppState === "background" || nextAppState === "inactive") {
            // App is going to background, track session end
            trackSessionEnd().catch((error) => {
              console.error(
                "🔊 AMPLITUDE ERROR: Failed to track session end",
                error
              );
            });
          } else if (nextAppState === "active") {
            // App came back to foreground, initialize a new session
            const getUser = async () => {
              try {
                const user = await AsyncStorage.getItem("user");
                if (user) {
                  const userData = JSON.parse(user);
                  await initializeAnalytics(userData.id);
                } else {
                  await initializeAnalytics();
                }

                // Try direct method as well for redundancy
                initializeAmplitudeDirectly();
              } catch (error) {
                console.error(
                  "🔊 AMPLITUDE ERROR: Failed to initialize analytics",
                  error
                );

                // Try direct init as fallback
                try {
                  amplitude.init("5e1773f70602db5eabb266dc70375b62");
                } catch (directError) {
                  console.error(
                    "🔊 AMPLITUDE ERROR: All initialization methods failed",
                    directError
                  );
                }
              }
            };
            getUser();
          }
        }
      );

      // Initialize analytics when component mounts
      const initAnalytics = async () => {
        try {
          const user = await AsyncStorage.getItem("user");
          if (user) {
            const userData = JSON.parse(user);
            const success = await initializeAnalytics(userData.id);
            if (!success) {
              // Try direct method as fallback
              initializeAmplitudeDirectly();
            }
          } else {
            const success = await initializeAnalytics();
            if (!success) {
              // Try direct method as fallback
              initializeAmplitudeDirectly();
            }
          }
        } catch (error) {
          console.error(
            "🔊 AMPLITUDE ERROR: Failed to initialize analytics in layout",
            error
          );

          // Show alert for debugging
          if (__DEV__) {
            Alert.alert(
              "Amplitude Error",
              "Failed to initialize Amplitude. Check console for details.",
              [{ text: "OK" }]
            );
          }

          // Try direct method as last resort
          initializeAmplitudeDirectly();
        }
      };

      initAnalytics();

      return () => {
        appStateSubscription.remove();
        trackSessionEnd().catch((error) => {
          console.error(
            "🔊 AMPLITUDE ERROR: Failed to track session end on unmount",
            error
          );
        });
      };
    }
  }, [isAuthenticated]);

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
              name="index"
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
              <Stack.Screen
                name="amplitude-debug"
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
