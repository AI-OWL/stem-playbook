import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import LeaderboardPosition from '@/components/LeaderboardPosition';
import Header from '@/components/Header';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const ITEMS_PER_PAGE = 20;
const REFRESH_INTERVAL = 60000; // 1 minute
const ANIMATION_DURATION = 300;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const LeaderBoard = () => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const colors = useMemo(() => Colors[isDarkMode ? 'dark' : 'light'], [isDarkMode]);

  const [userPoints, setUserPoints] = useState(0);
  const [userRank, setUserRank] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const scrollY = useMemo(() => new Animated.Value(0), []);

  const headerScale = useMemo(() =>
    scrollY.interpolate({
      inputRange: [-100, 0, 100],
      outputRange: [1.2, 1, 0.8],
      extrapolate: 'clamp',
    })
  , []);

  useEffect(() => {
    const initializeApp = async () => {
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

    return () => {
      clearInterval(refreshInterval);
    };
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
      const points = await AsyncStorage.getItem('userPoints');
      setUserPoints(points ? parseInt(points, 10) : 400);
    } catch (error) {
      console.error('Error loading user points:', error);
      setUserPoints(400); // Default fallback
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

      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newPlayers = [
        { id: '1', name: 'John Doe', points: 1000, avatar: '/api/placeholder/40/40' },
        { id: '2', name: 'Dwayne Johnson', points: 990, avatar: '/api/placeholder/40/40' },
        { id: '3', name: 'Cas Maxwell', points: 750, avatar: '/api/placeholder/40/40' },
        { id: '4', name: 'Sarah Connor', points: 720, avatar: '/api/placeholder/40/40' },
        { id: '5', name: 'Tony Stark', points: 680, avatar: '/api/placeholder/40/40' },
        { id: '6', name: 'Peter Parker', points: 650, avatar: '/api/placeholder/40/40' },
        { id: '7', name: 'Bruce Wayne', points: 630, avatar: '/api/placeholder/40/40' },
        { id: '8', name: 'Clark Kent', points: 600, avatar: '/api/placeholder/40/40' },
        { id: '9', name: 'Diana Prince', points: 580, avatar: '/api/placeholder/40/40' },
        { id: '10', name: 'Barry Allen', points: 550, avatar: '/api/placeholder/40/40' },
      ].map((player, index) => ({
        ...player,
        rank: index + 1,
        isCurrentUser: player.points === userPoints,
        animValue: new Animated.Value(0),
      }));

      if (refresh) {
        setPlayers(newPlayers);
      } else {
        setPlayers(prev => [...prev, ...newPlayers]);
      }

      // Animate new items
      Animated.stagger(50, newPlayers.map(player =>
        Animated.spring(player.animValue, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      )).start();

      const userRankData = newPlayers.find(p => p.points <= userPoints);
      setUserRank(userRankData ? userRankData.rank : newPlayers.length + 1);
      setHasMore(newPlayers.length === ITEMS_PER_PAGE);

    } catch (error) {
      console.error('Error loading leaderboard:', error);
      Alert.alert('Error', 'Failed to load leaderboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsLoadingMore(false);
    }
  }
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
            transform: [
              { scale: Animated.multiply(scale, item.animValue) },
            ],
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
      <View>
        <Header
        title="Leaderboard"
        onProfilePress={() => console.log('Profile icon pressed')}
        style={{ backgroundColor: colors.background }}
      />
        <AnimatedFlatList
          data={players}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          contentContainerStyle={[
            styles.listContainer,
            players.length === 0 && styles.emptyList,
          ]}
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
          removeClippedSubviews={Platform.OS !== 'web'}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
        />
      </View>
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
    paddingVertical: 10,  // reduced from 20
  },
  statItemContainer: {
    flex: 1,
    height: 120,  // reduced from 160
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,  // reduced from 15
  },
  iconContainer: {
    marginBottom: 12,  // reduced from 20
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,  // reduced from 12
  },
  points: {
    fontSize: 24,  // reduced from 28
    fontWeight: 'bold',
    marginBottom: 8,  // reduced from 16
  },
  statLabel: {
    fontSize: 12,  // reduced from 14
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    height: 80,  // reduced from 100
    marginHorizontal: 15,  // reduced from 20
    opacity: 0.2,
  },
    listContainer: {
      paddingBottom: 20,
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