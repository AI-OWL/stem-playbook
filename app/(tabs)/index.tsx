import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, SectionList } from "react-native";
import Header from "@/components/Header";
import StemCard from "@/components/StemCard";
import CardModal from "@/components/CardModal";
import { getAllCards } from "../utils/apiService";
import { CardGroup } from "@/.expo/types/CardGroup";

export default function HomeScreen() {
  const [allCards, setAllCards] = useState<CardGroup[]>([]); // Use state for re-rendering
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedCardImageUrl, setSelectedCardImageUrl] = useState<string | null>(null);

  useEffect(() => {
    getAllCards()
      .then((cards) => {
        console.log("Fetched cards:", JSON.stringify(cards, null, 2)); // Log properly formatted data
        if (Array.isArray(cards)) {
          setAllCards(cards); // Update state correctly
        } else {
          console.error("Error: API response is not an array:", cards);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch cards:", error);
      });
  }, []); // Runs once when component mounts

  return (
    <View style={styles.container}>
      <Header title="Wallet" />

      <SectionList
        sections={allCards}
        keyExtractor={(item) => item.id}
        renderItem={() => null}
        renderSectionHeader={({ section: { category, data } }) => (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>{category}</Text>
            </View>
            <View style={styles.grid}>
              {data.map((card) => (
                <StemCard
                  key={card.id}
                  imageUrl={card.imageUrl}
                  style={styles.card}
                  onPress={() => {
                    setSelectedCardId(card.id);
                    setSelectedCardImageUrl(card.imageUrl || null);
                  }}
                />
              ))}
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={<View style={{ height: 50 }} />}
        ListHeaderComponent={<View style={{ height: 20 }} />}
      />

      {/* Modal for Enlarged Card */}
      <CardModal
        visible={!!selectedCardId}
        imageUrl={selectedCardImageUrl || undefined}
        cardId={selectedCardId || undefined}
        onClose={() => {
          setSelectedCardId(null);
          setSelectedCardImageUrl(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2D3E84",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderContainer: {
    backgroundColor: "#FFFFFF20",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    alignSelf: "center",
    width: "90%",
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    marginBottom: 10,
  },
});
