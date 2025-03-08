import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  useColorScheme,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

// Create a fallback if image picker is not available
const ImagePicker = {
  MediaTypeOptions: {
    Images: 'Images',
  },
  requestMediaLibraryPermissionsAsync: async () => ({ status: 'granted' }),
  requestCameraPermissionsAsync: async () => ({ status: 'granted' }),
  launchImageLibraryAsync: async () => ({
    canceled: false,
    assets: [{ uri: 'https://via.placeholder.com/150' }],
  }),
  launchCameraAsync: async () => ({
    canceled: false,
    assets: [{ uri: 'https://via.placeholder.com/150' }],
  }),
};

// Attempt to import expo-image-picker dynamically
let ExpoImagePicker;
try {
  ExpoImagePicker = require('expo-image-picker');
} catch (error) {
  console.warn('expo-image-picker not available, using fallback');
  ExpoImagePicker = ImagePicker;
}

function EditProfileScreen() {
  const router = useRouter();
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const colors = Colors[isDarkMode ? 'dark' : 'light'];

  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    loadThemePreference();
    loadProfileImage();
    checkPermissions();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        setIsDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const loadProfileImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem('profileImage');
      if (savedImage) {
        setProfileImage(savedImage);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  const checkPermissions = async () => {
    if (Platform.OS !== 'web') {
      try {
        const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        console.warn('Error checking permissions:', error);
        setHasPermission(true); // Fallback for development
      }
    }
  };

  const handleImagePick = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: handleTakePhoto,
        },
        {
          text: 'Choose from Library',
          onPress: handlePickImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ExpoImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera permission to take photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      setLoading(true);
      const result = await ExpoImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);
        await AsyncStorage.setItem('profileImage', imageUri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    if (!hasPermission && Platform.OS !== 'web') {
      Alert.alert(
        'Permission Required',
        'Please grant photo library access to choose images.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setLoading(true);
      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);
        await AsyncStorage.setItem('profileImage', imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    Alert.alert(
      'Remove Profile Picture',
      'Are you sure you want to remove your profile picture?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await AsyncStorage.removeItem('profileImage');
              setProfileImage(null);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove profile picture.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.imageSection}>
          <TouchableOpacity
            style={[styles.profileImageContainer, { backgroundColor: colors.card }]}
            onPress={handleImagePick}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="large" color={colors.tint} />
            ) : (
              <>
                <Image
                  source={
                    profileImage
                      ? { uri: profileImage }
                      : require('@/assets/images/default-avatar.png')
                  }
                  style={styles.profileImage}
                />
                <View style={[styles.imageOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}>
                  <Ionicons name="camera" size={24} color="#FFFFFF" />
                  <Text style={styles.overlayText}>Change Photo</Text>
                </View>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.imageButtons}>
            <TouchableOpacity
              style={[
                styles.imageButton,
                { backgroundColor: colors.tint },
                loading && styles.buttonDisabled
              ]}
              onPress={handleImagePick}
              disabled={loading}
            >
              <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
              <Text style={styles.imageButtonText}>Upload Photo</Text>
            </TouchableOpacity>

            {profileImage && (
              <TouchableOpacity
                style={[
                  styles.imageButton,
                  styles.removeButton,
                  { borderColor: colors.error },
                  loading && styles.buttonDisabled
                ]}
                onPress={handleRemoveImage}
                disabled={loading}
              >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
                <Text style={[styles.imageButtonText, { color: colors.error }]}>
                  Remove
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  overlayText: {
    color: '#FFFFFF',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  imageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  removeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
});

export default EditProfileScreen;