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
import { fetchCard } from "../services/cardService";
import { usePoints, PointsProvider } from "../PointsContext";

const handleRedeemPoints = (
  cardId: string,
  setPointsRedeemed: (value: boolean) => void,
  redeemCard: (id: string) => void
) => {
  Alert.alert(
    "Redeem Points",
    "Are you sure you want to redeem 75 points for this card?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: () => {
          redeemCard(cardId);
          setPointsRedeemed(true);
          Alert.alert("Success", "Points have been redeemed successfully!");
        },
      },
    ]
  );
};

function CardDetailsContent({ id, router }) {
  const { redeemCard, isCardRedeemed } = usePoints();
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
        const card = await fetchCard(id as string, token);
        setCardData({
          name: card.name,
          tagline: card.tagline,
          bodyText: card.body,
          videoUrl: card.videoUrl,
        });
        // Check if this card has already been redeemed
        if (isCardRedeemed(id as string)) {
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
  }, [id, isCardRedeemed]);

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
            onPress={() =>
              handleRedeemPoints(id as string, setPointsRedeemed, redeemCard)
            }
            disabled={pointsRedeemed}
          >
            <Text style={styles.redeemButtonText}>
              {pointsRedeemed ? "Points Redeemed" : "Redeem 75 Points"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export default function CardDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <PointsProvider>
      <CardDetailsContent id={id} router={router} />
    </PointsProvider>
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
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight + 10 : 10,
    paddingBottom: 10,
    backgroundColor: "#121212",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
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