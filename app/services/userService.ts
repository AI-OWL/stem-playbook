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

// Update user's points and refresh stored data
export const updateUserPoints = async (userId: string, pointsToAdd: number): Promise<User> => {
  try {
    const response = await api.put<User>(`/users/${userId}/points`, { points: pointsToAdd });
    const updatedUser = response.data;
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    console.error("Error updating user points:", error);
    throw error;
  }
};

// Change user's password
export const changeUserPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    await api.put(`/users/${userId}/password`, {
      currentPassword,
      newPassword,
    });
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

// Delete a user
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    // Call the DELETE endpoint to remove the user from the backend
    await api.delete(`/users/${userId}`);

    // Clean up local storage after successful deletion
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    // Optionally clear other cached data if needed
    await AsyncStorage.removeItem("cards");
  } catch (error) {
    console.error("Error deleting user:", error);
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

// Fetch top users (leaderboard)
export const fetchTopUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get<User[]>("/users/top");
    return response.data;
  } catch (error) {
    console.error("Error fetching top users:", error);
    throw error;
  }
};

// Fetch a user's rank by ID
export const fetchUserRank = async (userId: string): Promise<{ rank: number; total: number }> => {
  try {
    const response = await api.get<{ rank: number; total: number }>(`/users/rank/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user rank:", error);
    throw error;
  }
};