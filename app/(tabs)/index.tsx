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
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Header from "@/components/Header";
import StemCard from "@/components/StemCard";
import CardModal from "@/components/CardModal";
import { Colors } from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import { CARD_DETAILS } from "@/app/data/cardData";

const REFRESH_INTERVAL = 300000; // 5 minutes
const ANIMATION_DURATION = 300;
const SCREEN_WIDTH = Dimensions.get('window').width;
const PADDING = 16;
const CARD_MARGIN = 8;
const STORAGE_KEYS = {
  THEME: "theme",
  CATEGORIES: "categories",
};

// Function to generate categories dynamically from cardData
const generateCategories = () => {
  const categoryMap = {
    'Science': [],
    'Technology': [],
    'Engineering': [],
    'Mathematics': []
  };

  // Process each card in CARD_DETAILS
  Object.entries(CARD_DETAILS).forEach(([id, card]) => {
    // Use the card's category field
    const category = card.category || 'Uncategorized';

    // Only add to our defined categories
    if (categoryMap[category] !== undefined) {
      categoryMap[category].push({
        id,
        name: card.name,
        imageUrl: card.image || require("../../assets/cards/Default.png"),
        collected: !!card.image // If image exists, consider it collected
      });
    }
  });

  // Convert the map to the array structure needed for SectionList
  return Object.entries(categoryMap)
    .filter(([_, data]) => data.length > 0) // Only include categories with cards
    .map(([title, data]) => ({
      title,
      data
    }));
};

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

