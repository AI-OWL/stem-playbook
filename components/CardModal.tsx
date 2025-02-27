import React from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_WIDTH = SCREEN_WIDTH * 0.9;
const MODAL_HEIGHT = MODAL_WIDTH * 1.5;

interface CardModalProps {
  visible: boolean;
  imageUrl: any;
  cardId: string | null;
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
  const router = useRouter();

  const handleCardPress = () => {
    if (collected && cardId) {
      onClose();
      router.push(`/cardDetails/${cardId}`);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={[
          styles.modalContent,
          { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }
        ]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons
              name="close-circle"
              size={32}
              color={isDarkMode ? '#ffffff' : '#000000'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cardTouchable}
            onPress={handleCardPress}
            activeOpacity={collected ? 0.7 : 1}
          >
            <Image
              source={imageUrl}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  modalContent: {
    width: MODAL_WIDTH,
    height: MODAL_HEIGHT,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
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
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    padding: 8,
  },
});

export default CardModal;