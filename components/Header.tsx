import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const guidelineBaseWidth = 375;

// Basic scale based on device width
const scale = (size: number) => (width / guidelineBaseWidth) * size;

// For fonts (and similar elements) we want a bit more scaling on larger devices
const responsiveFontSize = (size: number) => {
  const baseScaled = scale(size);
  return width > guidelineBaseWidth ? baseScaled * 1.2 : baseScaled;
};

interface HeaderProps {
  title: string;
  onProfilePress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onProfilePress }) => {
  return (
    // Only apply safe area padding to the top edge to avoid extra bottom padding
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={onProfilePress} style={styles.iconContainer}>
          <Ionicons name="person-circle-outline" size={responsiveFontSize(24)} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F0EBF8', // Matches the header background
  },
  container: {
    height: responsiveFontSize(50),
    backgroundColor: '#F0EBF8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  title: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  iconContainer: {
    position: 'absolute',
    right: responsiveFontSize(16),
  },
});

export default Header;
