import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/hooks/useColorScheme';
import { View } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
            // Show login route when not authenticated
            <Stack.Screen
              name="login"
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
                  presentation: 'card',
                  headerShown: false
                }}
              />
              <Stack.Screen
                name="cardDetails/[id]"
                options={{
                  presentation: 'modal',
                  headerShown: false
                }}
              />
              <Stack.Screen name="+not-found" />
            </>
          )}
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </View>
    </ThemeProvider>
  );
}