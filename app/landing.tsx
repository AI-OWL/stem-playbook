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
        <Text style={styles.headline}>Discover.{"\n"}Believe.{"\n"}Become.</Text>
      </LinearGradient>
      <View style={styles.content}>
        <Text style={styles.description}>
          It's hard to dream big if you don't see what's possible. That's why NEOSTEM created STEM All–Stars — a fun way to explore STEM careers right here in Northeast Ohio. With local partners, we're connecting you to real people, exciting jobs, and the skills to get there.
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
    width: '100%',
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logo: {
    width: width * 0.35,
    height: width * 0.35,
    marginBottom: 24,
  },
  headline: {
    fontFamily: Fonts.bold,
    fontSize: 36,
    color: '#222',
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 0,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 36,
    marginTop: 24,
  },
  button: {
    backgroundColor: '#00AEEF',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 48,
    alignItems: 'center',
    shadowColor: '#00AEEF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    letterSpacing: 1,
  },
}); 