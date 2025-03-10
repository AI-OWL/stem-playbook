import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card } from "../types";

export const fetchAndStoreAllCards = async (): Promise<Card[]> => {
  try {
    console.debug("[CardService] Fetching all cards...");
    const response = await api.get<Card[]>("/cards");

    console.debug("[CardService] API Response:", response.status, response.data);

    const cards = response.data;
    await AsyncStorage.setItem("cards", JSON.stringify(cards));
    return cards;
  } catch (error: any) {
    console.error("[CardService] Error fetching cards:", error.response?.status, error.response?.data || error.message);
    throw error;
  }
};


// Fetch a single card by ID
export const fetchCard = async (cardId: string): Promise<Card> => {
  try {
    const response = await api.get<Card>(`/cards/${cardId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching card:", error);
    throw error;
  }
};

// Get all cards from AsyncStorage
export const getStoredCards = async (): Promise<Card[] | null> => {
  try {
    const cards = await AsyncStorage.getItem("cards");
    return cards ? JSON.parse(cards) as Card[] : null;
  } catch (error) {
    console.error("Error retrieving cards:", error);
    return null;
  }
};

// Get a single stored card
export const getStoredCard = async (cardId: string): Promise<Card | null> => {
  try {
    const cards = await getStoredCards();
    if (!cards) return null;
    
    return cards.find((card) => card.id === cardId) || null;
  } catch (error) {
    console.error("Error retrieving card:", error);
    return null;
  }
};
