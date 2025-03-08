import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface AchievementItemProps {
  title: string;
  description: string;
  imageUrl?: string;
  points: number;
  completed: boolean;
  progress: number;
  total: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  onRedeem: () => void;
}

const rarityColors = {
  common: "#A0A0A0",
  rare: "#3B82F6",
  epic: "#8B5CF6",
  legendary: "#F59E0B",
};

const AchievementItem: React.FC<AchievementItemProps> = ({
  title,
  description,
  imageUrl,
  points,
  completed,
  progress,
  total,
  rarity,
  onRedeem,
}) => {
  const [redeemed, setRedeemed] = useState(false);
  const progressPercentage = (progress / total) * 100;

  const handleRedeem = () => {
    if (completed && !redeemed) {
      setRedeemed(true);
      if (onRedeem) onRedeem();
    }
  };

  return (
    <View style={[styles.card, { borderColor: rarityColors[rarity] }]}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={typeof imageUrl === 'number' ? imageUrl : (typeof imageUrl === 'string' ? { uri: imageUrl } : null)}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              { backgroundColor: rarityColors[rarity] + "20" },
            ]}
          >
            <FontAwesome name="trophy" size={32} color={rarityColors[rarity]} />
          </View>
        )}
        <View
          style={[
            styles.rarityBadge,
            { backgroundColor: rarityColors[rarity] },
          ]}
        >
          <Text style={styles.rarityText}>{rarity}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: rarityColors[rarity],
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{`${progress}/${total}`}</Text>
        </View>

        <View style={styles.bottomContainer}>
          <Text style={styles.points}>{points} Points</Text>
          <TouchableOpacity
            style={[
              styles.button,
              !completed && styles.buttonDisabled,
              redeemed && styles.buttonRedeemed
            ]}
            onPress={handleRedeem}
            disabled={!completed || redeemed}
          >
            <Text
              style={[
                styles.buttonText,
                !completed && styles.buttonTextDisabled,
                redeemed && styles.buttonTextRedeemed
              ]}
            >
              {redeemed ? "Redeemed" : "Redeem"}
            </Text>
            {completed && !redeemed && (
              <FontAwesome
                name="exclamation-circle"
                size={16}
                color="#F59E0B"
                style={styles.exclamation}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    width: "100%",
    maxWidth: 400,
  },
  imageContainer: {
    position: "relative",
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
    height: 120,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  placeholder: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  rarityBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  content: {
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "right",
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  points: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: "#E5E7EB",
  },
  buttonRedeemed: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  buttonTextDisabled: {
    color: "#9CA3AF",
  },
  buttonTextRedeemed: {
    color: "white",
  },
  exclamation: {
    marginLeft: 8,
  },
});

export default AchievementItem;