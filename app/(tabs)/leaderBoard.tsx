import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
  useColorScheme,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import LeaderboardPosition from '@/components/LeaderboardPosition';
import Header from '@/components/Header';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { fetchTopUsers, fetchUserRank, getStoredUser } from '../services/userService';

const ITEMS_PER_PAGE = 20;
const REFRESH_INTERVAL = 60000; // 1 minute
const ANIMATION_DURATION = 300;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const LeaderBoard = () => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const colors = useMemo(() => Colors[isDarkMode ? 'dark' : 'light'], [isDarkMode]);

  const [userPoints, setUserPoints] = useState(0);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const scrollY = useMemo(() => new Animated.Value(0), []);
  const flatListRef = useRef<FlatList>(null);

  const headerScale = useMemo(() =>
    scrollY.interpolate({
      inputRange: [-100, 0, 100],
      outputRange: [1.2, 1, 0.8],
      extrapolate: 'clamp',
    })
  , [scrollY]);

  useEffect(() => {
    const initializeApp = async () => {
      console.log('[DEBUG] Initializing LeaderBoard...');
      await Promise.all([
        loadThemePreference(),
        loadInitialData(),
      ]);
    };

    initializeApp();

    const refreshInterval = setInterval(() => {
      if (!refreshing) {
        loadLeaderboardData(true);
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    const checkTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        } else {
          setIsDarkMode(systemColorScheme === 'dark');
        }
      } catch (error) {
        console.error('Error checking theme:', error);
      }
    };

    checkTheme();
    const interval = setInterval(checkTheme, 1000);
    return () => clearInterval(interval);
  }, [systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadUserPoints(),
        loadLeaderboardData(true),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Failed to load initial data. Please try again.');
    }
  };

  const loadUserPoints = async () => {
    try {
      const user = await getStoredUser();
      if (user) {
        setUserPoints(user.points);
        const rankData = await fetchUserRank(user.id);
        console.log('[INFO] Fetched user rank:', { userId: user.id, rankData });
        setUserRank(rankData.rank);
      } else {
        setUserPoints(0);
        setUserRank(null);
      }
    } catch (error) {
      console.error('[ERROR] Error loading user points:', error);
      setUserPoints(0);
      setUserRank(null);
    }
  };

  const loadLeaderboardData = async (refresh = false) => {
    if (!hasMore && !refresh) return;
    if (isLoadingMore && !refresh) return;

    try {
      if (refresh) {
        setPage(1);
        setHasMore(true);
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      console.log('[DEBUG] Fetching top users...');
      const topUsers = await fetchTopUsers();
      console.log('[INFO] Fetched top users:', topUsers);
      const user = await getStoredUser();
      const currentUserId = user?.id;

      const newPlayers = topUsers.slice(0, ITEMS_PER_PAGE * page).map((player, index) => ({
        id: player.id,
        name: player.name,
        points: player.points,
        avatar: player.avatar || '/api/placeholder/40/40',
        rank: index + 1,
        isCurrentUser: player.id === currentUserId,
        animValue: new Animated.Value(1), // Start visible
      }));

      console.log('[DEBUG] Setting players:', newPlayers);
      if (refresh) {
        setPlayers(newPlayers);
      } else {
        setPlayers(prev => [...prev, ...newPlayers]);
      }

      setHasMore(topUsers.length > ITEMS_PER_PAGE * page);

      // Ensure visibility on load
      if (flatListRef.current && refresh) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: false });
      }

    } catch (error) {
      console.error('[ERROR] Error loading leaderboard:', error);
      Alert.alert('Error', 'Failed to load leaderboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadLeaderboardData(true);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loading && !isLoadingMore && hasMore) {
      setPage(prev => prev + 1);
      loadLeaderboardData();
    }
  }, [loading, isLoadingMore, hasMore]);

  const renderItem = useCallback(({ item, index }) => {
    console.log('[DEBUG] Rendering item:', item.name, 'at index:', index);
    const inputRange = [
      -1,
      0,
      (index * 80),
      (index + 2) * 80
    ];

    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.95],
      extrapolate: 'clamp',
    });

    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={{
          opacity: Animated.multiply(opacity, item.animValue),
          transform: [{ scale: Animated.multiply(scale, item.animValue) }],
        }}
      >
        <LeaderboardPosition
          rank={item.rank}
          name={item.name}
          points={item.points}
          avatar={item.avatar}
          isCurrentUser={item.isCurrentUser}
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
        />
      </Animated.View>
    );
  }, [colors, scrollY]);

  const renderHeader = useCallback(() => (
    <View style={{ backgroundColor: colors.primary }}>
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: colors.primary,
            transform: [{ scale: headerScale }],
          },
        ]}
      >
        <ThemedText
          type="title"
          style={[
            styles.headerText,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}
        >
          Your Stats
        </ThemedText>
        <View style={styles.statsContainer}>
          <View style={styles.statItemContainer}>
            <View style={styles.iconContainer}>
              <FontAwesome name="star" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
            </View>
            <View style={styles.textContainer}>
              <ThemedText
                style={[
                  styles.points,
                  { color: isDarkMode ? '#FFFFFF' : '#000000' }
                ]}
              >
                {userPoints}
              </ThemedText>
              <ThemedText
                style={[
                  styles.statLabel,
                  { color: isDarkMode ? '#FFFFFF' : '#000000' }
                ]}
              >
                Points
              </ThemedText>
            </View>
          </View>

          <View style={[styles.statDivider, { backgroundColor: isDarkMode ? '#FFFFFF' : '#000000', opacity: 0.2 }]} />

          <View style={styles.statItemContainer}>
            <View style={styles.iconContainer}>
              <FontAwesome name="trophy" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
            </View>
            <View style={styles.textContainer}>
              <ThemedText
                style={[
                  styles.points,
                  { color: isDarkMode ? '#FFFFFF' : '#000000' }
                ]}
              >
                #{userRank || '-'}
              </ThemedText>
              <ThemedText
                style={[
                  styles.statLabel,
                  { color: isDarkMode ? '#FFFFFF' : '#000000' }
                ]}
              >
                Rank
              </ThemedText>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  ), [colors, userPoints, userRank, headerScale, isDarkMode]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <FontAwesome name="trophy" size={48} color={colors.icon} />
      <ThemedText style={styles.emptyText}>No players found</ThemedText>
    </View>
  ), [colors]);

  const renderFooter = useCallback(() => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={colors.tint} />
        <ThemedText style={styles.footerText}>Loading more players...</ThemedText>
      </View>
    );
  }, [hasMore, colors]);

  const keyExtractor = useCallback((item) => item.id, []);

  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
        <ThemedText style={styles.loadingText}>Loading leaderboard...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Header
        title="Leaderboard"
        onProfilePress={() => console.log('Profile icon pressed')}
        style={{ backgroundColor: colors.background }}
      />
      <AnimatedFlatList
        ref={flatListRef}
        data={players}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.listContainer,
          { minHeight: '100%' }, // Ensure content fills screen
        ]}
        initialScrollIndex={0} // Start at top
        extraData={players} // Force re-render on data change
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        removeClippedSubviews={false} // Prevent clipping
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
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
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    marginTop: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  statItemContainer: {
    flex: 1,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconContainer: {
    marginBottom: 12,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  points: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    height: 80,
    marginHorizontal: 15,
    opacity: 0.2,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyList: {
    flexGrow: 1,
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
  footer: {
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
  },
});

export default LeaderBoard;