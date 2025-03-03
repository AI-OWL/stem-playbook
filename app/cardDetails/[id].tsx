import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchCard } from "../services/cardService";
import { Video, ResizeMode } from "expo-av";

export default function CardDetailsScreen() {
  const params = useLocalSearchParams();
  // Ensure we have a string ID even if it's provided as an array.
  const cardId: string = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

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
        const card = await fetchCard(cardId, token);
        // For the details page we need name, tagline, bodyText, and videoUrl.
        setCardData({
          name: card.name,
          tagline: card.tagline,
          bodyText: card.body, // Assuming the backend property is 'body'
          videoUrl: card.videoUrl,
        });
      } catch (err) {
        console.error("Error fetching card:", err);
        setError("Failed to load card details");
      } finally {
        setLoading(false);
      }
    };

    loadCard();
  }, [cardId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (error || !cardData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || "Card not found"}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sticky Title */}
      <View style={styles.stickyTitleContainer}>
        <Text style={styles.name}>{cardData.name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Spacer so content doesn't overlap the sticky title */}
        <View style={{ height: 60 }} />

        {/* Video Player */}
        <Video
          source={{ uri: cardData.videoUrl }}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
        />

        {/* Card Tagline */}
        <Text style={styles.tagline}>{cardData.tagline}</Text>

        {/* Card Body Text */}
        <Text style={styles.description}>{cardData.bodyText}</Text>

        {/* Redeem Button */}
        <TouchableOpacity
          style={styles.redeemButton}
          onPress={() => Alert.alert("Points Redeemed!")}
        >
          <Text style={styles.redeemButtonText}>Redeem Points</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1c1e",
    paddingHorizontal: 20,
  },
  stickyTitleContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1c1c1e",
    paddingVertical: 10,
    alignItems: "center",
    zIndex: 10,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  video: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    backgroundColor: "#000",
    marginTop: 20,
  },
  tagline: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
  },
  description: {
    fontSize: 16,
    color: "#ddd",
    textAlign: "justify",
    marginTop: 20,
    paddingHorizontal: 10,
    lineHeight: 24,
  },
  redeemButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#ddd",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  redeemButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
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
