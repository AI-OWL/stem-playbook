import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";

const API_URL = "http://localhost:5050/auth"; // Adjust if needed

// Login
export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  const { token, user } = response.data;
  // Store in AsyncStorage
  await AsyncStorage.setItem("token", token);
  await AsyncStorage.setItem("user", JSON.stringify(user));
  return { token, user };
}

// Signup
export async function signup(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
  const response = await axios.post(`${API_URL}/signup`, { name, email, password });
  const { token, user } = response.data;
  // Store in AsyncStorage
  await AsyncStorage.setItem("token", token);
  await AsyncStorage.setItem("user", JSON.stringify(user));
  return { token, user };
}

// Logout
export async function logout(): Promise<void> {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("user");
}

// Get stored user data
export async function getStoredUser(): Promise<User | null> {
  try {
    const user = await AsyncStorage.getItem("user");
    return user ? (JSON.parse(user) as User) : null;
  } catch (error) {
    console.error("Error retrieving user:", error);
    return null;
  }
}

// Get stored token
export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem("token");
}
