import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const colors = Colors[isDarkMode ? 'dark' : 'light'];

  const [step, setStep] = useState('verify'); // verify, code, change
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
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

  const handleSendVerification = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert(
        'Verification Code Sent',
        'Please check your email for the verification code.',
        [{ text: 'OK' }]
      );
      setStep('code');
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (formData.verificationCode.length !== 6) {
        throw new Error('Invalid code');
      }
      setStep('change');
    } catch (error) {
      Alert.alert('Error', 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert(
        'Success',
        'Your password has been changed successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderVerifyStep = () => (
    <View style={styles.content}>
      <Text style={[styles.description, { color: colors.text }]}>
        To change your password, we'll first send a verification code to your email address.
      </Text>
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Current Password</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.icon }]}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.icon} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={formData.currentPassword}
            onChangeText={(text) => setFormData({ ...formData, currentPassword: text })}
            secureTextEntry={!showPassword}
            placeholder="Enter current password"
            placeholderTextColor={colors.icon}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.icon}
            />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: colors.tint },
          loading && { backgroundColor: isDarkMode ? '#1e3a8a' : '#93c5fd' }
        ]}
        onPress={handleSendVerification}
        disabled={loading || !formData.currentPassword}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Send Verification Code</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderCodeStep = () => (
    <View style={styles.content}>
      <Text style={[styles.description, { color: colors.text }]}>
        Enter the 6-digit verification code sent to your email.
      </Text>
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Verification Code</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.icon }]}>
          <Ionicons name="mail-outline" size={20} color={colors.icon} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={formData.verificationCode}
            onChangeText={(text) => setFormData({ ...formData, verificationCode: text })}
            placeholder="Enter 6-digit code"
            placeholderTextColor={colors.icon}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: colors.tint },
          loading && { backgroundColor: isDarkMode ? '#1e3a8a' : '#93c5fd' }
        ]}
        onPress={handleVerifyCode}
        disabled={loading || formData.verificationCode.length !== 6}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Verify Code</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleSendVerification}
        disabled={loading}
      >
        <Text style={[styles.resendText, { color: colors.tint }]}>Resend Code</Text>
      </TouchableOpacity>
    </View>
  );

  const renderChangeStep = () => (
    <View style={styles.content}>
      <Text style={[styles.description, { color: colors.text }]}>
        Enter your new password. It must be at least 8 characters long.
      </Text>
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.icon }]}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.icon} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={formData.newPassword}
            onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
            secureTextEntry={!showPassword}
            placeholder="Enter new password"
            placeholderTextColor={colors.icon}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.icon}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Confirm New Password</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.icon }]}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.icon} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            secureTextEntry={!showConfirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor={colors.icon}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.icon}
            />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: colors.tint },
          loading && { backgroundColor: isDarkMode ? '#1e3a8a' : '#93c5fd' }
        ]}
        onPress={handleChangePassword}
        disabled={loading || !formData.newPassword || !formData.confirmPassword}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Change Password</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.icon }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Change Password</Text>
        <View style={styles.headerRight} />
      </View>

      {step === 'verify' && renderVerifyStep()}
      {step === 'code' && renderCodeStep()}
      {step === 'change' && renderChangeStep()}
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
    padding: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
  },
  resendText: {
    fontSize: 16,
    fontWeight: '500',
  },
});