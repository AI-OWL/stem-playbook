import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  StyleSheet,
  View,
  SectionList,
  Animated,
  RefreshControl,
  useColorScheme,
  Platform,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Header from "@/components/Header";
import StemCard from "@/components/StemCard";
import CardModal from "@/components/CardModal";
import { Colors } from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import { fetchAndStoreAllCards } from "../services/cardService";
import { getStoredUser } from "../services/userService";
import { getWalletData, WalletCategory } from "../services/walletService";
import { Card } from "../types";
import { logger } from "react-native-logs";
import { useRouter } from "expo-router";

const REFRESH_INTERVAL = 300000; // 5 minutes
const SCREEN_WIDTH = Dimensions.get("window").width;
const STORAGE_KEYS = {
  THEME: "theme",
  CATEGORIES: "categories",
};

// Create a logger instance
const log = logger.createLogger();

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

export default function Index() {
  log.debug("[Index] Component mounted.");

  // For navigation
  const router = useRouter();

  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === "dark");
  const colors = useMemo(() => Colors[isDarkMode ? "dark" : "light"], [isDarkMode]);

  const [categories, setCategories] = useState<WalletCategory[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedCardImageUrl, setSelectedCardImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardAnimations = useRef(new Map<string, Animated.Value>()).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // 1) Theme management
  useEffect(() => {
    log.debug("[Index] Checking and updating theme...");
    const checkAndUpdateTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === "dark");
          log.debug(`[Index] Loaded saved theme: ${savedTheme}`);
        } else {
          setIsDarkMode(systemColorScheme === "dark");
          await AsyncStorage.setItem(STORAGE_KEYS.THEME, systemColorScheme);
          log.debug(`[Index] Saved system theme: ${systemColorScheme}`);
        }
      } catch (error) {
        log.error("[Index] Theme check error:", error);
      }
    };

    checkAndUpdateTheme();
    const themeInterval = setInterval(checkAndUpdateTheme, 1000);

    return () => clearInterval(themeInterval);
  }, [systemColorScheme]);

  // 2) Initial data fetch
  useEffect(() => {
    log.debug("[Index] Fetching initial data...");

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          log.debug("[Index] No token found in AsyncStorage. Navigating to /auth...");
          // Navigate back to login
          router.replace("/login");
          return; // Important to stop execution here
        }

        log.debug("[Index] Found token. Fetching and storing all cards...");
        const allCards: any = await fetchAndStoreAllCards();
        log.debug(`[Index] Fetched ${allCards?.length || 0} cards.`);

        const user = await getStoredUser();
        if (!user) {
          log.debug("[Index] getStoredUser() returned null. Navigating to /auth...");
          router.replace("/login");
          return;
        }
        log.debug(`[Index] Found user with id: ${user.id}`);

        const walletData = getWalletData(allCards, user.cardIds);
        log.debug(`[Index] Processed wallet data into ${walletData.length} categories.`);
        setCategories(walletData);
      } catch (err) {
        log.error("[Index] Error fetching wallet data:", err);
        setError("Failed to load wallet data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Toggle theme (optional usage)
  const toggleTheme = useCallback(async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, newTheme ? "dark" : "light");
      log.debug(`[Index] Toggled theme to: ${newTheme ? "dark" : "light"}`);
    } catch (error) {
      log.error("[Index] Theme toggle error:", error);
    }
  }, [isDarkMode]);

  // Animate cards with a slight stagger
  const animateCards = useCallback(
    (walletCategories: WalletCategory[]) => {
      log.debug("[Index] Animating cards...");
      const animations: Animated.Value[] = [];

      walletCategories.forEach((category) => {
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
        ])
      );

      Animated.parallel(staggeredAnimations).start(() => {
        log.debug("[Index] Finished card animations.");
      });
    },
    [cardAnimations]
  );

  // Animate whenever categories change
  useEffect(() => {
    if (categories.length > 0) {
      log.debug(`[Index] categories changed. Count: ${categories.length}`);
      animateCards(categories);
    }
  }, [categories, animateCards]);

  // Pull-to-refresh
  const handleRefresh = useCallback(() => {
    log.debug("[Index] Pull-to-refresh triggered.");
    setRefreshing(true);
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          log.debug("[Index] No token found during refresh. Navigating to /auth...");
          router.replace("/auth");
          return;
        }

        log.debug("[Index] Refresh: fetchAndStoreAllCards...");
        const allCards: any = await fetchAndStoreAllCards(token);
        log.debug(`[Index] Refresh: fetched ${allCards?.length || 0} cards.`);

        const user = await getStoredUser();
        if (!user) {
          log.debug("[Index] Refresh: user not found. Navigating to /auth...");
          router.replace("/auth");
          return;
        }
        log.debug(`[Index] Refresh: got user with id: ${user.id}`);

        const walletData = getWalletData(allCards, user.cardIds);
        log.debug(`[Index] Refresh: processed into ${walletData.length} categories.`);
        setCategories(walletData);
      } catch (err) {
        log.error("[Index] Error refreshing wallet data:", err);
        setError("Failed to refresh wallet data");
      } finally {
        setRefreshing(false);
        log.debug("[Index] Pull-to-refresh complete.");
      }
    })();
  }, [router]);

  // On card press
  const handleCardPress = useCallback((card: any) => {
    log.debug(`[Index] Card pressed: ${card.id}`);
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

  // Render a section header (title + subheading + card grid)
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
    [colors, handleCardPress, scrollY, isDarkMode]
  );

  // Render an empty fallback
  const renderEmpty = useCallback(
    () => (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
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
    [colors, error, isDarkMode]
  );

  // Render a loading fallback
  const renderLoading = useCallback(
    () => (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={isDarkMode ? "#FFFFFF" : colors.tint} />
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
    [colors, isDarkMode]
  );

  // If still loading initial fetch (and not just refreshing), show loading
  if (loading && !refreshing) {
    return renderLoading();
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
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
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
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
          <View style={[styles.listHeader, { backgroundColor: colors.background }]} />
        }
        ListFooterComponent={
          <View style={[styles.listFooter, { backgroundColor: colors.background }]} />
        }
        renderItem={() => null} // We render cards in sectionHeader
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
          log.debug("[Index] Closing card modal...");
          setSelectedCardId(null);
          setSelectedCardImageUrl(null);
        }}
        isDarkMode={isDarkMode}
        collected={
          selectedCardId
            ? categories.some((category) =>
                category.data.some((card) => card.id === selectedCardId && card.collected)
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
    justifyContent: "center",
    alignItems: "center",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  sectionCount: {
    fontSize: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardWrapper: {
    width: "48%",
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});
