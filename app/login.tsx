import { useState } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleLogin = async () => {
    try {
      // Store auth state
      await AsyncStorage.setItem("isAuthenticated", "true");
      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleSignup = async () => {
    try {
      // Store auth state
      await AsyncStorage.setItem("isAuthenticated", "true");
      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={require("../assets/images/adaptive-icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>STEM Playbook</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'login' && styles.activeTab]}
            onPress={() => setActiveTab('login')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'login' && styles.activeTabText
            ]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
            onPress={() => setActiveTab('signup')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'signup' && styles.activeTabText
            ]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'login' ? (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={loginData.email}
              onChangeText={(text) => setLoginData({...loginData, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={loginData.password}
              onChangeText={(text) => setLoginData({...loginData, password: text})}
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={signupData.name}
              onChangeText={(text) => setSignupData({...signupData, name: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={signupData.email}
              onChangeText={(text) => setSignupData({...signupData, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={signupData.password}
              onChangeText={(text) => setSignupData({...signupData, password: text})}
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleSignup}
            >
              <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        )}
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#1e40af',
  },
  tabText: {
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#ffffff',
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1e40af',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});