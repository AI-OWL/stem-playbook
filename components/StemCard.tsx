import React from "react";
import { View, Image, TouchableOpacity, StyleSheet, Platform, ViewStyle, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get('window').width;
const PADDING = 16;
const CARD_MARGIN = 8;
const CARD_WIDTH = (SCREEN_WIDTH - (PADDING * 2) - (CARD_MARGIN * 4)) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

interface StemCardProps {
  imageUrl: any; // Changed to any to accept both require() and uri
  collected?: boolean;
  rarity?: 'common' | 'rare' | 'epic';
  onPress: () => void;
  style?: ViewStyle;
}

const StemCard: React.FC<StemCardProps> = ({
  imageUrl,
  collected = false,
  rarity = 'common',
  onPress,
  style
}) => {
  const getBorderColor = () => {
    switch (rarity) {
      case "epic": return "#FF44CC";
      case "rare": return "#4477FF";
      case "common": return "#44CC77";
      default: return "#999999";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.container, style]}
    >
      <View style={[
        styles.cardContainer,
        { borderColor: getBorderColor() }
      ]}>
        <Image
          source={imageUrl}
          style={styles.image}
          resizeMode="cover"
          defaultSource={require("@/assets/cards/Default.png")}
        />
        {!collected && <View style={styles.overlay} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  cardContainer: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default StemCard;