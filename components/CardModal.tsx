import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Image,
  TouchableWithoutFeedback,
  Text,
  StyleSheet,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";

interface CardModalProps {
  visible: boolean;
  imageUrl?: string;
  onClose: () => void;
  cardId?: string;
}

const CardModal: React.FC<CardModalProps> = ({ visible, imageUrl, onClose, cardId }) => {
  const [internalVisible, setInternalVisible] = useState(visible);
  const [localImageUrl, setLocalImageUrl] = useState(imageUrl); // Preserve image
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const router = useRouter();

  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      if (imageUrl) setLocalImageUrl(imageUrl); // Set image only when opening

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
        setLocalImageUrl(undefined); // ✅ Clear image only after fade-out
      });
    }
  }, [visible, imageUrl]);

  if (!internalVisible) return null;

  return (
    <Modal 
      visible={internalVisible} 
      transparent 
      animationType="none" 
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View 
          style={[styles.overlay, { opacity }]}
          pointerEvents={visible ? "auto" : "none"}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              // Only navigate if the card is NOT a mystery card
              if (cardId && imageUrl) {
                onClose(); 
                router.push(`/cardDetails/${cardId}`);
              }
            }}
          >
            <View style={styles.modalContent}>
              {localImageUrl ? (
                <Image source={{ uri: localImageUrl }} style={styles.image} />
              ) : (
                <View style={[styles.image, styles.placeholder]}>
                  <Text style={styles.questionMark}>?</Text>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 300,
    height: 450,
    backgroundColor: "#FFF",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
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
});

export default CardModal;