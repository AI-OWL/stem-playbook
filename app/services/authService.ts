// src/pages/services/authService.ts
import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";

/**
 * Login function - calls /auth/login
 * Expects { token, user } in the response
 * Stores them in AsyncStorage
 */
export async function login(
  email: string,
  password: string
): Promise<{ token: string; user: User }> {
  console.log("[AuthService] Attempting login for:", email);
  try {
    // Ensure the password isn't accidentally the API URL
    if (password.includes("API_URL") || password.length > 100) {
      console.error("[AuthService] Invalid password detected");
      throw new Error("Invalid password format");
    }

    // Make sure the request body is properly formatted
    const requestBody = {
      email: email.trim(),
      password: password.trim(),
    };

    // Don't log the actual password for security
    console.log("[AuthService] Sending login request for email:", email);

    const response = await api.post("/auth/login", requestBody);
    console.log("[AuthService] Login response received:", response.status);

    if (!response.data) {
      console.error("[AuthService] Empty response data from login");
      throw new Error("Empty response from server");
    }

    const { token, user } = response.data;

    if (!token) {
      console.error("[AuthService] No token in response");
      throw new Error("No authentication token received");
    }

    if (!user) {
      console.error("[AuthService] No user data in response");
      throw new Error("No user data received");
    }

    console.log("[AuthService] Login successful for user:", user.email);
    console.log(
      "[AuthService] Received token:",
      token.substring(0, 10) + "..."
    );

    // Store token and user in AsyncStorage
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(user));
    await AsyncStorage.setItem("isAuthenticated", "true");

    return { token, user };
  } catch (error: any) {
    console.error("[AuthService] Login error:", error.message);

    // Don't log sensitive data that might be in the error
    if (error?.response?.data) {
      console.error("[AuthService] Error status:", error?.response?.status);
    } else {
      console.error(
        "[AuthService] Network or client-side error (no response data)"
      );
    }

    // Re-throw with more specific message if possible
    if (error?.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

/**
 * Signup function - calls /auth/signup
 * Now returns just a message from the backend
 * No token yet, because Cognito sign-up doesn't return one
 */
export async function signup(
  name: string,
  email: string,
  password: string
): Promise<{ message: string }> {
  const response = await api.post("/auth/signup", { name, email, password });
  // e.g. { message: "User registered successfully. Please check your email for the verification code." }
  return response.data;
}

/**
 * Confirm Signup - calls /auth/confirm-signup
 * Returns { message: string }
 */
export async function confirmSignup(
  email: string,
  code: string
): Promise<{ message: string }> {
  const response = await api.post("/auth/confirm-signup", { email, code });
  return response.data;
}

/**
 * Resend Verification - calls /auth/resend-verification
 * Returns { message: string }
 */
export async function resendVerification(
  email: string
): Promise<{ message: string }> {
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
