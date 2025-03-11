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
import { getStoredUser, updateUserPoints } from "../services/userService";

const ITEMS_PER_PAGE = 10;
const ANIMATION_DURATION = 300;
const STORAGE_KEYS = {
  THEME: "theme",
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

function ShopContent({ onPurchaseItem, isItemPurchased }) {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === "dark");
  const [userPoints, setUserPoints] = useState(0);
  const colors = useMemo(
    () => Colors[isDarkMode ? "dark" : "light"],
    [isDarkMode],
  );

  useEffect(() => {
    const initializeApp = async () => {
      await Promise.all([loadThemePreference(), loadUserPoints()]);
    };

    initializeApp();
  }, []);

  const loadUserPoints = async () => {
    try {
      const user = await getStoredUser();
      if (user && user.points !== undefined) {
        setUserPoints(user.points);
      }
    } catch (error) {
      console.error("Error loading user points:", error);
    }
  };

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

      {/* Commented out original shop content for production */}
      {/*
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
        ListFooterComponentStyle={{ marginBottom: 64 }}
      />
      */}

      {/* Coming Soon Page */}
      <View style={[styles.comingSoonContainer, { backgroundColor: colors.background }]}>
        <FontAwesome
          name="shopping-basket"
          size={64}
          color={isDarkMode ? "rgba(255, 255, 255, 0.7)" : colors.icon}
        />
        <ThemedText
          style={[
            styles.comingSoonText,
            { color: isDarkMode ? "#FFFFFF" : colors.text },
          ]}
        >
          Store Coming Soon!
        </ThemedText>
        <ThemedText
          style={[
            styles.comingSoonSubtext,
            { color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : colors.textSecondary },
          ]}
        >
          We're working hard to bring you an amazing shopping experience.
          Check back later!
        </ThemedText>
      </View>
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
  // Coming Soon styles
  comingSoonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 80, // Added paddingTop to account for the Header height
    paddingBottom: 32,
    flexDirection: "column",
    gap: 24, // Ensures spacing between icon and text
  },
  comingSoonText: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 0, // Removed marginTop since gap handles spacing
    textAlign: "center",
  },
  comingSoonSubtext: {
    fontSize: 16,
    marginTop: 0, // Removed marginTop since gap handles spacing
    textAlign: "center",
    paddingHorizontal: 16,
  },
});

export default function Shop({ onPurchaseItem = () => true, isItemPurchased = () => false }) {
  return (
    <ShopContent 
      onPurchaseItem={onPurchaseItem}
      isItemPurchased={isItemPurchased}
    />
  );
}