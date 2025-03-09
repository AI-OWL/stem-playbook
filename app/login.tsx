// pages/AuthFlow.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { signup, login, confirmSignup, resendVerification } from "./services/authService";

export default function AuthFlow() {
  const router = useRouter();

  // Tabs: "login" | "signup" | "verify"
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "verify">("login");

  // Login form data
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // Sign-up form data
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });

  // Verification form data
  const [verificationData, setVerificationData] = useState({ email: "", code: "" });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle the login flow
   */
  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await login(loginData.email, loginData.password);
      // e.g. { token, user }
      router.replace("/(tabs)"); // Navigate to main app screen
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle the sign-up flow
   */
  const handleSignup = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await signup(signupData.name, signupData.email, signupData.password);
      // e.g. { message: "User registered successfully..." }

      // After successful sign-up, switch to "verify" tab.
      // Pre-fill the verificationData.email so user doesn't have to retype
      setVerificationData({ email: signupData.email, code: "" });
      setActiveTab("verify");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle the email verification flow
   */
  const handleVerification = async () => {
    setLoading(true);
    setError(null);

    try {
      // call confirm signup
      await confirmSignup(verificationData.email, verificationData.code);
      // On success, switch to login tab
      setActiveTab("login");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend verification code
   */
  const handleResendCode = async () => {
    if (!verificationData.email) {
      setError("Email is required to resend code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await resendVerification(verificationData.email);
      // You can show a success message if you like
      setError("A new verification code has been sent to your email.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Resend failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Logo + App Name */}
        <Image
          source={require("../assets/images/adaptive-icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>STEM Playbook</Text>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "login" && styles.activeTab]}
            onPress={() => setActiveTab("login")}
          >
            <Text style={[styles.tabText, activeTab === "login" && styles.activeTabText]}>
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "signup" && styles.activeTab]}
            onPress={() => setActiveTab("signup")}
          >
            <Text style={[styles.tabText, activeTab === "signup" && styles.activeTabText]}>
              Sign Up
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "verify" && styles.activeTab]}
            onPress={() => setActiveTab("verify")}
          >
            <Text style={[styles.tabText, activeTab === "verify" && styles.activeTabText]}>
              Verify
            </Text>
          </TouchableOpacity>
        </View>

        {/* Show error if any */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* 1) LOGIN FORM */}
        {activeTab === "login" && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={loginData.email}
              onChangeText={(text) => setLoginData({ ...loginData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={loginData.password}
              onChangeText={(text) => setLoginData({ ...loginData, password: text })}
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* 2) SIGNUP FORM */}
        {activeTab === "signup" && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={signupData.name}
              onChangeText={(text) => setSignupData({ ...signupData, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={signupData.email}
              onChangeText={(text) => setSignupData({ ...signupData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={signupData.password}
              onChangeText={(text) => setSignupData({ ...signupData, password: text })}
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* 3) VERIFY FORM */}
        {activeTab === "verify" && (
          <View style={styles.form}>
            <Text style={styles.label}>Email (the one you signed up with)</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={verificationData.email}
              onChangeText={(text) => setVerificationData({ ...verificationData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={styles.input}
              placeholder="6-digit code"
              value={verificationData.code}
              onChangeText={(text) => setVerificationData({ ...verificationData, code: text })}
              keyboardType="number-pad"
            />

            <TouchableOpacity style={styles.button} onPress={handleVerification} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleResendCode} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Resend Code</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/** ----- STYLES ----- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#1e40af",
  },
  tabText: {
    fontSize: 16,
    color: "#4b5563",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#ffffff",
  },
  form: {
    width: "100%",
    maxWidth: 400,
  },
  input: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#1e40af",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryButton: {
    backgroundColor: "#6b7280", // Gray
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
    maxWidth: 400,
  },
  label: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
    marginLeft: 4,
  },
});
