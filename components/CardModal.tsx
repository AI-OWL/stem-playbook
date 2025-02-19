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

interface CardModalProps {
  visible: boolean;
  imageUrl?: string;
  onClose: () => void;
}

const CardModal: React.FC<CardModalProps> = ({ visible, imageUrl, onClose }) => {
  // Control the modal's mounting and store the current image URL.
  const [internalVisible, setInternalVisible] = useState(visible);
  const [localImageUrl, setLocalImageUrl] = useState(imageUrl);

  // Animated opacity value for the entire overlay.
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    if (visible) {
      // When opening: update the internal state and fade in immediately.
      setInternalVisible(true);
      setLocalImageUrl(imageUrl);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // When closing: start the fade-out immediately.
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // After the fade-out completes, unmount the modal.
        setInternalVisible(false);
      });
    }
  }, [visible, imageUrl, opacity]);

  if (!internalVisible) return null;

  return (
    <Modal visible={true} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity }]}>
          <TouchableWithoutFeedback onPress={() => {}}>
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
