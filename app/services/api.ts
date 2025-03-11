import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { router } from "expo-router"; // Ensure Expo Router is used for navigation

const API_URL = "http://3.143.91.62"; // Adjust for production

const api = axios.create({
  baseURL: API_URL,
});

// Attach token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired or invalid tokens globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.warn("[API] Error response:", {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
    });

    if (error.response?.status === 401 || error.response?.status === 403) {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("cards");

      router.replace("/login");
    }
    return Promise.reject(error);
  }
);

export default api;
