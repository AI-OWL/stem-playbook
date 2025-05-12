import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
  Image,
  SectionListRenderItemInfo,
  SectionListProps,
  ImageBackground,
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
import {
  getWalletData,
  WalletCategory,
  WalletCard,
} from "../services/walletService";
import { Card } from "../types";
import { logger } from "react-native-logs";
import { useRouter } from "expo-router";

const STORAGE_KEYS = {
  THEME: "theme",
  CATEGORIES: "categories",
};

// Create a logger instance
const log = logger.createLogger();

const AnimatedSectionList = Animated.createAnimatedComponent(
  SectionList
) as React.ComponentType<SectionListProps<WalletCard, SectionData>>;

interface SectionData {
  title: string;
  data: WalletCard[];
}

export default function Index() {
  // For navigation
  const router = useRouter();

  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === "dark");
  const colors = useMemo(
    () => Colors[isDarkMode ? "dark" : "light"],
    [isDarkMode]
  );

  const [categories, setCategories] = useState<WalletCategory[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedCardImageUrl, setSelectedCardImageUrl] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardAnimations = useRef(new Map<string, Animated.Value>()).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // 1) Theme management
  useEffect(() => {
    const checkAndUpdateTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === "dark");
        } else if (systemColorScheme) {
          setIsDarkMode(systemColorScheme === "dark");
          await AsyncStorage.setItem(STORAGE_KEYS.THEME, systemColorScheme);
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
    const fetchData = async () => {
      setLoading(true);

      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          router.replace("/login");
          return;
        }

        // Get data from API
        const allCards = await fetchAndStoreAllCards();
        const user = await getStoredUser();

        if (!user) {
          router.replace("/login");
          return;
        }

        // Organize card data to display in wallet
        const walletData = getWalletData(allCards, user.cardIds);
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
      await AsyncStorage.setItem(
        STORAGE_KEYS.THEME,
        newTheme ? "dark" : "light"
      );
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
          router.replace("/login");
          return;
        }

        const allCards = await fetchAndStoreAllCards();

        const user = await getStoredUser();
        if (!user) {
          router.replace("/login");
          return;
        }

        const walletData = getWalletData(allCards, user.cardIds);
        setCategories(walletData);
      } catch (err) {
        log.error("[Index] Error refreshing wallet data:", err);
        setError("Failed to refresh wallet data");
      } finally {
        setRefreshing(false);
      }
    })();
  }, [router]);

  // Get background image based on section title
  const getSectionBackground = useCallback((title: string) => {
    const sectionKey = title.toLowerCase().replace(/\s+/g, "");

    // Map section titles to background images
    const backgroundMap: { [key: string]: any } = {
      science: require("../../assets/images/Backgrounds/ScienceBackground.png"),
      technology: require("../../assets/images/Backgrounds/TechBackground.png"),
      engineering: require("../../assets/images/Backgrounds/EngineeringBackground.png"),
      mathematics: require("../../assets/images/Backgrounds/MathBackground.png"),
      math: require("../../assets/images/Backgrounds/MathBackground.png"), // Added this for "Math"
      // Add more sections as needed
    };

    return backgroundMap[sectionKey] || null;
  }, []);

  // Render a section header (title + card grid)
  const renderSectionHeader = useCallback(
    ({ section }: { section: SectionData }) => {
      const backgroundImage = getSectionBackground(section.title);

      if (backgroundImage) {
        return (
          <ImageBackground
            source={backgroundImage}
            style={styles.sectionHeader}
            imageStyle={{ resizeMode: "cover" }}
          >
            <View style={styles.sectionTitleContainer}>
              <ThemedText style={styles.sectionTitle}>
                {section.title}
              </ThemedText>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.grid}>
                {section.data.map((card: WalletCard, index: number) => {
                  const scale =
                    cardAnimations.get(card.id) || new Animated.Value(1);
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
                        name={card.title}
                        onPress={() => {
                          setSelectedCardId(card.id);
                          setSelectedCardImageUrl(card.imageUrl);
                        }}
                      />
                    </Animated.View>
                  );
                })}
              </View>
            </View>
          </ImageBackground>
        );
      }

      return (
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.grid}>
              {section.data.map((card: WalletCard, index: number) => {
                const scale =
                  cardAnimations.get(card.id) || new Animated.Value(1);
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
                      name={card.title}
                      onPress={() => {
                        setSelectedCardId(card.id);
                        setSelectedCardImageUrl(card.imageUrl);
                      }}
                    />
                  </Animated.View>
                );
              })}
            </View>
          </View>
        </View>
      );
    },
    [cardAnimations]
  );

  // Render an empty fallback
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
    [colors, error, isDarkMode]
  );

  // Render a loading fallback
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
    [colors, isDarkMode]
  );

  // If still loading initial fetch (and not just refreshing), show loading
  if (loading && !refreshing) {
    return renderLoading();
  }

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Header title="All Stars" />

      <AnimatedSectionList
        sections={categories}
        renderItem={({ item }) => {
          // Return null because we're rendering all cards in the section header
          return null;
        }}
        renderSectionHeader={({ section }) => renderSectionHeader({ section })}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={[
          styles.listContent,
          categories.length === 0 && styles.emptyList,
          { backgroundColor: colors.background },
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
        removeClippedSubviews={Platform.OS !== "web"}
        maxToRenderPerBatch={5}
        windowSize={5}
        initialNumToRender={10}
        stickySectionHeadersEnabled={false}
        onScrollToIndexFailed={() => {}}
      />

      <CardModal
        visible={!!selectedCardId}
        cardId={selectedCardId || undefined}
        imageUrl={selectedCardImageUrl || undefined}
        onClose={() => {
          log.debug("[Index] Closing card modal...");
          setSelectedCardId(null);
          setSelectedCardImageUrl(null);
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
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
  sectionHeader: {
    marginBottom: 0, // Remove margin to eliminate gaps
    paddingBottom: 10, // Add padding instead to maintain spacing
    width: "100%",
    position: "relative",
    overflow: "hidden", // Ensure background doesn't leak
  },
  sectionTitleContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    alignItems: "center",
    width: "100%",
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    textTransform: "uppercase",
    textAlign: "center",
  },
  sectionContent: {
    width: "100%",
    paddingHorizontal: 16,
    position: "relative",
    zIndex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardContainer: {
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