export default function Index() {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === "dark");
  const colors = useMemo(
    () => Colors[isDarkMode ? "dark" : "light"],
    [isDarkMode],
  );

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
          setIsDarkMode(savedTheme === "dark");
        } else {
          setIsDarkMode(systemColorScheme === "dark");
          await AsyncStorage.setItem(STORAGE_KEYS.THEME, systemColorScheme);
        }
      } catch (error) {
        console.error("Theme check error:", error);
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
      await AsyncStorage.setItem(
        STORAGE_KEYS.THEME,
        newTheme ? "dark" : "light",
      );
    } catch (error) {
      console.error("Theme toggle error:", error);
    }
  }, [isDarkMode]);

  useEffect(() => {
    isMounted.current = true;

    const initializeApp = async () => {
      try {
        if (isMounted.current) {
          setError(null);
          setRefreshing(true);
        }

        await loadInitialData();

        if (isMounted.current) {
          setRefreshing(false);
        }
      } catch (error) {
        console.error("Init error:", error);
        if (isMounted.current) {
          setError("Failed to initialize app");
          setRefreshing(false);
        }
      }
    };

    initializeApp();

    // Cleanup function
    return () => {
      isMounted.current = false;
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
        refreshInterval.current = null;
      }
      setSelectedCardId(null);
      setSelectedCardImageUrl(null);
      setRefreshing(false);
    };
  }, []);

  const loadInitialData = async () => {
    try {
      await loadCategories(true);
    } catch (error) {
      console.error("Initial load error:", error);
      if (isMounted.current) {
        setError("Failed to load initial data");
      }
    }
  };

  const animateCards = useCallback((newCategories) => {
    const animations = [];

    newCategories.forEach((category) => {
      category.data.forEach((card) => {
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
        }),
      ]),
    );

    Animated.parallel(staggeredAnimations).start();
  }, []);

  const loadCategories = async (refresh = false) => {
    try {
      if (refresh && isMounted.current) {
        setError(null);
      }
      setLoading(true);

      // Generate dynamic categories from cardData
      const dynamicCategories = generateCategories();

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (isMounted.current) {
        setCategories(dynamicCategories);
        animateCards(dynamicCategories);
        await AsyncStorage.setItem(
          STORAGE_KEYS.CATEGORIES,
          JSON.stringify(dynamicCategories),
        );
      }
    } catch (error) {
      console.error("Load categories error:", error);
      if (isMounted.current) {
        setError("Failed to load categories");
        Alert.alert("Error", "Failed to load categories. Please try again.");
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
    setSelectedCardImageUrl(card.imageUrl);

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

  const renderSectionHeader = useCallback(
    ({ section: { title, data } }) => {
      const headerTranslateY = scrollY.interpolate({
        inputRange: [-100, 0, 100],
        outputRange: [50, 0, -50],
        extrapolate: "clamp",
      });

      const collectedCount = data.filter((card) => card.collected).length;

      return (
        <Animated.View
          style={[
            styles.sectionContainer,
            {
              transform: [{ translateY: headerTranslateY }],
            },
          ]}
        >
          <View
            style={[
              styles.sectionHeaderContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.sectionHeader,
                { color: isDarkMode ? "#FFFFFF" : colors.text },
              ]}
            >
              {title}
            </ThemedText>
            <ThemedText
              style={[
                styles.sectionCount,
                {
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.7)"
                    : colors.textSecondary,
                },
              ]}
            >
              {collectedCount}/{data.length} Collected
            </ThemedText>
          </View>

          <View style={styles.grid}>
            {data.map((card, index) => {
              const scale = cardAnimations.get(card.id) || new Animated.Value(1);

              return (
                <Animated.View
                  key={card.id}
                  style={[
                    styles.cardWrapper,
                    {
                      transform: [{ scale }],
                      opacity: scale,
                    },
                  ]}
                >
                  <StemCard
                    imageUrl={card.imageUrl}
                    collected={card.collected}
                    onPress={() => handleCardPress(card)}
                  />
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>
      );
    },
    [colors, handleCardPress, scrollY, isDarkMode],
  );

  const renderEmpty = useCallback(
    () => (
      <View
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}
      >
        <FontAwesome
          name="folder-open"
          size={48}
          color={isDarkMode ? "rgba(255, 255, 255, 0.7)" : colors.icon}
        />
        <ThemedText
          style={[
            styles.emptyText,
            {
              color: isDarkMode
                ? "rgba(255, 255, 255, 0.7)"
                : colors.textSecondary,
            },
          ]}
        >
          {error || "No cards available"}
        </ThemedText>
      </View>
    ),
    [colors, error, isDarkMode],
  );

  const renderLoading = useCallback(
    () => (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={isDarkMode ? "#FFFFFF" : colors.tint}
        />
        <ThemedText
          style={[
            styles.loadingText,
            { color: isDarkMode ? "#FFFFFF" : colors.text },
          ]}
        >
          Loading cards...
        </ThemedText>
      </View>
    ),
    [colors, isDarkMode],
  );

  if (loading && !refreshing) {
    return renderLoading();
  }

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Header
        title="Wallet"
        style={{ backgroundColor: colors.background }}
        textColor={isDarkMode ? "#FFFFFF" : colors.text}
        iconColor={isDarkMode ? "#FFFFFF" : colors.tint}
      />

      <AnimatedSectionList
        sections={categories}
        keyExtractor={(item) => item.id}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          categories.length === 0 && styles.emptyList,
          { backgroundColor: colors.background },
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={isDarkMode ? "#FFFFFF" : colors.tint}
            colors={[isDarkMode ? "#FFFFFF" : colors.tint]}
            progressBackgroundColor={colors.card}
          />
        }
        ListHeaderComponent={
          <View
            style={[styles.listHeader, { backgroundColor: colors.background }]}
          />
        }
        ListFooterComponent={
          <View
            style={[styles.listFooter, { backgroundColor: colors.background }]}
          />
        }
        renderItem={() => null} // We're rendering cards in the section header
        removeClippedSubviews={Platform.OS !== "web"}
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
        collected={
          selectedCardId
            ? categories.some((category) =>
                category.data.some(
                  (card) => card.id === selectedCardId && card.collected
                )
              )
            : false
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  listHeader: {
    height: 12,
  },
  listFooter: {
    height: 40,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
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
  },
  cardWrapper: {
    width: '48%', // Ensures two cards per row with spacing
    marginBottom: 16,
  },
  cardContainer: {
    width: '48%',
    marginBottom: 16,
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