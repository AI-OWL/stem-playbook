import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Fonts } from '@/constants/Fonts';

const { width } = Dimensions.get('window');

export default function Landing() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#b6eaff", "#fff"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={styles.gradient}
      >
        <Image
          source={require('../assets/images/STEM All-Stars Logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headline}>You Can't Know What's Possible Until You Find Out</Text>
      </LinearGradient>
      <View style={styles.content}>
        <Text style={styles.description}>
          Discover the exciting world of STEM careers through our unique trading card collection. Each card connects you to real professionals in your network, helping you explore and understand different career paths in Science, Technology, Engineering, and Mathematics.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/login')}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  logo: {
    width: width * 0.6,
    height: width * 0.6,
    marginBottom: 30,
  },
  headline: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    color: '#1e40af',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 36,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#1e40af',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  buttonText: {
    fontFamily: Fonts.bold,
    color: '#ffffff',
    fontSize: 18,
  },
}); 