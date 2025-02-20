import React, { useState } from "react";
import { StyleSheet, Text, View, SectionList } from "react-native";
import Header from "@/components/Header";
import StemCard from "@/components/StemCard";
import CardModal from "@/components/CardModal";

const categories = [
  {
    title: "Science",
    data: [
      { id: "1", imageUrl: "https://picsum.photos/200/300?grayscale" },
      { id: "2" }, // Missing card (question mark placeholder)
      { id: "3", imageUrl: "https://picsum.photos/id/870/200/300?grayscale&blur=2" },
    ],
  },
  {
    title: "Engineering",
    data: [
      { id: "4", imageUrl: "https://example.com/card3.jpg" },
      { id: "5" }, // Missing card (question mark placeholder)
      { id: "6", imageUrl: "https://example.com/card4.jpg" },
      { id: "7" }, // Missing card
    ],
  },
  {
    title: "Mathematics",
    data: [
      { id: "8", imageUrl: "https://example.com/card5.jpg" },
      { id: "9", imageUrl: "https://example.com/card6.jpg" },
    ],
  },
];

export default function HomeScreen() {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedCardImageUrl, setSelectedCardImageUrl] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Header title="Wallet" />

      <SectionList
        sections={categories}
        keyExtractor={(item) => item.id}
        renderItem={() => null} // No need to render items separately since we handle them in the section header
        renderSectionHeader={({ section: { title, data } }) => (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>{title}</Text>
            </View>
            <View style={styles.grid}>
              {data.map((card) => (
                <StemCard
                  key={card.id}
                  imageUrl={card.imageUrl}
                  style={styles.card}
                  onPress={() => {
                    setSelectedCardId(card.id); // Store card ID
                    setSelectedCardImageUrl(card.imageUrl || null); // Store image URL
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
        cardId={selectedCardId || undefined} // ✅ Pass the card ID to CardModal
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
    width: "48%", // Two cards per row with spacing
    marginBottom: 10,
  },
});