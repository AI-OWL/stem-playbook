import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";

// Ensure the path is correct
const localImage = require("../assets/cards/aayliahbrownfront.png");

interface StemCardProps {
  imageUrl?: string;
  name?: string;
}

const StemCard: React.FC<StemCardProps> = ({ imageUrl, name }) => {
  return (
    <View style={styles.cardWrapper}>
      <View style={styles.cardContainer}>
        <Image source={imageUrl ? { uri: imageUrl } : localImage} style={styles.image} />
      </View>
      {name && <Text style={styles.name}>{name}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
  },
  cardContainer: {
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: "#FFFFFF", // Ensures the background doesn't show through
    elevation: 3, // Subtle shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  image: {
    width: 150, // Adjust to the image’s natural size
    height: 225, // Adjust to match the exact aspect ratio
    resizeMode: "stretch", // Ensures the image completely fills the container
  },
  name: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
  },
});

export default StemCard;
