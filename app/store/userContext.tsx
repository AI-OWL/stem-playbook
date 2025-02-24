import React, { createContext, useContext, useState, ReactNode } from "react";
import { View, Text } from "react-native";

// Define User interface
export interface User {
    id: string;            // Unique User ID
    name: string;          // User's full name
    email: string;         // User's email address
    cardIds: string[];     // List of card IDs owned by the user
}

// Define context properties
interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
}

// Create UserContext
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            <View style={{ flex: 1 }}>{children}</View>
        </UserContext.Provider>
    );
};

// Custom hook to use the UserContext
export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
