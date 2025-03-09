// src/pages/services/authService.ts
import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";

/**
 * Login function - calls /auth/login
 * Expects { token, user } in the response
 * Stores them in AsyncStorage
 */
export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const response = await api.post("/auth/login", { email, password });
  const { token, user } = response.data;

  // Store token and user in AsyncStorage
  await AsyncStorage.setItem("token", token);
  await AsyncStorage.setItem("user", JSON.stringify(user));

  return { token, user };
}

/**
 * Signup function - calls /auth/signup
 * Now returns just a message from the backend
 * No token yet, because Cognito sign-up doesn't return one
 */
export async function signup(name: string, email: string, password: string): Promise<{ message: string }> {
  const response = await api.post("/auth/signup", { name, email, password });
  // e.g. { message: "User registered successfully. Please check your email for the verification code." }
  return response.data;
}

/**
 * Confirm Signup - calls /auth/confirm-signup
 * Returns { message: string }
 */
export async function confirmSignup(email: string, code: string): Promise<{ message: string }> {
  const response = await api.post("/auth/confirm-signup", { email, code });
  return response.data;
}

/**
 * Resend Verification - calls /auth/resend-verification
 * Returns { message: string }
 */
export async function resendVerification(email: string): Promise<{ message: string }> {
  const response = await api.post("/auth/resend-verification", { email });
  return response.data;
}

/**
 * Logout function
 */
export async function logout(): Promise<void> {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("user");
}
