import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://localhost:5050"; // Replace with your actual API URL

export async function getUser(userId: string) {
    // Get user data from API
    try {
        const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
        alert("User data: " + JSON.stringify(response.data));
    } catch (error) {
        console.error("Error fetching user data: ", error);
    }
}

export async function getCard(cardId: string) {
    try {
        const response = await axios.get(`${API_BASE_URL}/cards/${cardId}`);
        alert("Card data: " + JSON.stringify(response.data));
    } catch (error) {
        console.error("Error fetching card data: ", error);
    }
}

export async function getAllCards() {
    try {
        const response = await axios.get(`${API_BASE_URL}/cards`);
        return response.data;
    } catch (error) {
        console.error("Error fetching all cards: ", error);
    }
}




// Function to save an item
export const saveItem = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// Function to retrieve an item
export const getItem = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return value;
    }
  } catch (error) {
    console.error('Error retrieving data:', error);
  }
  return null;
};