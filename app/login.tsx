import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

interface AuthData {
  email: string;
  password: string;
  name?: string;
}

interface AccountDetails {
  avatar: string;
  grade: string;
  subject: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [showAccountSetup, setShowAccountSetup] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState<AuthData>({
    email: "",
    password: "",
  });
  const [signupData, setSignupData] = useState<AuthData>({
    email: "",
    password: "",
    name: "",
  });
  const [accountDetails, setAccountDetails] = useState<AccountDetails>({
    avatar: "default",
    grade: "",
    subject: "",
  });

  useEffect(() => {
    // Check authentication status from AsyncStorage
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authStatus = await AsyncStorage.getItem("isAuthenticated");
      const storedUserName = await AsyncStorage.getItem("userName");
      if (authStatus === "true" && storedUserName) {
        setIsAuthenticated(true);
        setUserName(storedUserName);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  };

  const handleLogin = async () => {
    try {
      // Here you would validate credentials
      await AsyncStorage.setItem("isAuthenticated", "true");
      await AsyncStorage.setItem("userEmail", loginData.email);
      await AsyncStorage.setItem("userName", "User");
      router.push("/index");
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const handleInitialSignup = () => {
    setShowAccountSetup(true);
  };

  const handleFinalSignup = async () => {
    try {
      await AsyncStorage.setItem("isAuthenticated", "true");
      await AsyncStorage.setItem("userEmail", signupData.email);
      await AsyncStorage.setItem("userName", signupData.name || "");
      await AsyncStorage.setItem("userGrade", accountDetails.grade);
      await AsyncStorage.setItem("userSubject", accountDetails.subject);
      router.push("/index");
    } catch (error) {
      console.error("Error during signup:", error);
    }
  };

  if (isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Image
            source={require("../../assets/images/adaptive-icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>STEM Playbook</Text>
          <View style={styles.card}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{userName}!</Text>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => router.push("/index")}
            >
              <Text style={styles.playButtonText}>Let's Play</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={async () => {
                await AsyncStorage.clear();
                setIsAuthenticated(false);
                setUserName("");
              }}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (showAccountSetup) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Image
            source={require("../../assets/images/adaptive-icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>STEM Playbook</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowAccountSetup(false)}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.setupTitle}>Complete Your Profile</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Grade Level</Text>
              <View style={styles.pickerContainer}>
                {["6", "7", "8"].map((grade) => (
                  <TouchableOpacity
                    key={grade}
                    style={[
                      styles.gradeOption,
                      accountDetails.grade === grade && styles.gradeOptionSelected,
                    ]}
                    onPress={() => setAccountDetails({...accountDetails, grade})}
                  >
                    <Text style={styles.gradeOptionText}>{grade}th Grade</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Favorite Subject</Text>
              <View style={styles.pickerContainer}>
                {["Math", "Science", "Technology", "Engineering"].map((subject) => (
                  <TouchableOpacity
                    key={subject}
                    style={[
                      styles.subjectOption,
                      accountDetails.subject === subject.toLowerCase() && styles.subjectOptionSelected,
                    ]}
                    onPress={() => setAccountDetails({...accountDetails, subject: subject.toLowerCase()})}
                  >
                    <Text style={styles.subjectOptionText}>{subject}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleFinalSignup}
            >
              <Text style={styles.submitButtonText}>Complete Setup & Start Playing</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={require("../../assets/images/adaptive-icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>STEM Playbook</Text>
        <View style={styles.card}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "login" && styles.activeTab]}
              onPress={() => setActiveTab("login")}
            >
              <Text style={styles.tabText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "signup" && styles.activeTab]}
              onPress={() => setActiveTab("signup")}
            >
              <Text style={styles.tabText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {activeTab === "login" ? (
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
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleLogin}
              >
                <Text style={styles.submitButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
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
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleInitialSignup}
              >
                <Text style={styles.submitButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#1e40af",
  },
  tabText: {
    fontSize: 16,
    color: "#4b5563",
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: "#1e40af",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  playButton: {
    backgroundColor: "#1e40af",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  playButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  userName: {
    fontSize: 20,
    color: "#1e40af",
    textAlign: "center",
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 12,
    padding: 12,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#6b7280",
    fontSize: 16,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: "#6b7280",
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  pickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gradeOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  gradeOptionSelected: {
    backgroundColor: "#1e40af",
    borderColor: "#1e40af",
  },
  gradeOptionText: {
    fontSize: 14,
    color: "#4b5563",
  },
  subjectOption: {
    width: "48%",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    marginBottom: 8,
  },
  subjectOptionSelected: {
    backgroundColor: "#1e40af",
    borderColor: "#1e40af",
  },
  subjectOptionText: {
    fontSize: 14,
    color: "#4b5563",
  },
});