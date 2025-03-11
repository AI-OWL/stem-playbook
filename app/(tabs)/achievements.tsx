import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Animated,
  RefreshControl,
  Alert,
  Platform,
  useColorScheme,
  ActivityIndicator,
  Image,
} from 'react-native';

// Add image prefetching and caching
Image.prefetch = Image.prefetch || function() { return Promise.resolve(); };
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Header from '@/components/Header';
import AchievementItem from '@/components/ui/AchievementItem';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const REFRESH_INTERVAL = 300000; // 5 minutes
const ANIMATION_DELAY = 100;
const STORAGE_KEYS = {
  THEME: 'theme',
  STATS: 'achievementStats',
};

// Flag to indicate "Coming Soon" mode
const IS_COMING_SOON = true;

const MOCK_ACHIEVEMENTS = [
  {
    id: '1',
    title: 'Epic Pioneer',
    description: 'Get your first epic card!',
    imageUrl: require('@/assets/images/Achievements/FirstEpicCard.png'),
    points: 100,
    progress: 1,
    total: 1,
    completed: true,
    dateCompleted: '2025-02-20',
    type: 'milestone',
    rarity: 'epic'
  },
  {
    id: '2',
    title: 'STEM Scholar',
    description: 'Collect 1 card from each category!',
    imageUrl: require('@/assets/images/Achievements/CardCollector.png'),
    points: 250,
    progress: 3,
    total: 5,
    completed: false,
    type: 'progress',
    rarity: 'rare'
  },
  {
    id: '3',
    title: 'Point Prodigy',
    description: 'Get 500 points!',
    imageUrl: require('@/assets/images/Achievements/PointsMaster.png'),
    points: 500,
    progress: 350,
    total: 500,
    completed: false,
    type: 'progress',
    rarity: 'epic'
  },
  {
    id: '4',
    title: 'Prize Pioneer',
    description: 'Redeem your first prize!',
    imageUrl: require('@/assets/images/Achievements/PrizeRedeemer.png'),
    points: 1000,
    progress: 0,
    total: 1,
    completed: false,
    type: 'milestone',
    rarity: 'legendary'
  },
  {
    id: '5',
    title: 'Top Scientist',
    description: 'Be in the top 10 on the leaderboard!',
    imageUrl: require('@/assets/images/Achievements/LeaderboardStar.png'),
    points: 1500,
    progress: 0,
    total: 1,
    completed: false,
    type: 'milestone',
    rarity: 'legendary'
  },
];

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const Achievements = () => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const colors = useMemo(() => Colors[isDarkMode ? 'dark' : 'light'], [isDarkMode]);

  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false); // Set to false by default for "Coming Soon"
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    completed: 0,
    total: 0,
    points: 0,
  });

  const scrollY = useRef(new Animated.Value(0)).current;
  const itemAnimations = useRef(new Map()).current;
  const refreshInterval = useRef(null);
  const isMounted = useRef(true);

  // Enhanced theme management
  useEffect(() => {
    if (!IS_COMING_SOON) {
      const checkAndUpdateTheme = async () => {
        try {
          const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
          if (savedTheme !== null) {
            setIsDarkMode(savedTheme === 'dark');
          } else {
            setIsDarkMode(systemColorScheme === 'dark');
            await AsyncStorage.setItem(STORAGE_KEYS.THEME, systemColorScheme);
          }
        } catch (error) {
          console.error('Theme check error:', error);
        }
      };

      checkAndUpdateTheme();
      const themeInterval = setInterval(checkAndUpdateTheme, 1000);

      return () => clearInterval(themeInterval);
    }
  }, [systemColorScheme]);

  // Theme change handler
  const toggleTheme = useCallback(async () => {
    if (!IS_COMING_SOON) {
      try {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        await AsyncStorage.setItem(STORAGE_KEYS.THEME, newTheme ? 'dark' : 'light');
      } catch (error) {
        console.error('Theme toggle error:', error);
      }
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!IS_COMING_SOON) {
      initializeApp();

      return () => {
        isMounted.current = false;
        if (refreshInterval.current) {
          clearInterval(refreshInterval.current);
        }
        itemAnimations.clear();
      };
    }
  }, []);

  const initializeApp = async () => {
    if (!IS_COMING_SOON) {
      try {
        await Promise.all([
          loadThemePreference(),
          loadInitialData(),
        ]);

        refreshInterval.current = setInterval(() => {
          if (!refreshing && isMounted.current) {
            loadAchievements(true);
          }
        }, REFRESH_INTERVAL);
      } catch (error) {
        console.error('Initialization error:', error);
        setError('Failed to initialize app');
      }
    }
  };

  const loadThemePreference = async () => {
    if (!IS_COMING_SOON) {
      try {
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
        if (savedTheme && isMounted.current) {
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (error) {
        console.error('Theme loading error:', error);
      }
    }
  };

  const loadInitialData = async () => {
    if (!IS_COMING_SOON) {
      try {
        await Promise.all([
          loadAchievements(true),
          loadUserStats(),
        ]);
      } catch (error) {
        console.error('Initial data loading error:', error);
        setError('Failed to load initial data');
      }
    }
  };

  const loadUserStats = async () => {
    if (!IS_COMING_SOON) {
      try {
        const savedStats = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
        if (savedStats && isMounted.current) {
          setStats(JSON.parse(savedStats));
        }
      } catch (error) {
        console.error('Stats loading error:', error);
        setError('Failed to load user stats');
      }
    }
  };

  const animateItems = useCallback((items) => {
    if (!IS_COMING_SOON) {
      const animations = items.map((item, index) => {
        if (!itemAnimations.has(item.id)) {
          itemAnimations.set(item.id, new Animated.Value(0));
        }
        return Animated.spring(itemAnimations.get(item.id), {
          toValue: 1,
          tension: 50,
          friction: 7,
          delay: index * ANIMATION_DELAY,
          useNativeDriver: true,
        });
      });

      Animated.stagger(ANIMATION_DELAY, animations).start();
    }
  }, []);

  const loadAchievements = async (refresh = false) => {
    if (!IS_COMING_SOON) {
      try {
        if (refresh) {
          setError(null);
        }
        setLoading(true);

        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (isMounted.current) {
          // Prefetch images for better loading performance
          const prefetchPromises = MOCK_ACHIEVEMENTS
            .filter(achievement => achievement.imageUrl)
            .map(achievement => {
              // For require'd images, no prefetching needed
              if (typeof achievement.imageUrl === 'number') {
                return Promise.resolve();
              }
              // For URLs, prefetch if it's a string URL
              if (typeof achievement.imageUrl === 'string' &&
                  achievement.imageUrl.startsWith('http')) {
                return Image.prefetch(achievement.imageUrl).catch(err => {
                  console.warn('Failed to prefetch:', achievement.imageUrl, err);
                  return Promise.resolve();
                });
              }
              return Promise.resolve();
            });

          // Wait for all prefetches to complete or fail
          await Promise.all(prefetchPromises);

          setAchievements(MOCK_ACHIEVEMENTS);
          animateItems(MOCK_ACHIEVEMENTS);

          // Update stats
          const completed = MOCK_ACHIEVEMENTS.filter(a => a.completed).length;
          const totalPoints = MOCK_ACHIEVEMENTS.reduce((sum, a) =>
            sum + (a.completed ? a.points : 0), 0);
          const newStats = {
            completed,
            total: MOCK_ACHIEVEMENTS.length,
            points: totalPoints,
          };
          setStats(newStats);
          await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(newStats));
        }

      } catch (error) {
        console.error('Achievements loading error:', error);
        setError('Failed to load achievements');
        Alert.alert('Error', 'Failed to load achievements. Please try again.');
      } finally {
        if (isMounted.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }
  };

  const handleRefresh = useCallback(() => {
    if (!IS_COMING_SOON) {
      setRefreshing(true);
      loadAchievements(true);
    }
  }, []);

  const handleRedeem = useCallback(async (achievement) => {
    if (!IS_COMING_SOON) {
      if (!achievement.completed) {
        Alert.alert('Not Available', 'Complete this achievement to claim your reward!');
        return;
      }

      try {
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        Alert.alert(
          'Success!',
          `You've claimed ${achievement.points} points for "${achievement.title}"!`,
          [{ text: 'OK' }]
        );

        const animation = itemAnimations.get(achievement.id);
        if (animation) {
          Animated.sequence([
            Animated.spring(animation, {
              toValue: 0.95,
              tension: 100,
              friction: 5,
              useNativeDriver: true,
            }),
            Animated.spring(animation, {
              toValue: 1,
              tension: 100,
              friction: 5,
              useNativeDriver: true,
            }),
          ]).start();
        }

      } catch (error) {
        console.error('Achievement redemption error:', error);
        Alert.alert('Error', 'Failed to redeem achievement. Please try again.');
      }
    }
  }, []);

  const renderItem = useCallback(({ item }) => {
    const scale = itemAnimations.get(item.id) || new Animated.Value(1);

    return (
      <Animated.View
        style={{
          transform: [{ scale }],
          opacity: scale,
          width: '100%',
          alignItems: 'center',
        }}
      >
        <AchievementItem
          title={item.title}
          description={item.description}
          imageUrl={item.imageUrl}
          points={item.points}
          completed={item.completed}
          progress={item.progress}
          total={item.total}
          rarity={item.rarity}
          onRedeem={() => handleRedeem(item)}
        />
      </Animated.View>
    );
  }, [handleRedeem]);

  const renderHeader = useCallback(() => (
    <Animated.View
      style={[
        styles.statsContainer,
        {
          backgroundColor: colors.card,
          transform: [{
            translateY: scrollY.interpolate({
              inputRange: [-100, 0, 100],
              outputRange: [50, 0, -50],
              extrapolate: 'clamp',
            }),
          }],
        },
      ]}
    >
      <View style={styles.statItem}>
        <FontAwesome name="trophy" size={24} color={colors.tint} />
        <ThemedText style={[styles.statValue, { color: isDarkMode ? '#FFFFFF' : colors.text }]}>
          {stats.completed}
        </ThemedText>
        <ThemedText style={[styles.statLabel, { color: isDarkMode ? '#FFFFFF' : colors.text }]}>
          Completed
        </ThemedText>
      </View>
      <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
      <View style={styles.statItem}>
        <FontAwesome name="star" size={24} color={colors.tint} />
        <ThemedText style={[styles.statValue, { color: isDarkMode ? '#FFFFFF' : colors.text }]}>
          {stats.points}
        </ThemedText>
        <ThemedText style={[styles.statLabel, { color: isDarkMode ? '#FFFFFF' : colors.text }]}>
          Points
        </ThemedText>
      </View>
      <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
      <View style={styles.statItem}>
        <FontAwesome name="tasks" size={24} color={colors.tint} />
        <ThemedText style={[styles.statValue, { color: isDarkMode ? '#FFFFFF' : colors.text }]}>
          {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
        </ThemedText>
        <ThemedText style={[styles.statLabel, { color: isDarkMode ? '#FFFFFF' : colors.text }]}>
          Progress
        </ThemedText>
      </View>
    </Animated.View>
  ), [colors, stats, scrollY, isDarkMode]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <FontAwesome name="trophy" size={48} color={colors.icon} />
      <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
        {error || 'No achievements available'}
      </ThemedText>
    </View>
  ), [colors, error]);

  const renderLoading = useCallback(() => (
    <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.tint} />
      <ThemedText style={[styles.loadingText, { color: colors.text }]}>
        Loading achievements...
      </ThemedText>
    </View>
  ), [colors]);

  if (loading && !refreshing) {
    return renderLoading();
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Achievements"
        onProfilePress={() => console.log('Profile icon pressed')}
        style={{ backgroundColor: colors.background }}
        textColor={colors.text}
        iconColor={colors.tint}
      />

      {/* Commented out original achievements content for production */}
      {/*
      <AnimatedFlatList
        data={achievements}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContainer,
          achievements.length === 0 && styles.emptyList,
          { backgroundColor: colors.background }
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
            progressBackgroundColor={colors.card}
          />
        }
        ListFooterComponent={<View style={styles.listFooter} />}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        initialNumToRender={5}
        onEndReachedThreshold={0.5}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
        onScrollToIndexFailed={() => {}}
        showsVerticalScrollIndicator={false}
        getItemLayout={(data, index) => ({
          length: 170, // Approximate height of each item
          offset: 170 * index,
          index,
        })}
      />
      */}

      {/* Coming Soon Page */}
      <View style={[styles.comingSoonContainer, { backgroundColor: colors.background }]}>
        <FontAwesome
          name="trophy"
          size={64}
          color={isDarkMode ? "rgba(255, 255, 255, 0.7)" : colors.icon}
        />
        <ThemedText
          style={[
            styles.comingSoonText,
            { color: isDarkMode ? "#FFFFFF" : colors.text },
          ]}
        >
          Achievements Coming Soon!
        </ThemedText>
        <ThemedText
          style={[
            styles.comingSoonSubtext,
            { color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : colors.textSecondary },
          ]}
        >
          We're working on exciting achievements for you. Check back later!
        </ThemedText>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
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
  statItem: {
    alignItems: 'center',
    padding: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  statDivider: {
    width: 1,
    height: 40,
    opacity: 0.2,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listFooter: {
    height: 48,
    marginBottom: 38,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  // Coming Soon styles
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80, // Added paddingTop to account for the Header height
    paddingBottom: 32,
    flexDirection: 'column',
    gap: 24, // Ensures spacing between icon and text
  },
  comingSoonText: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 0, // Removed marginTop since gap handles spacing
    textAlign: 'center',
  },
  comingSoonSubtext: {
    fontSize: 16,
    marginTop: 0, // Removed marginTop since gap handles spacing
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});

export default Achievements;