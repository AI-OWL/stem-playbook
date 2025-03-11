import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { changeUserPassword, getStoredUser } from '../services/userService';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const systemColorScheme = useColorScheme();
  const isDarkMode = systemColorScheme === 'dark';
  const colors = Colors[isDarkMode ? 'dark' : 'light'];
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirmation do not match');
      return;
    }

    setLoading(true);
    try {
      const user = await getStoredUser();
      if (!user) {
        throw new Error('User not found');
      }

      await changeUserPassword(user.id, currentPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Password change error:', error);
      const errorMessage =
        error.response?.status === 401
          ? 'Current password is incorrect'
          : 'Failed to change password. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { 
        backgroundColor: colors.background,
        borderBottomColor: colors.border 
      }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.icon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Change Password
        </Text>
      </View>

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TextInput
          style={[styles.input, { 
            borderColor: colors.border, 
            color: colors.text,
            backgroundColor: colors.background 
          }]}
          placeholder="Current Password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, { 
            borderColor: colors.border, 
            color: colors.text,
            backgroundColor: colors.background 
          }]}
          placeholder="New Password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, { 
            borderColor: colors.border, 
            color: colors.text,
            backgroundColor: colors.background 
          }]}
          placeholder="Confirm New Password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: loading ? colors.textSecondary : colors.tint }
          ]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Changing...' : 'Change Password'}
          </Text>
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});