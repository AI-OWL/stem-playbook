import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import { Video, ResizeMode } from "expo-av"; // Using expo-av for video playback

export default function CardDetailsScreen() {
  const { id } = useLocalSearchParams(); // Get the card ID from the URL
  const router = useRouter();

  // Sample data (Replace with actual fetched data in the future)
  const cardData = {
    name: "Rick Astley",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // Sample video
    tagline: "MC2 STEM High School Graduate is now process engineer at Rockwell Automation",
    description:
      "Aalyah Brown first discovered engineering during a summer program when she was in high school. A graduate of MC2 High School, Aaliyah has an undergraduate degree in engineering technology, is working as a process engineer at Rockwell Automation, and is pursuing a master’s in engineering management from Auburn University.",
  };

  return (
    <View style={styles.container}>
      {/* Sticky Title */}
      <View style={styles.stickyTitleContainer}>
        <Text style={styles.name}>{cardData.name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Space at the top so content doesn't overlap the sticky title */}
        <View style={{ height: 60 }} />

        {/* Video Player */}
        <Video
          source={{ uri: cardData.videoUrl }}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN} // Correct way
          isLooping
        />

        {/* Card Tagline */}
        <Text style={styles.tagline}>{cardData.tagline}</Text>

        {/* Card Description */}
        <Text style={styles.description}>{cardData.description}</Text>

        {/* Redeem Button at the Bottom */}
        <TouchableOpacity style={styles.redeemButton} onPress={() => alert("Redeem Points")}>
          <Text style={styles.redeemButtonText}>Redeem Points</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1c1e", // Dark theme background
    paddingHorizontal: 20,
  },
  stickyTitleContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1c1c1e", // Same background color to blend in
    paddingVertical: 10,
    alignItems: "center",
    zIndex: 10, // Ensures it stays on top
  },
  scrollContent: {
    paddingBottom: 100, // Space for the button
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
  },
  video: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    backgroundColor: "#000",
    alignSelf: "center",
  },
  tagline: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    color: "#ddd",
    textAlign: "justify",
    marginTop: 10,
    paddingHorizontal: 10,
    lineHeight: 24, // Increased line spacing for readability
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
});
