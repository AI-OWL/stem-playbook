import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { FontAwesome } from "@expo/vector-icons";
import Header from "@/components/Header";
import StoreItem from "@/components/StoreItem";
import StoreItemModal from "@/components/StoreItemModal";
import { Colors } from "@/constants/Colors";

const ITEMS_PER_PAGE = 10;
const ANIMATION_DURATION = 300;
const STORAGE_KEYS = {
  THEME: "theme",
  USER_POINTS: "userPoints",
};

const MOCK_STORE_ITEMS = [
  {
    id: "1",
    title: "Premium Avatar",
    body: "Stand out with this exclusive animated avatar. This premium avatar will make your profile stand out from the crowd with subtle animations and exclusive design elements.",
    points: 500,
    imageUrl: "../../assets/images/Shop/PremiumAvatar.png",
    imageGallery: [
      "../../assets/images/Shop/PremiumAvatar.png",
      "../../assets/images/Shop/PremiumAvatar_Alt1.png",
      "../../assets/images/Shop/PremiumAvatar_Alt2.png",
    ],
    type: "avatar",
    rarity: "rare",
  },
  {
    id: "2",
    title: "Dark Theme Pack",
    body: "A collection of dark themes for your profile. Includes 5 different dark color schemes that you can switch between at any time. Perfect for those who prefer a darker interface.",
    points: 750,
    imageUrl: "../../assets/images/Shop/DarkThemePack.png",
    imageGallery: [
      "../../assets/images/Shop/DarkThemePack.png",
      "../../assets/images/Shop/DarkThemePack_Alt1.png",
      "../../assets/images/Shop/DarkThemePack_Alt2.png",
    ],
    type: "theme",
    rarity: "epic",
  },
  {
    id: "3",
    title: "Achievement Badge",
    body: "Show off your dedication with this special badge. This badge will appear on your profile and in your posts, showing everyone your commitment to the community.",
    points: 300,
    imageUrl: "../../assets/images/Shop/AchievementBadge.png",
    imageGallery: [
      "../../assets/images/Shop/AchievementBadge.png",
      "../../assets/images/Shop/AchievementBadge_Alt1.png",
    ],
    type: "badge",
    rarity: "common",
  },
  {
    id: "4",
    title: "Profile Background",
    body: "Customize your profile with this animated background. This legendary background features subtle particle effects and responsive design that adapts to different viewing conditions.",
    points: 1000,
    imageUrl: "../../assets/images/Shop/ProfileBackground.png",
    imageGallery: [
      "../../assets/images/Shop/ProfileBackground.png",
      "../../assets/images/Shop/ProfileBackground_Alt1.png",
      "../../assets/images/Shop/ProfileBackground_Alt2.png",
      "../../assets/images/Shop/ProfileBackground_Alt3.png",
    ],
    type: "background",
    rarity: "legendary",
  },
];

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

