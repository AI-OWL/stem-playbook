import React, { useState, useEffect } from "react";
import { Fonts } from "@/constants/Fonts";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
  signup,
  login,
  confirmSignup,
  resendVerification,
} from "./services/authService";
import { logger } from "react-native-logs";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// Create a logger instance with default settings
const log = logger.createLogger();

// Get screen dimensions for responsive design
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenHeight < 700; // iPhone SE and similar

interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface VerificationData {
  email: string;
  code: string;
}

// Custom Checkbox Component
const CustomCheckbox = ({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
}) => {
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
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "verify">(
    "login"
  );

  // Login form data
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });

  // Sign-up form data
  const [signupData, setSignupData] = useState<SignupData>({
    name: "",
    email: "",
    password: "",
  });
  const [isAgeVerified, setIsAgeVerified] = useState(false); // Age verification state

  // Verification form data
  const [verificationData, setVerificationData] = useState<VerificationData>({
    email: "",
    code: "",
  });

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
    // Ensure we have valid input data first
    if (!loginData.email?.trim()) {
      setError("Email is required");
      return;
    }

    if (!loginData.password?.trim()) {
      setError("Password is required");
      return;
    }

    log.debug("[AuthFlow] Attempting login...", {
      email: loginData.email,
      password: "****",
    });
    setLoading(true);
    setError(null);

    try {
      log.info("[AuthFlow] Sending login request to API...");

      // Create a clean request object
      const cleanLoginData = {
        email: loginData.email.trim(),
        password: loginData.password.trim(),
      };

      const response = await login(
        cleanLoginData.email,
        cleanLoginData.password
      );

      if (!response || !response.token || !response.user) {
        throw new Error("Invalid response from server");
      }

      log.info("[AuthFlow] Login successful:", {
        userId: response.user.id,
        userEmail: response.user.email,
        tokenReceived: !!response.token,
      });

      router.replace("/(tabs)");
    } catch (err: any) {
      log.error("[AuthFlow] Login error details:", {
        message: err?.message,
        responseData: err?.response?.data,
        status: err?.response?.status,
      });

      // Display meaningful error message
      let errorMessage =
        "Login failed. Please check your credentials and try again.";

      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.status === 404) {
        errorMessage =
          "Server not found. Please check your internet connection.";
      } else if (err?.response?.status === 400) {
        errorMessage = "Invalid email or password.";
      } else if (err?.response?.status === 401) {
        errorMessage =
          "Invalid credentials. Please check your email and password.";
      } else if (!err?.response) {
        errorMessage = "Network error. Please check your internet connection.";
      }

      log.error("[AuthFlow] Login error:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle the sign-up flow
   */
  const handleSignup = async () => {
    log.debug("[AuthFlow] Attempting signup...", {
      email: signupData.email,
      name: signupData.name,
    });
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
      const response = await signup(
        signupData.name,
        signupData.email,
        signupData.password
      );
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
    log.debug("[AuthFlow] Attempting verification...", {
      email: verificationData.email,
    });
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

    log.debug("[AuthFlow] Resending verification code...", {
      email: verificationData.email,
    });
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
      <KeyboardAwareScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
        resetScrollToCoords={{ x: 0, y: 0 }}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
        enableOnAndroid={true}
        enableAutomaticScroll={Platform.OS === 'ios'}
        extraScrollHeight={20}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo + App Name */}
        <Image
          source={require("../assets/images/STEM All-Stars Logo.png")}
          style={[styles.logo, isSmallScreen && styles.logoSmall]}
          resizeMode="contain"
        />
        <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>STEM All-Stars</Text>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "login" && styles.activeTab]}
            onPress={() => handleTabChange("login")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "login" && styles.activeTabText,
              ]}
            >
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "signup" && styles.activeTab]}
            onPress={() => handleTabChange("signup")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "signup" && styles.activeTabText,
              ]}
            >
              Sign Up
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "verify" && styles.activeTab]}
            onPress={() => handleTabChange("verify")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "verify" && styles.activeTabText,
              ]}
            >
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
              autoCorrect={false}
              returnKeyType="next"
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
              autoCorrect={false}
              returnKeyType="done"
            />

            <TouchableOpacity
              style={[styles.button, isSmallScreen && styles.buttonSmall]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={[styles.buttonText, isSmallScreen && styles.buttonTextSmall]}>Login</Text>
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
              autoCorrect={false}
              returnKeyType="next"
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
              autoCorrect={false}
              returnKeyType="next"
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
              autoCorrect={false}
              returnKeyType="done"
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
              style={[
                styles.button,
                isSmallScreen && styles.buttonSmall,
                !isAgeVerified && styles.disabledButton
              ]}
              onPress={handleSignup}
              disabled={loading || !isAgeVerified}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={[styles.buttonText, isSmallScreen && styles.buttonTextSmall]}>Create Account</Text>
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
              autoCorrect={false}
              returnKeyType="next"
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
              autoCorrect={false}
              returnKeyType="done"
            />

            <TouchableOpacity
              style={[styles.button, isSmallScreen && styles.buttonSmall]}
              onPress={handleVerification}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={[styles.buttonText, isSmallScreen && styles.buttonTextSmall]}>Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton, isSmallScreen && styles.buttonSmall]}
              onPress={handleResendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={[styles.buttonText, isSmallScreen && styles.buttonTextSmall]}>Resend Code</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Extra space at bottom for keyboard clearance */}
        <View style={styles.bottomSpacer} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

