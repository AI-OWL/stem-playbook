import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Button, Image, StyleSheet } from "react-native";
import React from "react";

export default function CardDetailsScreen() {
  const { id } = useLocalSearchParams(); // Get the card ID from the URL
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Card Details</Text>
      <Text style={styles.cardId}>Card ID: {id}</Text>

      {/* Placeholder for the card image */}
      <Image
        source={{ uri: `https://your-image-url.com/card_${id}.jpg` }} // Example dynamic image
        style={styles.image}
      />

      <Text style={styles.description}>
        This is a detailed view of the card with ID {id}. You can show more info here.
      </Text>

      <Button title="Close" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cardId: {
    fontSize: 16,
    color: "gray",
  },
  image: {
    width: 200,
    height: 300,
    marginVertical: 20,
    resizeMode: "contain",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
});
