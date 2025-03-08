import React, { useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  FlatList,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface StoreItemModalProps {
  visible: boolean;
  item: any;
  onClose: () => void;
  onPurchase: () => void;
  isDarkMode: boolean;
}

const DefaultImage = require("../assets/images/Shop/PremiumAvatar.png");

// Helper to handle image source resolution
const getImageSource = (itemId, imageIndex = 0) => {
  // Return specific images based on item ID and index
  if (itemId === "1") {
    const images = [
      require("../assets/images/Shop/PremiumAvatar.png"),
      require("../assets/images/Shop/PremiumAvatar.png"), // Alt versions would go here
      require("../assets/images/Shop/PremiumAvatar.png")
    ];
    return images[imageIndex] || images[0];
  } else if (itemId === "2") {
    const images = [
      require("../assets/images/Shop/DarkThemePack.png"),
      require("../assets/images/Shop/DarkThemePack.png"), // Alt versions would go here
      require("../assets/images/Shop/DarkThemePack.png")
    ];
    return images[imageIndex] || images[0];
  } else if (itemId === "3") {
    const images = [
      require("../assets/images/Shop/AchievementBadge.png"),
      require("../assets/images/Shop/AchievementBadge.png") // Alt versions would go here
    ];
    return images[imageIndex] || images[0];
  } else if (itemId === "4") {
    const images = [
      require("../assets/images/Shop/ProfileBackground.png"),
      require("../assets/images/Shop/ProfileBackground.png"), // Alt versions would go here
      require("../assets/images/Shop/ProfileBackground.png"),
      require("../assets/images/Shop/ProfileBackground.png")
    ];
    return images[imageIndex] || images[0];
  }

  return DefaultImage;
};

const StoreItemModal: React.FC<StoreItemModalProps> = ({
  visible,
  item,
  onClose,
  onPurchase,
  isDarkMode,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { points, isPurchased } = usePoints();

  if (!visible || !item) return null;

  const canAfford = points >= item.points;
  const alreadyPurchased = isPurchased(item.id);

  const images = item.imageGallery || [item.imageUrl];

  // Determine rarity color
  const getRarityColor = () => {
    switch (item.rarity) {
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

  // Determine button color
  const getButtonColor = () => {
    if (alreadyPurchased) return "#4CAF50"; // Green
    if (canAfford) return "#3498DB"; // Blue
    return "#A0A0A0"; // Gray
  };

  // Determine button text
  const getButtonText = () => {
    if (alreadyPurchased) return "Purchased";
    return `Purchase for ${item.points} Points`;
  };

  const handleNextImage = () => {
    if (activeImageIndex < images.length - 1) {
      setActiveImageIndex(activeImageIndex + 1);
      flatListRef.current?.scrollToIndex({
        index: activeImageIndex + 1,
        animated: true,
      });
    }
  };

  const handlePrevImage = () => {
    if (activeImageIndex > 0) {
      setActiveImageIndex(activeImageIndex - 1);
      flatListRef.current?.scrollToIndex({
        index: activeImageIndex - 1,
        animated: true,
      });
    }
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === activeImageIndex
                  ? getRarityColor()
                  : isDarkMode ? "#555" : "#ccc",
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDarkMode
              ? "rgba(0, 0, 0, 0.9)"
              : "rgba(0, 0, 0, 0.75)",
          },
        ]}
      >
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: isDarkMode ? "#121212" : "#FFFFFF",
              borderColor: getRarityColor(),
            },
          ]}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons
              name="close"
              size={24}
              color={isDarkMode ? "#FFFFFF" : "#000000"}
            />
          </TouchableOpacity>

          <View style={styles.galleryContainer}>
            <FlatList
              ref={flatListRef}
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, index) => `image-${index}`}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(
                  e.nativeEvent.contentOffset.x / width
                );
                setActiveImageIndex(index);
              }}
              renderItem={({ item: img, index }) => (
                <View style={styles.imageWrapper}>
                  <Image
                    source={getImageSource(item.id, index)}
                    style={styles.galleryImage}
                    resizeMode="contain"
                  />
                </View>
              )}
            />

            {images.length > 1 && (
              <>
                <TouchableOpacity
                  style={[styles.navButton, styles.leftButton]}
                  onPress={handlePrevImage}
                  disabled={activeImageIndex === 0}
                >
                  <Ionicons
                    name="chevron-back"
                    size={24}
                    color={
                      activeImageIndex === 0
                        ? "rgba(150, 150, 150, 0.5)"
                        : "#FFFFFF"
                    }
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.navButton, styles.rightButton]}
                  onPress={handleNextImage}
                  disabled={activeImageIndex === images.length - 1}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={
                      activeImageIndex === images.length - 1
                        ? "rgba(150, 150, 150, 0.5)"
                        : "#FFFFFF"
                    }
                  />
                </TouchableOpacity>
              </>
            )}
            {renderDots()}
          </View>

          <ScrollView style={styles.detailsContainer}>
            <View style={styles.headerRow}>
              <Text
                style={[
                  styles.title,
                  { color: isDarkMode ? "#FFFFFF" : "#000000" },
                ]}
              >
                {item.title}
              </Text>
              <View style={[styles.rarityBadge, { backgroundColor: getRarityColor() }]}>
                <Text style={styles.rarityText}>{item.rarity.toUpperCase()}</Text>
              </View>
            </View>

            <Text
              style={[
                styles.description,
                { color: isDarkMode ? "#CCCCCC" : "#555555" },
              ]}
            >
              {item.body}
            </Text>

            <View style={styles.detailsSection}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDarkMode ? "#FFFFFF" : "#000000" },
                ]}
              >
                Details
              </Text>
              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: isDarkMode ? "#CCCCCC" : "#555555" },
                  ]}
                >
                  Type:
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: isDarkMode ? "#FFFFFF" : "#000000" },
                  ]}
                >
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: isDarkMode ? "#CCCCCC" : "#555555" },
                  ]}
                >
                  Points Required:
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: isDarkMode ? "#FFFFFF" : "#000000" },
                  ]}
                >
                  {item.points} Points
                </Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.purchaseButton,
              { backgroundColor: getButtonColor() },
            ]}
            disabled={!canAfford || alreadyPurchased}
            onPress={onPurchase}
          >
            <Text style={styles.purchaseButtonText}>{getButtonText()}</Text>
            {!alreadyPurchased && (
              <Ionicons name="star-outline" size={18} color="white" style={{ marginLeft: 6 }} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "80%",
    borderRadius: 16,
    borderWidth: 2,
    overflow: "hidden",
    ...Platform.select({
      web: {
        maxWidth: 500,
        maxHeight: 700,
      },
    }),
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryContainer: {
    height: "40%",
    position: "relative",
  },
  imageWrapper: {
    width,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  navButton: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  leftButton: {
    left: 10,
  },
  rightButton: {
    right: 10,
  },
  dotsContainer: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  detailsContainer: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
  },
  rarityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  rarityText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  detailsSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 15,
    width: 140,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  purchaseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  purchaseButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default StoreItemModal;