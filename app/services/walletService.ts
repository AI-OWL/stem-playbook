export interface WalletCard {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  collected: boolean;
}

export interface WalletCategory {
  title: string;
  data: WalletCard[];
}

/**
 * Converts the backend’s object-like response into a proper array, groups cards by category,
 * and marks a card as collected if its id exists in the provided userCardIds array.
 * Cards with no valid category are skipped.
 *
 * @param allCards - The raw response from the "get all cards" service.
 * @param userCardIds - Array of card IDs owned by the user.
 * @returns Array of wallet categories with properly formatted card data.
 */
export const getWalletData = (
  allCards: any,
  userCardIds: string[]
): WalletCategory[] => {
  // Convert the outer object into an array if needed.
  const categoriesArray = Array.isArray(allCards)
    ? allCards
    : Object.keys(allCards)
        .filter((key) => key !== "length")
        .map((key) => allCards[key]);

  const walletCategories: WalletCategory[] = categoriesArray
    .map((category: any) => {
      if (!category.category) return null;
      // Convert the "data" property (cards) into an array.
      const cardsArray = Array.isArray(category.data)
        ? category.data
        : Object.keys(category.data)
            .filter((key) => key !== "length")
            .map((key) => category.data[key]);
      const cards = cardsArray.map((card: any) => ({
        id: card.id,
        imageUrl: card.imageUrl && card.imageUrl.trim().length > 0
          ? card.imageUrl
          : "/default/path/to/image.png",
        title: card.name,
        description: card.tagline,
        rarity: card.rarity,
        collected: userCardIds.includes(card.id),
      }));
      return {
        title: category.category,
        data: cards,
      };
    })
    .filter((c: WalletCategory | null) => c !== null) as WalletCategory[];

  return walletCategories;
};
