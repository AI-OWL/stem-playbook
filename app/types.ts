// services/types.ts

export interface User {
  id: string;
  name: string;
  email: string;
  cardIds: string[]; // Array of card IDs the user owns
  points: number; // User's points
  achievementIds: string[]; // Array of achievement IDs
}

export interface Card {
  id: string;
  name: string;
  body: string;
  category: string;
  imageUrl: string;
  videoUrl: string;
  tagline: string;
}
