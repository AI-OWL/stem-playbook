import React from "react";
import { View, Image, Text, StyleSheet, TouchableOpacity } from "react-native";

interface StemCardProps {
  imageUrl?: string;
  name?: string;
  onPress: () => void; // New prop to handle modal opening
}

const StemCard: React.FC<StemCardProps> = ({ imageUrl, name, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardWrapper}>
        <View style={styles.cardContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholder]}>
              <Text style={styles.questionMark}>?</Text>
            </View>
          )}
        </View>
        {name && <Text style={styles.name}>{name}</Text>}
      </View>
    </TouchableOpacity>
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
    backgroundColor: "#FFFFFF",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  image: {
    width: 150,
    height: 225,
    resizeMode: "stretch",
  },
  placeholder: {
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  questionMark: {
    fontSize: 60,
    fontWeight: "bold",
    color: "#555",
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
