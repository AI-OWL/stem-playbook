import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  StyleSheet,
  View,
  SectionList,
  Animated,
  RefreshControl,
  useColorScheme,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Header from "@/components/Header";
import StemCard from "@/components/StemCard";
import CardModal from "@/components/CardModal";
import { Colors } from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";

const REFRESH_INTERVAL = 300000; // 5 minutes
const ANIMATION_DURATION = 300;
const GRID_GAP = 12;
const CARD_WIDTH_PERCENTAGE = 48;
const STORAGE_KEYS = {
  THEME: 'theme',
  CATEGORIES: 'categories',
};

// Mock data remains the same
const MOCK_CATEGORIES = [
  {
    title: "Science",
    data: [
      {
        id: "s1",
        imageUrl: "/api/placeholder/200/300",
        title: "Biology Basics",
        description: "Introduction to cellular structures",
        rarity: "common",
        collected: true,
      },
      {
        id: "s2",
        imageUrl: "/api/placeholder/200/300",
        title: "Chemistry Lab",
        description: "Advanced chemical reactions",
        rarity: "rare",
        collected: false,
      },
    ],
  },
  {
    title: "Technology",
    data: [
      {
        id: "t1",
        imageUrl: "/api/placeholder/200/300",
        title: "Web Development",
        description: "Frontend and backend basics",
        rarity: "common",
        collected: true,
      },
      {
        id: "t2",
        imageUrl: "/api/placeholder/200/300",
        title: "Mobile Apps",
        description: "Cross-platform development",
        rarity: "epic",
        collected: false,
      },
    ],
  },
  {
    title: "Engineering",
    data: [
      {
        id: "e1",
        imageUrl: "/api/placeholder/200/300",
        title: "Mechanical Systems",
        description: "Basic mechanical principles",
        rarity: "rare",
        collected: true,
      },
      {
        id: "e2",
        imageUrl: "/api/placeholder/200/300",
        title: "Electrical Circuits",
        description: "Circuit design fundamentals",
        rarity: "common",
        collected: false,
      },
    ],
  },
  {
    title: "Mathematics",
    data: [
      {
        id: "m1",
        imageUrl: "/api/placeholder/200/300",
        title: "Calculus",
        description: "Differential equations",
        rarity: "epic",
        collected: true,
      },
      {
        id: "m2",
        imageUrl: "/api/placeholder/200/300",
        title: "Linear Algebra",
        description: "Matrix operations",
        rarity: "rare",
        collected: false,
      },
    ],
  },
];


const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

