import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Image,
  ScrollView,
  useColorScheme,
  AppState,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { logout } from './services/authService';
import { getStoredUser, deleteUser } from './services/userService';

export default function ProfileScreen() {
  const router = useRouter();
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const colors = Colors[isDarkMode ? 'dark' : 'light'];
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userData, setUserData] = useState(null); // Initialize as null

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await getStoredUser();
        setUserData(user);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadThemePreference();
    loadUserData();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        loadThemePreference();
        loadUserData();
      }
    });

    return () => {
      subscription.remove();
    };
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

  const handleThemeChange = async (value: boolean) => {
    try {
      setIsDarkMode(value);
      await AsyncStorage.setItem('theme', value ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handlePasswordChange = () => {
    router.push('/profile/change-password'); // Navigate to new screen
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleAccountDetails = () => {
    router.push('/profile/account');
  };

  const handleNotificationSettings = () => {
    router.push('/profile/notifications');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              if (userData && userData.id) {
                await deleteUser(userData.id); // Delete the user
                await handleLogout(); // Log out after deletion
                router.replace('/login'); // Navigate to login screen
              } else {
                console.error('User ID not found');
                Alert.alert('Error', 'Unable to delete account. Please try again.');
              }
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (!userData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.text }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.icon }]}>
          <View style={styles.profileImageContainer}>
            <Image
              source={require('@/assets/images/default-avatar.png')}
              style={styles.profileImage}
            />
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{userData.name}</Text>
          <Text style={[styles.email, { color: colors.icon }]}>{userData.email}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.icon }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>

          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.icon }]} onPress={handleAccountDetails}>
            <Ionicons name="person-outline" size={20} color={colors.icon} />
            <Text style={[styles.menuText, { color: colors.text }]}>Account Details</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.icon} />
          </TouchableOpacity>

          {/* <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.icon }]} onPress={handlePasswordChange}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.icon} />
            <Text style={[styles.menuText, { color: colors.text }]}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.icon} />
          </TouchableOpacity> */}
        </View>

        <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.icon }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>

          <View style={[styles.menuItem, { borderBottomColor: colors.icon }]}>
            <Ionicons name={isDarkMode ? 'moon-outline' : 'sunny-outline'} size={20} color={colors.icon} />
            <Text style={[styles.menuText, { color: colors.text }]}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={handleThemeChange}
              trackColor={{ false: '#767577', true: colors.tint }}
              thumbColor={isDarkMode ? colors.text : '#f4f3f4'}
              ios_backgroundColor="#767577"
            />
          </View>

          <View style={[styles.menuItem, { borderBottomColor: colors.icon }]}>
            <Ionicons name="notifications-outline" size={20} color={colors.icon} />
            <Text style={[styles.menuText, { color: colors.text }]}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: colors.tint }}
              thumbColor={notificationsEnabled ? colors.text : '#f4f3f4'}
              ios_backgroundColor="#767577"
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.icon }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.icon }]}
            onPress={handleNotificationSettings}
          >
            <Ionicons name="settings-outline" size={20} color={colors.icon} />
            <Text style={[styles.menuText, { color: colors.text }]}>App Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.icon} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.background, borderColor: colors.icon }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: colors.background, borderColor: colors.icon }]}
          onPress={handleDeleteAccount}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e5e7eb',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    marginTop: 4,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    marginLeft: 12,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  deleteText: {
    fontSize: 16,
    color: '#ef4444',
    marginLeft: 12,
    fontWeight: '600',
  },
});