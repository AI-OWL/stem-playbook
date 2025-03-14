import React, { useState, useEffect } from "react";
import { Fonts } from '@/constants/Fonts';
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
import { logger } from "react-native-logs";

// Create a logger instance with default settings
const log = logger.createLogger();

// Custom Checkbox Component
const CustomCheckbox = ({ value, onValueChange }) => {
  return (
    <TouchableOpacity
      style={[styles.checkbox, value && styles.checkboxChecked]}
      onPress={() => onValueChange(!value)}
    >
      {value && <View style={styles.checkmark} />}
    </TouchableOpacity>
  );
};

export default function AuthFlow() {
  // Now log is accessible here since it's defined in the outer scope
  log.debug("[AuthFlow] Component mounted");

  const router = useRouter();

  // Tabs: "login" | "signup" | "verify"
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "verify">("login");

  // Login form data
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // Sign-up form data
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });
  const [isAgeVerified, setIsAgeVerified] = useState(false); // Age verification state

  // Verification form data
  const [verificationData, setVerificationData] = useState({ email: "", code: "" });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Log tab changes
   */
  const handleTabChange = (tab: "login" | "signup" | "verify") => {
    log.debug(`[AuthFlow] Changing tab to: ${tab}`);
    setActiveTab(tab);
    setError(null); // Clear error when switching tabs
  };

  /**
   * Handle the login flow
   */
  const handleLogin = async () => {
    log.debug("[AuthFlow] Attempting login...", { email: loginData.email, password: "****" });
    setLoading(true);
    setError(null);

    try {
      const response = await login(loginData.email, loginData.password);
      log.debug("[AuthFlow] Login successful, navigating to main tabs.");
      router.replace("/(tabs)");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Login failed";
      log.error("[AuthFlow] Login error:", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle the sign-up flow
   */
  const handleSignup = async () => {
    log.debug("[AuthFlow] Attempting signup...", { email: signupData.email, name: signupData.name });
    setLoading(true);
    setError(null);

    if (!isAgeVerified) {
      const msg = "You must confirm you are at least 13 years old to sign up";
      log.error("[AuthFlow] Signup error:", msg);
      setError(msg);
      setLoading(false);
      return;
    }

    try {
      const response = await signup(signupData.name, signupData.email, signupData.password);
      log.debug("[AuthFlow] Signup successful. Prompting user to verify.");
      setVerificationData({ email: signupData.email, code: "" });
      handleTabChange("verify");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Signup failed";
      log.error("[AuthFlow] Signup error:", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle the email verification flow
   */
  const handleVerification = async () => {
    log.debug("[AuthFlow] Attempting verification...", { email: verificationData.email });
    setLoading(true);
    setError(null);

    try {
      await confirmSignup(verificationData.email, verificationData.code);
      log.debug("[AuthFlow] Verification success. Switching to login tab.");
      handleTabChange("login");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Verification failed";
      log.error("[AuthFlow] Verification error:", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend verification code
   */
  const handleResendCode = async () => {
    if (!verificationData.email) {
      const msg = "Email is required to resend code";
      log.error("[AuthFlow] Resend code error:", msg);
      setError(msg);
      return;
    }

    log.debug("[AuthFlow] Resending verification code...", { email: verificationData.email });
    setLoading(true);
    setError(null);

    try {
      await resendVerification(verificationData.email);
      log.debug("[AuthFlow] Verification code resent successfully.");
      setError("A new verification code has been sent to your email.");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Resend failed";
      log.error("[AuthFlow] Resend code error:", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    setError(null);
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
            onPress={() => handleTabChange("login")}
          >
            <Text style={[styles.tabText, activeTab === "login" && styles.activeTabText]}>
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "signup" && styles.activeTab]}
            onPress={() => handleTabChange("signup")}
          >
            <Text style={[styles.tabText, activeTab === "signup" && styles.activeTabText]}>
              Sign Up
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "verify" && styles.activeTab]}
            onPress={() => handleTabChange("verify")}
          >
            <Text style={[styles.tabText, activeTab === "verify" && styles.activeTabText]}>
              Verify
            </Text>
          </TouchableOpacity>
        </View>

        {/* Show error if any with dismiss option */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.errorDismiss} onPress={clearError}>
              <Text style={styles.errorDismissText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 1) LOGIN FORM */}
        {activeTab === "login" && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={loginData.email}
              onChangeText={(text) => {
                setLoginData({ ...loginData, email: text });
                clearError(); // Clear error on input change
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={loginData.password}
              onChangeText={(text) => {
                setLoginData({ ...loginData, password: text });
                clearError(); // Clear error on input change
              }}
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
              onChangeText={(text) => {
                setSignupData({ ...signupData, name: text });
                clearError(); // Clear error on input change
              }}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={signupData.email}
              onChangeText={(text) => {
                setSignupData({ ...signupData, email: text });
                clearError(); // Clear error on input change
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={signupData.password}
              onChangeText={(text) => {
                setSignupData({ ...signupData, password: text });
                clearError(); // Clear error on input change
              }}
              secureTextEntry
            />

            {/* Age Verification Checkbox */}
            <View style={styles.checkboxContainer}>
              <CustomCheckbox
                value={isAgeVerified}
                onValueChange={setIsAgeVerified}
              />
              <Text style={styles.checkboxLabel}>
                I confirm that I am at least 13 years old
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.button, !isAgeVerified && styles.disabledButton]} 
              onPress={handleSignup} 
              disabled={loading || !isAgeVerified}
            >
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
              onChangeText={(text) => {
                setVerificationData({ ...verificationData, email: text });
                clearError(); // Clear error on input change
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={styles.input}
              placeholder="6-digit code"
              value={verificationData.code}
              onChangeText={(text) => {
                setVerificationData({ ...verificationData, code: text });
                clearError(); // Clear error on input change
              }}
              keyboardType="number-pad"
            />

            <TouchableOpacity style={styles.button} onPress={handleVerification} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleResendCode}
              disabled={loading}
            >
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
    fontFamily: "Poppins-Bold",
    fontSize: 32,
    color: "#1e40af",
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
    width: "80%", // Adjusted width to prevent cutoff
    alignSelf: "center",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16, // Increased horizontal padding
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#1e40af",
  },
  tabText: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    color: "#4b5563",
    textAlign: "center", // Ensure text is centered
  },
  activeTabText: {
    color: "#ffffff",
  },
  form: {
    width: "100%",
    maxWidth: 400,
  },
  input: {
    fontFamily: "Poppins-Regular",
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
    backgroundColor: "#6b7280",
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: "Poppins-Bold",
    color: "#ffffff",
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    width: '80%',
    maxWidth: 400,
  },
  errorText: {
    fontFamily: "Poppins-Medium",
    color: "red",
    flex: 1,
  },
  errorDismiss: {
    padding: 5,
  },
  errorDismissText: {
    fontFamily: "Poppins-Medium",
    color: "#dc2626",
    fontSize: 14,
  },
  label: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
    marginLeft: 4,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#4b5563",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    borderColor: "#1e40af",
    backgroundColor: "#1e40af",
  },
  checkmark: {
    width: 12,
    height: 12,
    backgroundColor: "#ffffff", // Simple checkmark representation
  },
  checkboxLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#374151",
    flexShrink: 1,
  },
});