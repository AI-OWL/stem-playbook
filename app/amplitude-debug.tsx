import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as amplitude from "@amplitude/analytics-react-native";
import {
  initializeAmplitudeDirectly,
  testAmplitudeTracking,
  trackCardClicked,
  trackVideoStarted,
  trackVideoProgress,
  trackVideoCompleted,
  trackPointsRedeemed,
  trackSessionEnd,
} from "./services/analyticsService";

export default function AmplitudeDebugScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [results, setResults] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  // Get user info on mount
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const user = await AsyncStorage.getItem("user");
        if (user) {
          const userData = JSON.parse(user);
          setUserId(userData.id);
        }
      } catch (error) {
        console.error("Failed to get user info:", error);
      }
    };
    getUserInfo();
  }, []);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(true);
    setResults((prev) => ({ ...prev, [testName]: "Running..." }));

    try {
      const result = await testFn();
      setResults((prev) => ({
        ...prev,
        [testName]: result === true ? "✅ Success" : "❌ Failed",
      }));
    } catch (error) {
      console.error(`Test ${testName} failed:`, error);
      setResults((prev) => ({
        ...prev,
        [testName]: `❌ Error: ${error}`,
      }));
    } finally {
      setLoading(false);
    }
  };

  const testDirect = async () => {
    try {
      // This is the direct approach as mentioned in the documentation
      amplitude.init("5e1773f70602db5eabb266dc70375b62");
      amplitude.track("Direct Test");
      return Promise.resolve(true);
    } catch (error) {
      console.error("Direct test failed:", error);
      return Promise.resolve(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Amplitude Debug</Text>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.userInfoContainer}>
          <Text style={styles.subtitle}>User Info</Text>
          <Text style={styles.userIdText}>
            User ID: {userId || "Not logged in"}
          </Text>
        </View>

        <View style={styles.testButtonsContainer}>
          <Text style={styles.subtitle}>Test Events</Text>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() => runTest("direct", testDirect)}
            disabled={loading}
          >
            <Text style={styles.testButtonText}>Test Direct Init</Text>
            {results["direct"] && (
              <Text style={styles.resultText}>{results["direct"]}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() =>
              runTest("init", () =>
                Promise.resolve(initializeAmplitudeDirectly())
              )
            }
            disabled={loading}
          >
            <Text style={styles.testButtonText}>Initialize Amplitude</Text>
            {results["init"] && (
              <Text style={styles.resultText}>{results["init"]}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() => runTest("test", testAmplitudeTracking)}
            disabled={loading}
          >
            <Text style={styles.testButtonText}>Test Event</Text>
            {results["test"] && (
              <Text style={styles.resultText}>{results["test"]}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() =>
              runTest("card", () =>
                trackCardClicked("test-card-id", "Test Card", "Test Category")
              )
            }
            disabled={loading}
          >
            <Text style={styles.testButtonText}>Track Card Click</Text>
            {results["card"] && (
              <Text style={styles.resultText}>{results["card"]}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() =>
              runTest("videoStart", () =>
                trackVideoStarted(
                  "test-card-id",
                  "Test Card",
                  "https://example.com/video.mp4"
                )
              )
            }
            disabled={loading}
          >
            <Text style={styles.testButtonText}>Track Video Start</Text>
            {results["videoStart"] && (
              <Text style={styles.resultText}>{results["videoStart"]}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() =>
              runTest("videoProgress", () =>
                trackVideoProgress("test-card-id", "Test Card", 50, 30)
              )
            }
            disabled={loading}
          >
            <Text style={styles.testButtonText}>Track Video Progress</Text>
            {results["videoProgress"] && (
              <Text style={styles.resultText}>{results["videoProgress"]}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() =>
              runTest("videoComplete", () =>
                trackVideoCompleted(
                  "test-card-id",
                  "Test Card",
                  "https://example.com/video.mp4",
                  60
                )
              )
            }
            disabled={loading}
          >
            <Text style={styles.testButtonText}>Track Video Complete</Text>
            {results["videoComplete"] && (
              <Text style={styles.resultText}>{results["videoComplete"]}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() =>
              runTest("points", () =>
                trackPointsRedeemed("test-card-id", "Test Card", 100)
              )
            }
            disabled={loading}
          >
            <Text style={styles.testButtonText}>Track Points Redemption</Text>
            {results["points"] && (
              <Text style={styles.resultText}>{results["points"]}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() => runTest("session", trackSessionEnd)}
            disabled={loading}
          >
            <Text style={styles.testButtonText}>Track Session End</Text>
            {results["session"] && (
              <Text style={styles.resultText}>{results["session"]}</Text>
            )}
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Running tests...</Text>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Troubleshooting Tips</Text>
          <Text style={styles.infoText}>
            1. Check the console logs for detailed information
          </Text>
          <Text style={styles.infoText}>
            2. Verify internet connection is working
          </Text>
          <Text style={styles.infoText}>
            3. Verify API key is correct: 5e1773f70602db5eabb266dc70375b62
          </Text>
          <Text style={styles.infoText}>
            4. Events may take a few minutes to appear in Amplitude dashboard
          </Text>
          <Text style={styles.infoText}>
            5. Try restarting the app after tests
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  userInfoContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  userIdText: {
    fontSize: 14,
  },
  testButtonsContainer: {
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  testButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  resultText: {
    marginTop: 5,
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4CAF50",
  },
  infoContainer: {
    padding: 15,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: 40,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
    lineHeight: 20,
  },
});
