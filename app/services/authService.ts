import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";

// Login function
export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const response = await api.post("/auth/login", { email, password });
  const { token, user } = response.data;

  // Store token and user in AsyncStorage
  await AsyncStorage.setItem("token", token);
  await AsyncStorage.setItem("user", JSON.stringify(user));

  return { token, user };
}

// Signup function
export async function signup(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
  const response = await api.post("/auth/signup", { name, email, password });
  const { token, user } = response.data;

  // Store token and user in AsyncStorage
  await AsyncStorage.setItem("token", token);
  await AsyncStorage.setItem("user", JSON.stringify(user));

  return { token, user };
}

// Logout function
export async function logout(): Promise<void> {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("user");
}
