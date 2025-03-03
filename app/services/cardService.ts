import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card } from "../types"; // Import the Card interface

const API_URL = "http://localhost:5050/cards"; // Adjust as needed

// Fetch and store all cards in AsyncStorage
export const fetchAndStoreAllCards = async (token: string): Promise<Card[]> => {
  try {
    const response = await axios.get<Card[]>(`${API_URL}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const cards = response.data;
    await AsyncStorage.setItem("cards", JSON.stringify(cards));
    return cards;
  } catch (error) {
    console.error("Error fetching cards:", error);
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

// Fetch a single card by ID from the backend
export const fetchCard = async (cardId: string, token: string): Promise<Card> => {
  try {
    const response = await axios.get<Card>(`${API_URL}/${cardId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching card:", error);
    throw error;
  }
};

// Get a single card from AsyncStorage
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
