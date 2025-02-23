import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Platform,
  useColorScheme,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome } from '@expo/vector-icons';
import Header from '@/components/Header';
import StoreItem from '@/components/StoreItem';
import { Colors } from '@/constants/Colors';

const ITEMS_PER_PAGE = 10;
const ANIMATION_DURATION = 300;
const STORAGE_KEYS = {
  THEME: 'theme',
  USER_POINTS: 'userPoints',
};

const MOCK_STORE_ITEMS = [
  {
    id: '1',
    title: 'Premium Avatar',
    body: 'Stand out with this exclusive animated avatar.',
    points: 500,
    imageUrl: '/api/placeholder/100/100',
    type: 'avatar',
    rarity: 'rare',
  },
  {
    id: '2',
    title: 'Dark Theme Pack',
    body: 'A collection of dark themes for your profile.',
    points: 750,
    imageUrl: '/api/placeholder/100/100',
    type: 'theme',
    rarity: 'epic',
  },
  {
    id: '3',
    title: 'Achievement Badge',
    body: 'Show off your dedication with this special badge.',
    points: 300,
    imageUrl: '/api/placeholder/100/100',
    type: 'badge',
    rarity: 'common',
  },
  {
    id: '4',
    title: 'Profile Background',
    body: 'Customize your profile with this animated background.',
    points: 1000,
    imageUrl: '/api/placeholder/100/100',
    type: 'background',
    rarity: 'legendary',
  },
];

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function Shop() {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const colors = useMemo(() => Colors[isDarkMode ? 'dark' : 'light'], [isDarkMode]);


  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const scrollY = useMemo(() => new Animated.Value(0), []);
  const headerOpacity = useMemo(() =>
    scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [1, 0.9],
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

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await Promise.all([
          loadUserPoints(),
          loadItems(true),
        ]);
      } catch (error) {
        console.error('Initialization error:', error);
        Alert.alert('Error', 'Failed to initialize the store. Please try again.');
      }
    };

    initializeApp();
  }, []);

  const loadUserPoints = async () => {
    try {
      const points = await AsyncStorage.getItem(STORAGE_KEYS.USER_POINTS);
      setUserPoints(points ? parseInt(points, 10) : 1000);
    } catch (error) {
      console.error('Error loading user points:', error);
      Alert.alert('Error', 'Failed to load user points. Using default value.');
      setUserPoints(1000);
    }
  };

  const loadItems = async (refresh = false) => {
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

      await new Promise(resolve => setTimeout(resolve, 1000));

      const newItems = MOCK_STORE_ITEMS.map(item => ({
        ...item,
        animValue: new Animated.Value(0),
      }));

      if (refresh) {
        setItems(newItems);
      } else {
        setItems(prev => [...prev, ...newItems]);
      }

      setHasMore(newItems.length === ITEMS_PER_PAGE);

      Animated.stagger(100, newItems.map(item =>
        Animated.spring(item.animValue, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      )).start();

    } catch (error) {
      console.error('Error loading items:', error);
      Alert.alert('Error', 'Failed to load store items. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadItems(true);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loading && !isLoadingMore && hasMore) {
      setPage(prev => prev + 1);
      loadItems();
    }
  }, [loading, isLoadingMore, hasMore]);

  const handlePurchase = useCallback(async (item) => {
    if (userPoints < item.points) {
      Alert.alert('Insufficient Points', 'You need more points to purchase this item.');
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `Are you sure you want to purchase ${item.title} for ${item.points} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: async () => {
            try {
              const newPoints = userPoints - item.points;
              await AsyncStorage.setItem(STORAGE_KEYS.USER_POINTS, newPoints.toString());
              setUserPoints(newPoints);

              Animated.sequence([
                Animated.timing(item.animValue, {
                  toValue: 0.8,
                  duration: ANIMATION_DURATION / 2,
                  useNativeDriver: true,
                }),
                Animated.spring(item.animValue, {
                  toValue: 1,
                  tension: 50,
                  friction: 7,
                  useNativeDriver: true,
                }),
              ]).start();

              Alert.alert('Success', 'Item purchased successfully!');
            } catch (error) {
              console.error('Purchase error:', error);
              Alert.alert('Error', 'Failed to complete purchase. Please try again.');
            }
          },
        },
      ]
    );
  }, [userPoints]);

  const renderHeader = useCallback(() => (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          backgroundColor: colors.background,
          opacity: headerOpacity,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <ThemedText
        style={[
          styles.pointsText,
          { color: isDarkMode ? '#FFFFFF' : colors.text }
        ]}
      >
        <FontAwesome
          name="star"
          size={20}
          color={isDarkMode ? '#FFD700' : colors.tint}
        /> {userPoints} Points
      </ThemedText>
    </Animated.View>
  ), [colors, headerOpacity, userPoints, isDarkMode]);

  const renderFooter = useCallback(() => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator
          color={isDarkMode ? '#FFFFFF' : colors.tint}
        />
        <ThemedText
          style={[
            styles.footerText,
            { color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : colors.textSecondary }
          ]}
        >
          Loading more items...
        </ThemedText>
      </View>
    );
  }, [hasMore, colors, isDarkMode]);

  const renderEmpty = useCallback(() => (
    <View style={[
      styles.emptyContainer,
      { backgroundColor: colors.background }
    ]}>
      <FontAwesome
        name="shopping-basket"
        size={48}
        color={isDarkMode ? 'rgba(255, 255, 255, 0.7)' : colors.icon}
      />
      <ThemedText
        style={[
          styles.emptyText,
          { color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : colors.textSecondary }
        ]}
      >
        No items available
      </ThemedText>
    </View>
  ), [colors, isDarkMode]);

  const renderItem = useCallback(({ item, index }) => {
    const inputRange = [
      -1,
      0,
      (index * 100),
      (index + 2) * 100
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
        style={[
          styles.itemContainer,
          {
            opacity: Animated.multiply(opacity, item.animValue),
            transform: [
              { scale: Animated.multiply(scale, item.animValue) },
            ],
          }
        ]}
      >
        <StoreItem
          title={item.title}
          body={item.body}
          points={item.points}
          imageUrl={item.imageUrl}
          type={item.type}
          rarity={item.rarity}
          onPress={() => handlePurchase(item)}
          disabled={userPoints < item.points}
          style={{
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : colors.card,
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : colors.border,
          }}
          textColor={isDarkMode ? '#FFFFFF' : colors.text}
          secondaryTextColor={isDarkMode ? 'rgba(255, 255, 255, 0.7)' : colors.textSecondary}
        />
      </Animated.View>
    );
  }, [colors, handlePurchase, scrollY, isDarkMode]);

  const keyExtractor = useCallback((item) => item.id, []);

  if (loading && !refreshing) {
    return (
      <ThemedView style={[
        styles.loadingContainer,
        { backgroundColor: colors.background }
      ]}>
        <ActivityIndicator
          size="large"
          color={isDarkMode ? '#FFFFFF' : colors.tint}
        />
        <ThemedText style={[
          styles.loadingText,
          { color: isDarkMode ? '#FFFFFF' : colors.text }
        ]}>
          Loading store...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[
      styles.container,
      { backgroundColor: colors.background }
    ]}>
      <Header
        title="Store"
        onProfilePress={() => console.log('Profile icon pressed')}
        style={{ backgroundColor: colors.background }}
        textColor={isDarkMode ? '#FFFFFF' : colors.text}
        iconColor={isDarkMode ? '#FFFFFF' : colors.tint}
      />

      <AnimatedFlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContainer,
          items.length === 0 && styles.emptyList,
          { backgroundColor: colors.background }
        ]}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={isDarkMode ? '#FFFFFF' : colors.tint}
            colors={[isDarkMode ? '#FFFFFF' : colors.tint]}
            progressBackgroundColor={colors.card}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        removeClippedSubviews={Platform.OS !== 'web'}
        maxToRenderPerBatch={5}
        windowSize={5}
        initialNumToRender={10}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  headerContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  itemContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    margin: 16,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  footer: {
    padding: 16,
    paddingTop: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  }
});