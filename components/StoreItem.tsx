import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Function to return different images for each store item
const getImageSource = (id) => {
  switch(id) {
    case "1":
      return require('../assets/images/Shop/PremiumAvatar.png');
    case "2":
      return require('../assets/images/Shop/DarkThemePack.png');
    case "3":
      return require('../assets/images/Shop/AchievementBadge.png');
    case "4":
      return require('../assets/images/Shop/ProfileBackground.png');
    default:
      return require('../assets/images/Shop/PremiumAvatar.png');
  }
};

interface StoreItemProps {
  id: string;
  title: string;
  body: string;
  points: number;
  imageUrl?: string;
  imageGallery?: string[];
  type: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  onPress: () => void;
  canAfford: boolean;
  alreadyPurchased: boolean;
}

const StoreItem: React.FC<StoreItemProps> = ({
  id,
  title,
  body,
  points: itemPoints,
  imageUrl,
  imageGallery,
  type,
  rarity,
  onPress,
  canAfford,
  alreadyPurchased,
}) => {
  // Determine border color based on rarity
  const getRarityColor = () => {
    switch (rarity) {
      case "common":
        return "#A0A0A0"; // Gray
      case "rare":
        return "#3498DB"; // Blue
      case "epic":
        return "#9B59B6"; // Purple
      case "legendary":
        return "#F39C12"; // Orange/Gold
      default:
        return "#A0A0A0";
    }
  };

  // Determine button color based on purchase status
  const getButtonColor = () => {
    if (alreadyPurchased) return "#4CAF50"; // Green
    if (canAfford) return "#3498DB"; // Blue
    return "#A0A0A0"; // Gray
  };

  // Determine button text based on purchase status
  const getButtonText = () => {
    if (alreadyPurchased) return "Purchased";
    return `${itemPoints} Points`;
  };

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: getRarityColor() }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={getImageSource(id)}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder} />
        )}
        <View style={[styles.rarityBadge, { backgroundColor: getRarityColor() }]}>
          <Text style={styles.rarityText}>{rarity.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>

        <TouchableOpacity
          style={[styles.purchaseButton, { backgroundColor: getButtonColor() }]}
          disabled={!canAfford || alreadyPurchased}
          onPress={onPress}
        >
          <Text style={styles.buttonText}>{getButtonText()}</Text>
          {!alreadyPurchased && (
            <Ionicons name="star-outline" size={16} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 0,
    marginVertical: 10,
    marginHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  placeholder: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: "#E0E0E0", // Grey placeholder
  },
  rarityBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  rarityText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 10,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
  },
  purchaseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    marginRight: 6,
  },
});

export default StoreItem;