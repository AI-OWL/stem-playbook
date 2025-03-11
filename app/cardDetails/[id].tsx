import React, { useState, useEffect, useRef } from "react"; // Added useRef for video ref
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  ActivityIndicator,
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
  },
  dark: {
    background: "#121212",
    text: "#FFFFFF",
    textSecondary: "#BBBBBB",
    border: "#333333",
    tint: "#4CAF50",
    icon: "#FFFFFF",
    error: "#CF6679",
  },
};

const handleRedeemPoints = async (
  cardId: string,
  setPointsRedeemed: (value: boolean) => void
) => {
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
            // Get current user from AsyncStorage
            const user = await getStoredUser();
            if (!user) {
              throw new Error("User not found");
            }

            // Add 100 points
            await updateUserPoints(user.id, 100);
            
            // Mark card as redeemed
            await AsyncStorage.setItem(`redeemed_${cardId}`, "true");
            setPointsRedeemed(true);
            
            Alert.alert("Success", "Card redeemed! 100 points added to your account!");
          } catch (error) {
            console.error("Error redeeming card:", error);
            Alert.alert("Error", "Failed to redeem card. Please try again.");
          }
        },
      },
    ]
  );
};

export default function CardDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
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
  const [videoWatched, setVideoWatched] = useState(false); // Track if video is fully watched
  const videoRef = useRef(null); // Reference to the Video component

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
          setVideoWatched(true); // If already redeemed, no need to watch video
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

  // Handle video playback status updates to check if the video is fully watched
  const onPlaybackStatusUpdate = (status: any) => {
    if (status.didJustFinish && !status.isLooping) {
      // Video has finished playing
      setVideoWatched(true);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.tint} />
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
            <Text style={[styles.backButton, { color: colors.textSecondary }]}>
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
          backgroundColor: colors.background,
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

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.videoContainer}>
            <Video
              ref={videoRef}
              source={{ uri: cardData.videoUrl }}
              style={styles.video}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping={false} // Disable looping to ensure we can detect when the video ends
              onPlaybackStatusUpdate={onPlaybackStatusUpdate} // Track playback status
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
              (pointsRedeemed || !videoWatched) && styles.redeemButtonDisabled,
            ]}
            onPress={() => handleRedeemPoints(id as string, setPointsRedeemed)}
            disabled={pointsRedeemed || !videoWatched} // Disable button until video is watched or points are redeemed
          >
            <Text style={[styles.redeemButtonText, { color: colors.text }]}>
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
  },
  backButtonContainer: {
    marginRight: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
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
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  redeemButtonDisabled: {
    backgroundColor: "#666",
    opacity: 0.7,
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
  },
});