// services/types.ts

export interface User {
    id: string;
    name: string;
    email: string;
    cardIds: string[]; // Array of card IDs the user owns
  }
  
  export interface Card {
    id: string;
    name: string;
    body: string;
    category: string;
    imageUrl: string;
    videoUrl: string;
    tagline: string;
    rarity: "common" | "rare" | "epic" | "legendary"; // Assuming these are the rarity values
  }
  