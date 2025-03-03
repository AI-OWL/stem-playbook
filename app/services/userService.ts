import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";

// Fetch and store user data
export const fetchAndStoreUser = async (userId: string): Promise<User> => {
  try {
    const response = await api.get<User>(`/users/${userId}`);
    const user = response.data;
    await AsyncStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

// Get stored user data
export const getStoredUser = async (): Promise<User | null> => {
  try {
    const user = await AsyncStorage.getItem("user");
    return user ? (JSON.parse(user) as User) : null;
  } catch (error) {
    console.error("Error retrieving user:", error);
    return null;
  }
};

// Add a card to the user's collection and update AsyncStorage
export const addCardToUser = async (userId: string, cardId: string): Promise<User> => {
  try {
    const response = await api.put<User>(`/users/${userId}/cards`, { cardId });
    const updatedUser = response.data;
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    console.error("Error adding card to user:", error);
    throw error;
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("cards"); // Optional: Clear cached cards
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
