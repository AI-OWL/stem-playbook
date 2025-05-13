import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { router } from "expo-router"; // Ensure Expo Router is used for navigation

// Use a direct IP address for better performance
const API_URL =
  "http://stem-playbook-prod.eba-st3pdkip.us-east-2.elasticbeanstalk.com";

console.log("[API] Using API URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Log request for debugging
api.interceptors.request.use(
  async (config) => {
    console.log(
      `[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`,
      config.data
    );

    const token = await AsyncStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("[API] Added auth token to request");
    }
    return config;
  },
  (error) => {
    console.error("[API] Request configuration error:", error);
    return Promise.reject(error);
  }
);

// Log response for debugging and handle expired or invalid tokens globally
api.interceptors.response.use(
  (response) => {
    console.log(
      `[API RESPONSE] ${response.status} ${response.config.url}`,
      response.data
    );
    return response;
  },
  async (error) => {
    console.error("[API ERROR]", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Special handling for network errors
    if (!error.response) {
      console.error("[API] Network Error - No response from server");
      // You might want to add specific handling for network errors here
    }

    // Skip redirect for /auth/login to allow error message display
    const isLoginRequest = error.config?.url?.includes("/auth/login");

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !isLoginRequest
    ) {
      console.log("[API] Auth error detected, logging out user");
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("cards");

      router.replace("/login");
    }
    return Promise.reject(error);
  }
);

// Helper function to test API connectivity
export const testApiConnection = async () => {
  try {
    // Using a HEAD request to check connectivity with minimal data transfer
    const response = await axios.head(API_URL);
    console.log("[API] Connection test successful:", response.status);
    return true;
  } catch (error) {
    console.error("[API] Connection test failed:", error);
    return false;
  }
};

export default api;