/** ----- STYLES ----- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  logoSmall: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 32,
    color: "#1e40af",
    marginBottom: 24,
  },
  titleSmall: {
    fontSize: 24,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
    padding: 4,
    width: "90%",
    alignSelf: "center",
  },
  tab: {
    flex: 1,
    paddingVertical: isSmallScreen ? 8 : 10,
    paddingHorizontal: 16,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontFamily: "Poppins-Medium",
    fontSize: isSmallScreen ? 14 : 16,
    color: "#4b5563",
    textAlign: "center",
  },
  activeTabText: {
    color: "#1e40af",
    fontFamily: "Poppins-Bold",
  },
  form: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  input: {
    fontFamily: "Poppins-Regular",
    backgroundColor: "#ffffff",
    padding: isSmallScreen ? 12 : 16,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: isSmallScreen ? 14 : 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  button: {
    backgroundColor: "#1e40af",
    padding: isSmallScreen ? 14 : 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    minHeight: isSmallScreen ? 44 : 50,
    shadowColor: "#1e40af",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonSmall: {
    padding: 12,
    minHeight: 44,
  },
  secondaryButton: {
    backgroundColor: "#6b7280",
    shadowColor: "#6b7280",
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
    opacity: 0.7,
    shadowOpacity: 0.1,
  },
  buttonText: {
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
    fontSize: isSmallScreen ? 14 : 16,
    textAlign: "center",
    fontWeight: "700",
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  buttonTextSmall: {
    fontSize: 14,
    fontWeight: "700",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fee2e2",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#ef4444",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  errorText: {
    fontFamily: "Poppins-Medium",
    color: "red",
    flex: 1,
    fontSize: isSmallScreen ? 12 : 14,
  },
  errorDismiss: {
    padding: 5,
  },
  errorDismissText: {
    fontFamily: "Poppins-Medium",
    color: "#dc2626",
    fontSize: isSmallScreen ? 12 : 14,
  },
  label: {
    fontFamily: "Poppins-Regular",
    fontSize: isSmallScreen ? 12 : 14,
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
    backgroundColor: "#ffffff",
  },
  checkboxLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: isSmallScreen ? 12 : 14,
    color: "#374151",
    flexShrink: 1,
  },
  bottomSpacer: {
    height: 100,
  },
});
