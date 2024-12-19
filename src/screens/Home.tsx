import React, { useContext, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { SafeAreaView } from "react-native-safe-area-context";
import BottomNavBar from "../components/BottomNavBar";

import { useUser } from '../contexts/UserContext';
import { useStepCounter } from "../contexts/StepCounterContext"; // Import the StepContext
import AsyncStorage from "@react-native-async-storage/async-storage";



const { width, height } = Dimensions.get("window");
const calculatePercentage = (percentage: number, dimension: number) => (percentage / 100) * dimension;

const Home = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) => {

    const [activeTab, setActiveTab] = useState('Home');

    const { user, setUser } = useUser();
    const { stepCount, setStepCount } = useStepCounter();  // Added setStepCount to update the state


    const handleLogout = async () => {
        try {
            await AsyncStorage.clear();
            navigation.navigate('Login'); // Navigate to login screen
            setUser(null as any); // Clear the userContext
        } catch (error) {
            Alert.alert('Error', 'Failed to log out. Please try again.');
            console.error(error);
        }
    };

    const handleRefresh = async () => {
        try {
            console.log("Refreshing...");
    
            const storedStepCount = await AsyncStorage.getItem('stepCount');
            console.log("Fetched from AsyncStorage:", storedStepCount);
    
            if (storedStepCount) {
                console.log("Updating step count...");
                setStepCount(parseInt(storedStepCount)); // Update the stepCount in state
                console.log("Updated step count:", storedStepCount);
            } else {
                console.log("No stored step count found.");
            }
            ToastAndroid.show('Refreshing...', ToastAndroid.SHORT);
        } catch (error) {
            console.error("Failed to fetch updated step count", error);
            ToastAndroid.show('Error refreshing try again', ToastAndroid.SHORT);
        }
    };

    if (!user) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={{ color: "white", textAlign: 'center', marginTop: 10 }}>
                    Loading...
                </Text>
            </SafeAreaView>
        );
    }
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Welcome {user?.username},</Text>
                <View style={{flexDirection:"row", gap:30}}>
                    <TouchableOpacity onPress={handleRefresh}>
                        <FontAwesome name="refresh" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLogout}>
                        <MaterialIcons name="logout" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.stepsSection}>
                <View style={styles.stepsCircle}>
                <Text style={styles.stepsCount}>{stepCount}</Text>
                <Text style={styles.stepsText}>STEPS</Text>
                </View>
                <Text style={styles.distance}>5 km</Text>
                <Text style={styles.goal}> {stepCount} / {user?.stepgoal}</Text>
            </View>

            <View style={styles.leaderboard}>
                <Text style={styles.rank}>#1</Text>
                <Text style={styles.rankText}>Your position in leaderboard</Text>
            </View>

            <View style={styles.statsContainer}>
                <TouchableOpacity style={styles.statBox}>
                    <FontAwesome name="heart" size={24} color="red" />
                    <Text style={styles.statValue}>120 bpm</Text>
                    <Text style={styles.statLabel}>Heart Rate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statBox}>
                    <FontAwesome name="fire" size={24} color="orange" />
                    <Text style={styles.statValue}>1567 kcals</Text>
                    <Text style={styles.statLabel}>Calories Today</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.foodSection}>
                <Image
                source={{ uri: "https://via.placeholder.com/150" }}
                style={styles.foodImage}
                />
                <View>
                <Text style={styles.foodTitle}>Plan Well, Eat Well</Text>
                <Text style={styles.foodSubtitle}>Healthy food makes you feel good</Text>
                <TouchableOpacity
                    onPress={() => Alert.alert("Clicked food")}
                >
                    <Text style={styles.scheduleButton}>Schedule Now</Text>
                </TouchableOpacity>
                </View>
            </View>

            {/* Bottom Navigation Bar */}
            <BottomNavBar
                navigation={navigation}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1c1c1e",
        paddingHorizontal: calculatePercentage(5, width),
        paddingTop: calculatePercentage(2, height),
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: calculatePercentage(2, height),
    },
    greeting: {
        color: "white",
        fontSize: calculatePercentage(5, width),
        fontWeight: "bold",
    },
    stepsSection: {
        alignItems: "center",
        marginBottom: calculatePercentage(4, height),
    },
    stepsCircle: {
        width: calculatePercentage(40, width),
        height: calculatePercentage(40, width),
        borderRadius: calculatePercentage(20, width),
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: calculatePercentage(2, height),
    },
    stepsCount: {
        fontSize: calculatePercentage(5, width),
        fontWeight: "bold",
        color: "white",
    },
    stepsText: {
        fontSize: calculatePercentage(2, width),
        color: "white",
        opacity: 0.8,
    },
    distance: {
        fontSize: calculatePercentage(4, width),
        color: "white",
        opacity: 0.8,
        marginBottom: calculatePercentage(1, height),
    },
    goal: {
        fontSize: calculatePercentage(3.5, width),
        color: "orange",
    },
    leaderboard: {
        alignItems: "center",
        marginBottom: calculatePercentage(3, height),
    },
    rank: {
        fontSize: calculatePercentage(8, width),
        fontWeight: "bold",
        color: "white",
    },
    rankText: {
        fontSize: calculatePercentage(2.5, width),
        color: "white",
        opacity: 0.7,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: calculatePercentage(3, height),
    },
    statBox: {
        alignItems: "center",
        backgroundColor: "#2c2c2e",
        padding: calculatePercentage(3, width),
        borderRadius: 10,
        width: "48%",
    },
    statValue: {
        fontSize: calculatePercentage(3.5, width),
        fontWeight: "bold",
        color: "white",
        marginTop: calculatePercentage(1, height),
    },
    statLabel: {
        fontSize: calculatePercentage(2, width),
        color: "white",
        opacity: 0.8,
    },
    foodSection: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2c2c2e",
        padding: calculatePercentage(3, width),
        borderRadius: 10,
        marginBottom: calculatePercentage(1, height),
    },
    foodImage: {
        width: calculatePercentage(20, width),
        height: calculatePercentage(20, width),
        borderRadius: 10,
        marginRight: calculatePercentage(3, width),
    },
    foodTitle: {
        fontSize: calculatePercentage(3, width),
        fontWeight: "bold",
        color: "white",
    },
    foodSubtitle: {
        fontSize: calculatePercentage(2.5, width),
        color: "white",
        opacity: 0.8,
        marginBottom: calculatePercentage(1, height),
    },
    scheduleButton: {
        color: "orange",
        fontSize: calculatePercentage(2.5, width),
        fontWeight: "bold",
    },
    footer: {
        position: 'absolute', // Makes the bottom navigation stick to the bottom
        bottom: 15,
        left: 10,
        right: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 60,
        backgroundColor: "#2c2c2e",
        borderRadius: 10,
    },
});

export default Home;