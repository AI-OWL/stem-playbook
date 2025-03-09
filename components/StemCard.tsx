import React, { useState } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  ActivityIndicator,
} from "react-native";

interface StemCardProps {
  imageUrl?: string;
  name?: string;
  onPress: () => void;
  style?: ViewStyle;
}

const StemCard: React.FC<StemCardProps> = ({ imageUrl, name, onPress, style }) => {
  const [isLoading, setIsLoading] = useState(true);

  // Handle both successful load and error cases
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.cardWrapper, style]}>
        <View style={styles.cardContainer}>
          {imageUrl ? (
            <>
              {isLoading && (
                <View style={[styles.image, styles.loadingContainer]}>
                  <ActivityIndicator size="large" color="#555" />
                </View>
              )}
              <Image
                source={{ uri: imageUrl }}
                style={[
                  styles.image,
                  isLoading ? styles.hiddenImage : styles.visibleImage,
                ]}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </>
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
  loadingContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  hiddenImage: {
    opacity: 0,
  },
  visibleImage: {
    opacity: 1,
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