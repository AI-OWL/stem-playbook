import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar // Import the React Native StatusBar
} from "react-native";
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ResizeMode, Video } from 'expo-av';
import { CARD_DETAILS } from '../data/cardData';

const handleRedeemPoints = (points: number, setPointsRedeemed: (value: boolean) => void) => {
  Alert.alert(
    "Redeem Points",
    `Are you sure you want to redeem ${points} points?`,
    [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Yes",
        onPress: () => {
          setPointsRedeemed(true);
          Alert.alert("Success", "Points have been redeemed successfully!");
        }
      }
    ]
  );
};

export default function CardDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [pointsRedeemed, setPointsRedeemed] = useState(false);

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

          <View style={styles.rarityBadge}>
            <Text style={styles.rarityText}>{cardData.rarity}</Text>
          </View>

          <Text style={styles.tagline}>{cardData.tagline}</Text>
          <Text style={styles.description}>{cardData.description}</Text>

          <TouchableOpacity
            style={[
              styles.redeemButton,
              pointsRedeemed && styles.redeemButtonDisabled
            ]}
            onPress={() => handleRedeemPoints(cardData.points, setPointsRedeemed)}
            disabled={pointsRedeemed}
          >
            <Text style={styles.redeemButtonText}>
              {pointsRedeemed ? "Points Redeemed" : `Redeem ${cardData.points} Points`}
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
     backgroundColor: "#1c1c1e",
     paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0,
   },
   container: {
     flex: 1,
     backgroundColor: "#1c1c1e",
     paddingTop: 20, // Add fixed padding at the top
   },
   stickyTitleContainer: {
     backgroundColor: "#1c1c1e",
     paddingTop: 16,
     paddingBottom: 16,
     paddingHorizontal: 20,
     borderBottomWidth: 1,
     borderBottomColor: "#333",
   },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  videoContainer: {
    marginTop: 20,
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
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
    lineHeight: 24,
  },
  redeemButton: {
    marginTop: 30,
    marginBottom: 30,
    alignSelf: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
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
  rarityBadge: {
    alignSelf: 'center',
    marginTop: 16,
    paddingHorizontal: 15,  
    paddingVertical: 5,  
    borderRadius: 15,  
    backgroundColor: "#FFD700",  
  },  
  rarityText: {  
    color: "#000",  
    fontWeight: "bold",  
    fontSize: 14,  
    textTransform: "uppercase",  
  },  
});  