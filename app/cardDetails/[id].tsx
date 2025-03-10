import React, { useState, useEffect } from "react";
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
  const [pointsRedeemed, setPointsRedeemed] = useState(false);
  const [cardData, setCardData] = useState<{
    name: string;
    tagline: string;
    bodyText: string;
    videoUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !cardData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.errorText}>{error || "Card not found"}</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.stickyTitleContainer}>
          <TouchableOpacity
            style={styles.backButtonContainer}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.name}>{cardData.name}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: cardData.videoUrl }}
              style={styles.video}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping
            />
          </View>

          <Text style={styles.tagline}>{cardData.tagline}</Text>
          <Text style={styles.description}>{cardData.bodyText}</Text>

          <TouchableOpacity
            style={[
              styles.redeemButton,
              pointsRedeemed && styles.redeemButtonDisabled,
            ]}
            onPress={() => handleRedeemPoints(id as string, setPointsRedeemed)}
            disabled={pointsRedeemed}
          >
            <Text style={styles.redeemButtonText}>
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
    backgroundColor: "#121212",
  },
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  stickyTitleContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? (RNStatusBar.currentHeight || 0) + 10 : 10,
    paddingBottom: 10,
    backgroundColor: "#121212",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonContainer: {
    marginRight: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
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
    color: "#f5f5f5",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#e0e0e0",
    marginBottom: 24,
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
    color: "#fff",
  },
  errorText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginVertical: 20,
  },
  backButton: {
    color: "#ddd",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});