import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the type for the user data
interface User {
    user_id: string;
    username: string;
    phone_number: string;
    diet: string;
    height: string;
    weight: string;
    email: string;
}

// Define the shape of the context
interface UserContextType {
    user: User | null;
    setUser: (user: User) => void;
}

// Create the context with a default value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create a provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook to use the user context
export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
