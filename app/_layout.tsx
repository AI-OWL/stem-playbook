import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useSegments, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Provider } from 'react-redux';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const segments = useSegments();
  const router = useRouter();

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

  useEffect(() => {
    if (authChecked) {
      // Wait for navigation to be ready before redirecting
      if (!isAuthenticated && segments[0] !== "login") {
        router.replace("/login");
      }
    }
  }, [authChecked, isAuthenticated, segments]);

  // Show nothing until everything is loaded and auth is checked
  if (!loaded || !authChecked) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
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
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
