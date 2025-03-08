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
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { ResizeMode, Video } from "expo-av";
import { CARD_DETAILS } from "../data/cardData";
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
    ],
  );
};

function CardDetailsContent({ id, router }) {
  const { redeemCard, isCardRedeemed } = usePoints();
  const [pointsRedeemed, setPointsRedeemed] = useState(false);

  useEffect(() => {
    // Check if this card has already been redeemed
    if (id && isCardRedeemed(id as string)) {
      setPointsRedeemed(true);
    }
  }, [id, isCardRedeemed]);

  const cardData = CARD_DETAILS[id as keyof typeof CARD_DETAILS];

  if (!cardData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.name}>Card not found</Text>
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

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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

          <Text style={styles.description}>{cardData.description}</Text>

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
              {pointsRedeemed
                ? "Points Redeemed"
                : "Redeem 75 Points"}
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
});