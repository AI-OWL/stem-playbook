import React from 'react';
import { StyleSheet, View, Image, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Header from '@/components/Header';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Home" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Image
            source={require('../../assets/images/STEM All-Stars Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          
          <ThemedText style={styles.title}>
            You Can't Know What's Possible Until You Find Out
          </ThemedText>
          
          <ThemedText style={styles.subtitle}>
            Welcome to STEM All-Stars!
          </ThemedText>
          
          <ThemedText style={styles.description}>
            Discover the exciting world of STEM careers through our unique trading card collection. Each card connects you to real professionals in your network, helping you explore and understand different career paths in Science, Technology, Engineering, and Mathematics.
          </ThemedText>
          
          <View style={styles.cardInfo}>
            <ThemedText style={styles.cardTitle}>
              Collect Cards in Your All Stars Wallet
            </ThemedText>
            <ThemedText style={styles.cardDescription}>
              Build your collection by exploring different STEM careers. Each card you collect represents a new opportunity to learn and grow in your STEM journey.
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  cardInfo: {
    backgroundColor: 'rgba(0, 174, 239, 0.1)',
    padding: 20,
    borderRadius: 12,
    width: '100%',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
}); 