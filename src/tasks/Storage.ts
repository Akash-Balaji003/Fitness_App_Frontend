import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_DATA_KEY = 'user_data';
const ALERT_STATUS_KEY = 'has_shown_alert';

// Save user ID to AsyncStorage
export const saveUserId = async (userId: string) => {
    try {
        await AsyncStorage.setItem('user_id', JSON.stringify(userId));
    } catch (error) {
        console.error('Error saving user_id:', error);
    }
};

// Get user ID from AsyncStorage
export const getUserId = async (): Promise<string | null> => {
    try {
        const userId = await AsyncStorage.getItem('user_id');
        return userId;
    } catch (error) {
        console.error('Error retrieving user_id:', error);
        return null;
    }
};

// Save user data in AsyncStorage
export const saveUserData = async (userData: {
    user_id: string;
    username: string;
    phone_number: string;
    blood: string;
    height: number;
    weight: number;
    email: string;
    experience: string,
    stepgoal: number,
    gender: string,
    DOB: string
}) => {
    try {
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    } catch (error) {
        console.error('Error saving user data:', error);
    }
};

// Retrieve user data from AsyncStorage
export const getUserData = async () => {
    try {
        const userData = await AsyncStorage.getItem(USER_DATA_KEY);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error retrieving user data:', error);
        return null;
    }
};

// Remove user data from AsyncStorage (e.g., when logging out)
export const removeUserData = async () => {
    try {
        await AsyncStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
        console.error('Error removing user data:', error);
    }
};

// Save alert status to AsyncStorage
export const saveAlertStatus = async () => {
    try {
        await AsyncStorage.setItem(ALERT_STATUS_KEY, 'true');
    } catch (error) {
        console.error('Error saving alert status:', error);
    }
};

// Check if alert has been shown
export const hasAlertBeenShown = async (): Promise<boolean> => {
    try {
        const status = await AsyncStorage.getItem(ALERT_STATUS_KEY);
        return status === 'true';
    } catch (error) {
        console.error('Error checking alert status:', error);
        return false;
    }
};
