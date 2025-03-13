import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { fetchCard } from "../services/cardService";
import { updateUserPoints, getStoredUser } from "../services/userService";
import { useColorScheme } from "react-native";

// Define color constants
const Colors = {
  light: {
    background: "#FFFFFF",
    text: "#121212",
    textSecondary: "#666666",
    border: "#E0E0E0",
    tint: "#4CAF50",
    icon: "#121212",
    error: "#B00020",
    card: "#FFFFFF",
  },
  dark: {
    background: "#121212",
    text: "#FFFFFF",
    textSecondary: "#BBBBBB",
    border: "#333333",
    tint: "#4CAF50",
    icon: "#FFFFFF",
    error: "#CF6679",
    card: "#1E1E1E",
  },
};

export default function CardDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");
  const colors = Colors[isDarkMode ? "dark" : "light"];

  const [pointsRedeemed, setPointsRedeemed] = useState(false);
  const [cardData, setCardData] = useState<{
    name: string;
    tagline: string;
    bodyText: string;
    videoUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoWatched, setVideoWatched] = useState(false);
  const videoRef = useRef(null);

  // Theme management
  useEffect(() => {
    const checkAndUpdateTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme");
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === "dark");
        } else {
          setIsDarkMode(colorScheme === "dark");
          await AsyncStorage.setItem("theme", colorScheme === "dark" ? "dark" : "light");
        }
      } catch (error) {
        console.error("Theme check error:", error);
      }
    };

    checkAndUpdateTheme();
  }, [colorScheme]);

  useEffect(() => {
    const loadCard = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }
        const card = await fetchCard(id as string);
        setCardData({
          name: card.name,
          tagline: card.tagline,
          bodyText: card.body,
          videoUrl: card.videoUrl,
        });
        const redeemed = await AsyncStorage.getItem(`redeemed_${id}`);
        if (redeemed === "true") {
          setPointsRedeemed(true);
          setVideoWatched(true);
        }
      } catch (err) {
        console.error("Error fetching card:", err);
        setError("Failed to load card details");
      } finally {
        setLoading(false);
      }
    };

    loadCard();
  }, [id]);

  const handleRedeemPoints = async () => {
    Alert.alert(
      "Redeem Card",
      "Are you sure you want to redeem this card for 100 points?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const user = await getStoredUser();
              if (!user) {
                throw new Error("User not found");
              }

              await updateUserPoints(user.id, 100);
              await AsyncStorage.setItem(`redeemed_${id}`, "true");
              setPointsRedeemed(true);
              
              Alert.alert("Success", "Card redeemed! 100 points added to your account!");
            } catch (error) {
              console.error("Error redeeming card:", error);
              Alert.alert("Error", "Failed to redeem card. Please try again.", [
                {
                  text: "OK",
                  style: "default",
                }
              ]);
            }
          },
        },
      ],
      {
        cancelable: true,
        userInterfaceStyle: colors.background === "#FFFFFF" ? 'light' : 'dark'
      }
    );
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.didJustFinish && !status.isLooping) {
      setVideoWatched(true);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading card...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !cardData) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error || "Card not found"}
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backButton, { color: colors.tint }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.stickyTitleContainer, { 
          backgroundColor: colors.card,
          borderBottomColor: colors.border 
        }]}>
          <TouchableOpacity
            style={styles.backButtonContainer}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color={colors.icon} />
          </TouchableOpacity>
          <Text style={[styles.name, { color: colors.text }]}>
            {cardData.name}
          </Text>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          style={{ backgroundColor: colors.background }}
        >
          <View style={[styles.videoContainer, { backgroundColor: colors.card }]}>
            <Video
              ref={videoRef}
              source={{ uri: cardData.videoUrl }}
              style={styles.video}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping={false}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            />
          </View>

          <Text style={[styles.tagline, { color: colors.text }]}>
            {cardData.tagline}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {cardData.bodyText}
          </Text>

          {!videoWatched && !pointsRedeemed && (
            <Text style={[styles.watchMessage, { color: colors.textSecondary }]}>
              Please watch the entire video to redeem points.
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.redeemButton,
              {
                backgroundColor: pointsRedeemed ? colors.border : colors.tint,
                opacity: (pointsRedeemed || !videoWatched) ? 0.7 : 1,
              },
            ]}
            onPress={handleRedeemPoints}
            disabled={pointsRedeemed || !videoWatched}
          >
            <Text style={[styles.redeemButtonText, { 
              color: pointsRedeemed ? colors.textSecondary : colors.text 
            }]}>
              {pointsRedeemed ? "Card Redeemed" : "Redeem for 100 Points"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  stickyTitleContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? (RNStatusBar.currentHeight || 0) + 10 : 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButtonContainer: {
    marginRight: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
  },
  videoContainer: {
    height: 250,
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 16,
  },
  video: {
    flex: 1,
    borderRadius: 12,
  },
  tagline: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  watchMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    opacity: 0.8,
  },
  redeemButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  redeemButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    marginVertical: 20,
  },
  backButton: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    fontWeight: "600",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});