function ShopContent() {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === "dark");
  const colors = useMemo(
    () => Colors[isDarkMode ? "dark" : "light"],
    [isDarkMode],
  );

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const scrollY = useMemo(() => new Animated.Value(0), []);
  const refreshInterval = useRef(null);
  const headerOpacity = useMemo(
    () =>
      scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0.9],
        extrapolate: "clamp",
      }),
    [],
  );

  useEffect(() => {
    const initializeApp = async () => {
      await Promise.all([loadThemePreference(), loadInitialData()]);
    };

    initializeApp();

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    const checkTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme");
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === "dark");
        } else {
          setIsDarkMode(systemColorScheme === "dark");
        }
      } catch (error) {
        console.error("Error checking theme:", error);
      }
    };

    checkTheme();
    const interval = setInterval(checkTheme, 1000);

    return () => clearInterval(interval);
  }, [systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme) {
        setIsDarkMode(savedTheme === "dark");
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  };

  const loadInitialData = async () => {
    try {
      await Promise.all([loadUserPoints(), loadItems(true)]);
    } catch (error) {
      console.error("Initialization error:", error);
      Alert.alert("Error", "Failed to initialize the store. Please try again.");
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadUserPoints = async () => {
    try {
      const pointsData = await AsyncStorage.getItem(STORAGE_KEYS.USER_POINTS);
      let points = 0;
      if (pointsData) {
        points = parseInt(pointsData, 10);
      }
      return points;
    } catch (error) {
      console.error("Error loading user points:", error);
      Alert.alert("Error", "Failed to load user points. Using default value.");
      return 1000;
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

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newItems = MOCK_STORE_ITEMS.map((item) => ({
        ...item,
        animValue: new Animated.Value(0),
      }));

      if (refresh) {
        setItems(newItems);
      } else {
        // When adding new items, ensure they have proper animation values
        setItems((prev) => [...prev, ...newItems]);
      }

      setHasMore(newItems.length === ITEMS_PER_PAGE);

      // Start animations for all items to ensure they're visible
      Animated.parallel(
        newItems.map((item) =>
          Animated.spring(item.animValue, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ),
      ).start();
    } catch (error) {
      console.error("Error loading items:", error);
      Alert.alert("Error", "Failed to load store items. Please try again.");
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
      setPage((prev) => prev + 1);
      loadItems();
    }
  }, [loading, isLoadingMore, hasMore]);

  const { points, purchaseItem, isPurchased } = usePoints();

  const handlePurchase = useCallback(async (item) => {
    // If already purchased, just show a message
    if (isPurchased(item.id)) {
      Alert.alert(
        "Already Purchased",
        `You already own ${item.title}.`
      );
      return;
    }

    // Check if user can afford the item
    if (points < item.points) {
      Alert.alert(
        "Insufficient Points",
        "You need more points to purchase this item.",
      );
      return;
    }

    // Confirm purchase
    Alert.alert(
      "Confirm Purchase",
      `Are you sure you want to purchase ${item.title} for ${item.points} points?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Purchase",
          onPress: async () => {
            // Process the purchase
            const success = await purchaseItem(item.id, item.points);

            if (success) {
              // Animate the item
              if (item.animValue) {
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
              }

              // Show success message
              Alert.alert(
                "Success",
                "Item purchased successfully!",
                [{ text: "OK", onPress: () => setModalVisible(false) }]
              );
            } else {
              // Show error message
              Alert.alert(
                "Error",
                "Failed to complete purchase. Please try again."
              );
            }
          },
        },
      ],
    );
  }, [points, purchaseItem, isPurchased]);

  const renderHeader = useCallback(() => {
    const { points } = usePoints();
    return (
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
            { color: isDarkMode ? "#FFFFFF" : colors.text },
          ]}
        >
          <FontAwesome
            name="star"
            size={20}
            color={isDarkMode ? "#FFD700" : colors.tint}
          />{" "}
          {points} Points
        </ThemedText>
      </Animated.View>
    );
  }, [colors, headerOpacity, isDarkMode]);

  const renderFooter = useCallback(() => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={isDarkMode ? "#FFFFFF" : colors.tint} />
        <ThemedText
          style={[
            styles.footerText,
            {
              color: isDarkMode
                ? "rgba(255, 255, 255, 0.7)"
                : colors.textSecondary,
            },
          ]}
        >
          Loading more items...
        </ThemedText>
      </View>
    );
  }, [hasMore, colors, isDarkMode]);

  const renderEmpty = useCallback(
    () => (
      <View
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}
      >
        <FontAwesome
          name="shopping-basket"
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
          No items available
        </ThemedText>
      </View>
    ),
    [colors, isDarkMode],
  );

  const handleItemPress = useCallback((item) => {
    setSelectedItem(item);
    setModalVisible(true);
  }, []);

  const renderItem = useCallback(
    ({ item, index }) => {
      // Remove the opacity animation that was causing items to fade
      return (
        <Animated.View
          style={[
            styles.itemContainer,
            {
              opacity: item.animValue, // Only use the initial animation value
              transform: [{ scale: item.animValue }], // Only use the initial animation value
            },
          ]}
        >
          <StoreItem
            id={item.id}
            title={item.title}
            body={item.body}
            points={item.points}
            imageUrl={item.imageUrl}
            type={item.type}
            rarity={item.rarity}
            onPress={() => handleItemPress(item)}
          />
        </Animated.View>
      );
    },
    [scrollY, isDarkMode, handleItemPress],
  );

  const keyExtractor = useCallback((item) => item.id, []);

  if (loading && !refreshing) {
    return (
      <ThemedView
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
          Loading store...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
        <Header
          title="Store"
          onProfilePress={() => console.log("Profile icon pressed")}
          style={{ backgroundColor: colors.background }}
          textColor={isDarkMode ? "#FFFFFF" : colors.text}
          iconColor={isDarkMode ? "#FFFFFF" : colors.tint}
        />

        <StoreItemModal
          visible={modalVisible}
          item={selectedItem}
          onClose={() => setModalVisible(false)}
          onPurchase={() => handlePurchase(selectedItem)}
          isDarkMode={isDarkMode}
        />

        <AnimatedFlatList
          data={items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContainer,
            items.length === 0 && styles.emptyList,
            { backgroundColor: colors.background },
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
              tintColor={isDarkMode ? "#FFFFFF" : colors.tint}
              colors={[isDarkMode ? "#FFFFFF" : colors.tint]}
              progressBackgroundColor={colors.card}
            />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
          scrollEventThrottle={16}
          removeClippedSubviews={Platform.OS !== "web"}
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  headerContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  pointsText: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  itemContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    borderRadius: 16,
    margin: 16,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  footer: {
    padding: 16,
    paddingTop: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
});
export default function Shop() {
  return (
      <ShopContent />
  );
}