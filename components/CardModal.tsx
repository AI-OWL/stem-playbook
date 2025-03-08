import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MODAL_WIDTH = SCREEN_WIDTH * 0.9;
const MODAL_HEIGHT = MODAL_WIDTH * 1.5;

interface CardModalProps {
  visible: boolean;
  imageUrl?: string;
  cardId?: string | null;
  onClose: () => void;
  isDarkMode: boolean;
  collected?: boolean;
}

const CardModal: React.FC<CardModalProps> = ({
  visible,
  imageUrl,
  cardId,
  onClose,
  isDarkMode,
  collected = false,
}) => {
  const [internalVisible, setInternalVisible] = useState(visible);
  const [localImageUrl, setLocalImageUrl] = useState(imageUrl);
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const router = useRouter();

  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      if (imageUrl) setLocalImageUrl(imageUrl);

      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setInternalVisible(false);
        setLocalImageUrl(undefined);
      });
    }
  }, [visible, imageUrl]);

  const handleCardPress = () => {
    if (collected && cardId && imageUrl) {
      onClose();
      router.push(`/cardDetails/${cardId}`);
    }
  };

  if (!internalVisible) return null;

  return (
    <Modal
      visible={internalVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[styles.modalContainer, { opacity }]}
        pointerEvents={visible ? "auto" : "none"}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff" },
          ]}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons
              name="close-circle"
              size={32}
              color={isDarkMode ? "#ffffff" : "#000000"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cardTouchable}
            onPress={handleCardPress}
            activeOpacity={collected ? 0.7 : 1}
            disabled={!collected}
          >
            {localImageUrl ? (
              <Image
                source={{ uri: localImageUrl }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.modalImage, styles.placeholder]}>
                <Text style={styles.questionMark}>?</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  modalContent: {
    width: MODAL_WIDTH,
    height: MODAL_HEIGHT,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  cardTouchable: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  placeholder: {
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  questionMark: {
    fontSize: 80,
    fontWeight: "bold",
    color: "#555",
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
    padding: 8,
  },
});

export default CardModal;