import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";

const API_URL = "http://localhost:5050/users"; // Adjust if needed

// Fetch and store user data in AsyncStorage
export const fetchAndStoreUser = async (userId: string, token: string): Promise<User> => {
  try {
    const response = await axios.get<User>(`${API_URL}/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const user = response.data;
    await AsyncStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

// Get stored user data from AsyncStorage
export const getStoredUser = async (): Promise<User | null> => {
  try {
    const user = await AsyncStorage.getItem("user");
    return user ? JSON.parse(user) as User : null;
  } catch (error) {
    console.error("Error retrieving user:", error);
    return null;
  }
};

// Add a card to the user's collection and update AsyncStorage
export const addCardToUser = async (userId: string, cardId: string, token: string): Promise<User> => {
  try {
    const response = await axios.put<User>(
      `${API_URL}/${userId}/cards`,
      { cardId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const updatedUser = response.data;

    // Update AsyncStorage with the new user data
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    console.error("Error adding card to user:", error);
    throw error;
  }
};

// Logout (clear stored user data and token)
export const logoutUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("cards"); // Optional: Clear cached cards
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
