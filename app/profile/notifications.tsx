import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const colors = Colors[isDarkMode ? 'dark' : 'light'];

  const [settings, setSettings] = useState({
    pushEnabled: true,
    achievements: true,
    dailyReminders: true,
    messages: true,
    rewards: true,
    gameUpdates: true
  });

  useEffect(() => {
    loadThemePreference();
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

  const handleToggle = (key: keyof typeof settings) => {
    if (key === 'pushEnabled' && settings[key]) {
      Alert.alert(
        'Disable Notifications',
        'Are you sure you want to disable all notifications?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => setSettings(prev => ({ ...prev, [key]: false }))
          }
        ]
      );
    } else {
      setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.icon }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notification Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Main Toggle */}
        <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.icon }]}>
          <View style={styles.mainToggle}>
            <View style={styles.toggleInfo}>
              <Ionicons name="notifications-outline" size={24} color={colors.tint} />
              <View style={styles.toggleTextContainer}>
                <Text style={[styles.toggleTitle, { color: colors.text }]}>Push Notifications</Text>
                <Text style={[styles.toggleDescription, { color: colors.icon }]}>
                  Enable or disable all notifications
                </Text>
              </View>
            </View>
            <Switch
              value={settings.pushEnabled}
              onValueChange={() => handleToggle('pushEnabled')}
              trackColor={{ false: '#767577', true: colors.tint }}
              thumbColor={settings.pushEnabled ? (isDarkMode ? colors.text : '#ffffff') : '#f4f3f4'}
              ios_backgroundColor="#767577"
            />
          </View>
        </View>

        {/* Notification Types */}
        <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.icon }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Types</Text>

          {[
            { key: 'achievements', icon: 'trophy-outline', label: 'Achievements' },
            { key: 'dailyReminders', icon: 'star-outline', label: 'Daily Reminders' },
            { key: 'messages', icon: 'chatbubble-outline', label: 'Messages' },
            { key: 'rewards', icon: 'gift-outline', label: 'Rewards' },
            { key: 'gameUpdates', icon: 'flash-outline', label: 'Game Updates' }
          ].map((item, index, array) => (
            <View
              key={item.key}
              style={[
                styles.toggleItem,
                { borderTopColor: colors.icon },
                index === array.length - 1 && styles.lastToggleItem
              ]}
            >
              <Ionicons name={item.icon as any} size={20} color={colors.icon} />
              <Text style={[styles.toggleText, { color: colors.text }]}>{item.label}</Text>
              <Switch
                value={settings[item.key as keyof typeof settings] && settings.pushEnabled}
                onValueChange={() => handleToggle(item.key as keyof typeof settings)}
                trackColor={{ false: '#767577', true: colors.tint }}
                thumbColor={settings[item.key as keyof typeof settings] ? (isDarkMode ? colors.text : '#ffffff') : '#f4f3f4'}
                ios_backgroundColor="#767577"
                disabled={!settings.pushEnabled}
              />
            </View>
          ))}
        </View>
      </ScrollView>
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
  headerRight: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  mainToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleTextContainer: {
    marginLeft: 12,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 12,
    marginLeft: 16,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
  },
  lastToggleItem: {
    borderBottomWidth: 0,
  },
  toggleText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
});