export default function Index() {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const colors = useMemo(() => Colors[isDarkMode ? 'dark' : 'light'], [isDarkMode]);

  const [categories, setCategories] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedCardImageUrl, setSelectedCardImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const cardAnimations = useRef(new Map()).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const refreshInterval = useRef(null);
  const isMounted = useRef(true);

  // Enhanced theme management
  useEffect(() => {
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
  }, [systemColorScheme]);
    // Theme toggle handler
    const toggleTheme = useCallback(async () => {
      try {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        await AsyncStorage.setItem(STORAGE_KEYS.THEME, newTheme ? 'dark' : 'light');
      } catch (error) {
        console.error('Theme toggle error:', error);
      }
    }, [isDarkMode]);

    useEffect(() => {
      const initializeApp = async () => {
        try {
          await loadInitialData();

          refreshInterval.current = setInterval(() => {
            if (!refreshing && isMounted.current) {
              loadCategories(true);
            }
          }, REFRESH_INTERVAL);
        } catch (error) {
          console.error('Init error:', error);
          if (isMounted.current) {
            setError('Failed to initialize app');
          }
        }
      };

      initializeApp();

      return () => {
        isMounted.current = false;
        if (refreshInterval.current) {
          clearInterval(refreshInterval.current);
        }
        cardAnimations.clear();
      };
    }, []);

    const loadInitialData = async () => {
      try {
        await loadCategories(true);
      } catch (error) {
        console.error('Initial load error:', error);
        if (isMounted.current) {
          setError('Failed to load initial data');
        }
      }
    };

    const animateCards = useCallback((newCategories) => {
      const animations = [];

      newCategories.forEach(category => {
        category.data.forEach(card => {
          if (!cardAnimations.has(card.id)) {
            const animation = new Animated.Value(0);
            cardAnimations.set(card.id, animation);
            animations.push(animation);
          }
        });
      });

      const staggeredAnimations = animations.map((animation, index) =>
        Animated.sequence([
          Animated.delay(index * 50),
          Animated.spring(animation, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          })
        ])
      );

      Animated.parallel(staggeredAnimations).start();
    }, []);

    const loadCategories = async (refresh = false) => {
      try {
        if (refresh && isMounted.current) {
          setError(null);
        }
        setLoading(true);

        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (isMounted.current) {
          setCategories(MOCK_CATEGORIES);
          animateCards(MOCK_CATEGORIES);
          await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(MOCK_CATEGORIES));
        }

      } catch (error) {
        console.error('Load categories error:', error);
        if (isMounted.current) {
          setError('Failed to load categories');
          Alert.alert('Error', 'Failed to load categories. Please try again.');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    const handleRefresh = useCallback(() => {
      setRefreshing(true);
      loadCategories(true);
    }, []);

    const handleCardPress = useCallback((card) => {
      setSelectedCardId(card.id);
      setSelectedCardImageUrl(card.imageUrl || null);

      const animation = cardAnimations.get(card.id);
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
    }, []);

    const renderCard = useCallback(({ item: card }) => {
      const scale = cardAnimations.get(card.id) || new Animated.Value(1);

      return (
        <Animated.View
          key={card.id}
          style={[
            styles.cardContainer,
            {
              transform: [{ scale }],
              opacity: scale,
            },
          ]}
        >
          <StemCard
            imageUrl={card.imageUrl}
            title={card.title}
            description={card.description}
            rarity={card.rarity}
            collected={card.collected}
            style={[
              styles.card,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
              }
            ]}
            textColor={isDarkMode ? '#FFFFFF' : colors.text}
            secondaryTextColor={isDarkMode ? 'rgba(255, 255, 255, 0.7)' : colors.textSecondary}
            onPress={() => handleCardPress(card)}
          />
        </Animated.View>
      );
    }, [colors, handleCardPress, isDarkMode]);
  const renderSectionHeader = useCallback(({ section: { title, data } }) => {
    const headerTranslateY = scrollY.interpolate({
      inputRange: [-100, 0, 100],
      outputRange: [50, 0, -50],
      extrapolate: 'clamp',
    });

    const collectedCount = data.filter(card => card.collected).length;

    return (
      <Animated.View
        style={[
          styles.sectionContainer,
          {
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <View style={[
          styles.sectionHeaderContainer,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          }
        ]}>
          <ThemedText style={[
            styles.sectionHeader,
            { color: isDarkMode ? '#FFFFFF' : colors.text }
          ]}>
            {title}
          </ThemedText>
          <ThemedText style={[
            styles.sectionCount,
            { color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : colors.textSecondary }
          ]}>
            {collectedCount}/{data.length} Collected
          </ThemedText>
        </View>
        <View style={styles.grid}>
          {data.map((card) => (
            <View key={card.id}>
              {renderCard({ item: card })}
            </View>
          ))}
        </View>
      </Animated.View>
    );
  }, [colors, renderCard, scrollY, isDarkMode]);

  const renderEmpty = useCallback(() => (
    <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
      <FontAwesome
        name="folder-open"
        size={48}
        color={isDarkMode ? 'rgba(255, 255, 255, 0.7)' : colors.icon}
      />
      <ThemedText style={[
        styles.emptyText,
        { color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : colors.textSecondary }
      ]}>
        {error || 'No cards available'}
      </ThemedText>
    </View>
  ), [colors, error, isDarkMode]);

  const renderLoading = useCallback(() => (
    <View style={[
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
        Loading cards...
      </ThemedText>
    </View>
  ), [colors, isDarkMode]);

  if (loading && !refreshing) {
    return renderLoading();
  }

  return (
    <ThemedView style={[
      styles.container,
      { backgroundColor: colors.background }
    ]}>
      <Header
        title="Wallet"
        style={{ backgroundColor: colors.background }}
        textColor={isDarkMode ? '#FFFFFF' : colors.text}
        iconColor={isDarkMode ? '#FFFFFF' : colors.tint}
      />

      <AnimatedSectionList
        sections={categories}
        keyExtractor={(item) => item.id}
        renderItem={() => null}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          categories.length === 0 && styles.emptyList,
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
            tintColor={isDarkMode ? '#FFFFFF' : colors.tint}
            colors={[isDarkMode ? '#FFFFFF' : colors.tint]}
            progressBackgroundColor={colors.card}
          />
        }
        ListHeaderComponent={<View style={[
          styles.listHeader,
          { backgroundColor: colors.background }
        ]} />}
        ListFooterComponent={<View style={[
          styles.listFooter,
          { backgroundColor: colors.background }
        ]} />}
        removeClippedSubviews={Platform.OS !== 'web'}
        maxToRenderPerBatch={5}
        windowSize={5}
        initialNumToRender={10}
        stickySectionHeadersEnabled={false}
        onScrollToIndexFailed={() => {}}
      />

      <CardModal
        visible={!!selectedCardId}
        imageUrl={selectedCardImageUrl}
        cardId={selectedCardId}
        onClose={() => {
          setSelectedCardId(null);
          setSelectedCardImageUrl(null);
        }}
        isDarkMode={isDarkMode}
      />
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20, // Increased from 16 to 20 for more side padding
  },
  listHeader: {
    height: 20,
  },
  listFooter: {
    height: 50,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  sectionContainer: {
    marginBottom: 24, // Increased from 20 to 24 for better section spacing
    paddingHorizontal: 12, // Added padding to prevent cards touching edges
  },
  sectionHeaderContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16, // Increased from 15 to 16 for consistency
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sectionCount: {
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: GRID_GAP,
    paddingHorizontal: 4, // Added padding to prevent cards touching edges
  },
  cardContainer: {
    width: `${CARD_WIDTH_PERCENTAGE}%`,
    marginBottom: 12, // Added margin bottom for vertical spacing
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
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
});

