import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { getUserData } from '../tasks/Storage';

// Define the type for the user data
interface User {
    user_id: string;
    username: string;
    phone_number: string;
    diet: string;
    height: number;
    weight: number;
    email: string;
    experience: string;
    stepgoal: number;
    gender: string;
}

// Define the shape of the context
interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
}

// Create the context with a default value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create a provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    // Load user data from AsyncStorage when the provider mounts
    useEffect(() => {
        const loadUserData = async () => {
            const storedUserData = await getUserData();
            if (storedUserData) {
                setUser(storedUserData); // Update context with user data
            }
        };

        loadUserData();
    }, []);

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
