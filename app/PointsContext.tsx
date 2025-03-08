
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a context for points
interface PointsContextType {
  points: number;
  addPoints: (amount: number) => Promise<void>;
  subtractPoints: (amount: number) => Promise<void>;
  setPoints: React.Dispatch<React.SetStateAction<number>>;
  redeemedAchievements: string[];
  redeemedCards: string[];
  purchasedItems: string[];
  redeemAchievement: (id: string, points: number) => void;
  redeemCard: (id: string, points: number) => void;
  purchaseItem: (id: string, points: number) => Promise<boolean>;
  isAchievementRedeemed: (id: string) => boolean;
  isCardRedeemed: (id: string) => boolean;
  isPurchased: (id: string) => boolean;
}

const PointsContext = createContext<PointsContextType | null>(null);

// Custom hook to use the points context
export const usePoints = () => {
  const context = useContext(PointsContext);
  if (!context) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
};

// Provider component
export const PointsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [points, setPoints] = useState(0);
  const [redeemedAchievements, setRedeemedAchievements] = useState<string[]>([]);
  const [redeemedCards, setRedeemedCards] = useState<string[]>([]);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);

  // Load points and redeemed items from storage on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load points
        const storedPoints = await AsyncStorage.getItem('userPoints');
        if (storedPoints) {
          setPoints(parseInt(storedPoints, 10));
        } else {
          // Default points if none are stored
          setPoints(400);
          await AsyncStorage.setItem('userPoints', '400');
        }

        // Load redeemed achievements
        const storedAchievements = await AsyncStorage.getItem('redeemedAchievements');
        if (storedAchievements) {
          setRedeemedAchievements(JSON.parse(storedAchievements));
        }

        // Load redeemed cards
        const storedCards = await AsyncStorage.getItem('redeemedCards');
        if (storedCards) {
          setRedeemedCards(JSON.parse(storedCards));
        }

        // Load purchased items
        const storedPurchasedItems = await AsyncStorage.getItem('purchasedItems');
        if (storedPurchasedItems) {
          setPurchasedItems(JSON.parse(storedPurchasedItems));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to defaults
        setPoints(400);
      }
    };

    loadData();
  }, []);

  // Function to add points
  const addPoints = async (amount: number) => {
    const newPoints = points + amount;
    setPoints(newPoints);
    try {
      await AsyncStorage.setItem('userPoints', newPoints.toString());
    } catch (error) {
      console.error('Error saving points:', error);
    }
  };

  // Function to subtract points
  const subtractPoints = async (amount: number) => {
    const newPoints = Math.max(0, points - amount); // Prevent negative points
    setPoints(newPoints);
    try {
      await AsyncStorage.setItem('userPoints', newPoints.toString());
    } catch (error) {
      console.error('Error saving points:', error);
    }
  };

  // Function to redeem achievement
  const redeemAchievement = (id: string, pointValue: number) => {
    if (!redeemedAchievements.includes(id)) {
      const newPoints = points + pointValue;
      setPoints(newPoints);
      const newRedeemed = [...redeemedAchievements, id];
      setRedeemedAchievements(newRedeemed);

      // Save to AsyncStorage
      AsyncStorage.setItem('userPoints', newPoints.toString()).catch(
        error => console.error('Error saving points:', error)
      );
      AsyncStorage.setItem('redeemedAchievements', JSON.stringify(newRedeemed)).catch(
        error => console.error('Error saving redeemed achievements:', error)
      );
    }
  };

  // Function to redeem card
  const redeemCard = (id: string, pointValue: number) => {
    if (!redeemedCards.includes(id)) {
      const newPoints = points + pointValue;
      setPoints(newPoints);
      const newRedeemed = [...redeemedCards, id];
      setRedeemedCards(newRedeemed);

      // Save to AsyncStorage
      AsyncStorage.setItem('userPoints', newPoints.toString()).catch(
        error => console.error('Error saving points:', error)
      );
      AsyncStorage.setItem('redeemedCards', JSON.stringify(newRedeemed)).catch(
        error => console.error('Error saving redeemed cards:', error)
      );
    }
  };

  // Function to check if achievement is redeemed
  const isAchievementRedeemed = (id: string) => redeemedAchievements.includes(id);

  // Function to check if card is redeemed
  const isCardRedeemed = (id: string) => redeemedCards.includes(id);

  // Function to purchase an item
  const purchaseItem = async (id: string, pointsCost: number) => {
    // Check if already purchased
    if (purchasedItems.includes(id)) {
      return true;
    }

    // Check if user has enough points
    if (points < pointsCost) {
      return false;
    }

    try {
      // Subtract points
      const newPoints = points - pointsCost;
      setPoints(newPoints);

      // Add to purchased items
      const newPurchasedItems = [...purchasedItems, id];
      setPurchasedItems(newPurchasedItems);

      // Save to AsyncStorage
      await AsyncStorage.setItem('userPoints', newPoints.toString());
      await AsyncStorage.setItem('purchasedItems', JSON.stringify(newPurchasedItems));

      return true;
    } catch (error) {
      console.error('Error purchasing item:', error);
      return false;
    }
  };

  // Function to check if item is purchased
  const isPurchased = (id: string) => purchasedItems.includes(id);

  return (
    <PointsContext.Provider value={{
      points,
      setPoints,
      addPoints,
      subtractPoints,
      redeemedAchievements,
      redeemedCards,
      purchasedItems,
      redeemAchievement,
      redeemCard,
      purchaseItem,
      isAchievementRedeemed,
      isCardRedeemed,
      isPurchased
    }}>
      {children}
    </PointsContext.Provider>
  );
};
