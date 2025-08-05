import React, { useContext, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  NativeModules,
  NativeEventEmitter,
} from "react-native";
import LinearGradient from 'react-native-linear-gradient';

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Ionicons from 'react-native-vector-icons/Ionicons';

import BottomNavBar from "../components/BottomNavBar";

import { useUser } from '../contexts/UserContext';
import { useStepCount } from "../contexts/StepCounterContext";

import AsyncStorage from "@react-native-async-storage/async-storage";
import StepProgressCircle from "../components/StepProgress";
import StepCountGrid from "../components/MonthlySteps";

import BackgroundService from "react-native-background-actions"
import { startBackgroundSync } from "../tasks/BackgroundActionSetup";
import { LAST_MIDNIGHT_STEPS_KEY } from "../tasks/DailyStepUpdate";



const { TypeStepCounterModule } = NativeModules;
const stepCounterEvent = new NativeEventEmitter(TypeStepCounterModule);

const { width, height } = Dimensions.get("window");
const calculatePercentage = (percentage: number, dimension: number) => (percentage / 100) * dimension;

const Home = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) => {

    const [activeTab, setActiveTab] = useState('Home');
    const { user } = useUser();
    const [ streak, setStreak ] = useState(0);
    const [ sensorSteps, setSensorSteps ] = useState(0);
    const { dailyStepCount, setDailyStepCount } = useStepCount();
    const [ midnightStepCount, setMidnightStepCount ] = useState(0);
    const isActive = BackgroundService.isRunning();


    const updateDailyStepCount = async () => {
        let calculatedDailySteps;
        if(midnightStepCount < sensorSteps){
            calculatedDailySteps = sensorSteps - midnightStepCount;
        } else {
            calculatedDailySteps = sensorSteps;
        }
        setDailyStepCount(calculatedDailySteps);
    };

    useEffect(() => {
        if (isActive === false && user) {
            startBackgroundSync(user.user_id, user.stepgoal, user.caloriegoal, user.height, user.weight);
        }
        else {
            console.log("[Home Page UseEffect] Background Service: ", isActive);
        }
    }, [user]);


    useEffect(() => {
        updateDailyStepCount();

    }, [sensorSteps, midnightStepCount]);

    // Fetch from mysql if its not there in async storage
    const fetchMidnightStepCount = async () => {
        try {
            console.log("[Fetch Midnight Step Count] User_ID:", user?.user_id);
            const response = await fetch(
                `http://172.16.0.60:8002/get-total-sensor-steps?id=${user?.user_id}`,
                { method: "GET" }
            );
            
            // If the server is reachable but has an error, throw to trigger the catch block.
            if (!response.ok) {
                throw new Error("Server responded with status: ${response.status}");
            }
    
            const data = await response.json();
            console.log("[Fetch Midnight Step Count] Received Data: ", data);
    
            if (data["total_steps"]) {
                console.log("[Fetch Midnight Step Count] Fetched Midnight Step Count from Server: ", data["total_steps"]);
                
                // This part remains the same
                setMidnightStepCount(data["total_steps"]);
                if(sensorSteps){
                    updateDailyStepCount();
                } else {
                    refreshButton();
                }
                return data["total_steps"];
            } else {
                console.log("[Fetch Midnight Step Count] No Steps Found for Midnight on Server!");
                return null;
            }
        } catch (error) {
            console.error("[Fetch Midnight Step Count] Error fetching from server:", error);
    
            // --- FALLBACK LOGIC STARTS HERE ---
            console.log("[Fetch Midnight Step Count] Attempting to get value from local storage fallback...");
            
            try {
                const localData = await AsyncStorage.getItem(LAST_MIDNIGHT_STEPS_KEY);
                if (localData) {
                    const parsedData = JSON.parse(localData);
                    const localSteps = parsedData.steps;
                    console.log("[Fetch Midnight Step Count] Success! Using local fallback value:", localSteps);
                    
                    // Set the state with the local value
                    setMidnightStepCount(localSteps);
                    if (sensorSteps) {
                        updateDailyStepCount();
                    }
    
                    return localSteps; // Return the locally stored value
                } else {
                    console.warn("[Fetch Midnight Step Count] Local fallback failed: No data found in AsyncStorage. Defaulting to 0.");
                    setMidnightStepCount(0); // Set the state to 0
                    if (sensorSteps) {
                        updateDailyStepCount();
                    }
                    return 0; // Return 0 as the default starting value
                }
            } catch (storageError) {
                console.error("[Fetch Midnight Step Count] Error reading from AsyncStorage fallback:", storageError);
                return null;
            }
            // --- FALLBACK LOGIC ENDS HERE ---
        }
    };

      
    useEffect(() => {
        if (user?.user_id) {
            fetchStreaks();
        }

        // Start step counter when the screen loads
        TypeStepCounterModule.startStepCounter();
        console.log("[Home Page Useeffect] Step Counter Started");
    
        const subscription = stepCounterEvent.addListener('StepCounter', (stepCount) => {
            console.log("[Home Page UseEffect] Step Count: ", stepCount);
            setSensorSteps(parseInt(stepCount, 10));
        });

        fetchMidnightStepCount();

        return () => {
          // Stop counter when component unmounts
          TypeStepCounterModule.stopStepCounter();
          subscription.remove();
        };
    }, [user]);

    const refreshButton = () => {
        console.log("Refresh Button Pressed");
        startCounter();
        startCounter();
    };

    const startCounter = () => {
        console.log("Step Counter going to start");
        TypeStepCounterModule.startStepCounter();
        console.log("Step Counter Started");
        TypeStepCounterModule.stopStepCounter();
    };

    const calculateMetrics = (steps: number, weight: number, height: number): { distance: number, calories: number } => {
        const heightInMeters = height / 100; 
        const STRIDE_LENGTH = heightInMeters * 0.414; // Stride length in meters
        const distanceInMeters = steps * STRIDE_LENGTH; // Distance in meters
        const distanceInKm = distanceInMeters / 1000; // Convert to kilometers
      
        const caloriesBurned = 0.57 * weight * distanceInKm;
      
        return {
          distance: distanceInKm, // Distance in km
          calories: caloriesBurned, // Calories burned
        };
    };

    const fetchStreaks = async () => {
        try {
          // Replace with your actual API URL
          const response = await fetch(`http://172.16.0.60:8002/get-streaks?id=${user?.user_id}`);
          const data = await response.json();
          
          // Assuming the API returns an object with step counts for each day
          console.log("[FETCH STREAKS] Streaks : ", data)
          setStreak(data);
        } catch (error) {
          console.error('Error fetching step data:', error);
        }
    };
    
    if (!user) {
        return (
            <LinearGradient
                colors={['#ffffff', '#B1F0F7']} // White to #0095B7 gradient
                style={styles.container}
                start={{ x: 0, y: 0 }} // Gradient direction (top-left)
                end={{ x: 1, y: 1 }} // Gradient direction (bottom-right)
            >
                <ActivityIndicator size="large" color="blue" />
                <Text style={{ color: "#333", textAlign: 'center', marginTop: 10 }}>
                    Loading...
                </Text>
            </LinearGradient>
        );
    }

    const metrics = calculateMetrics(dailyStepCount, user?.weight, user?.height);

    return (
        <LinearGradient
            colors={['#ffffff', '#B1F0F7']} // White to #0095B7 gradient
            style={styles.container}
            start={{ x: 0, y: 0 }} // Gradient direction (top-left)
            end={{ x: 1, y: 1 }} // Gradient direction (bottom-right)
        >
            <View style={styles.header}>
                <Text style={styles.greeting}>Welcome {user.username},</Text>
                <View style={{flexDirection:"row", gap:30}}>
                    <TouchableOpacity onPress={() => navigation.navigate("FeedbackScreen")}>
                        <FontAwesome name="thumbs-up" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={refreshButton}>
                        <FontAwesome name="refresh" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
                        <FontAwesome5 name="user" size={23} color="black" />
                    </TouchableOpacity>
                </View>
            </View>

            <StepProgressCircle stepCount={dailyStepCount} stepGoal={user.stepgoal} />

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <FontAwesome name="fire" size={24} color="orange" />
                    <Text style={styles.statValue}>{metrics.calories.toFixed(0)} cals</Text>
                    <Text style={styles.statLabel}>Calories Burned Today</Text>
                </View>
                <View style={styles.statBox}>
                    <Ionicons name="footsteps" size={24} color="#1E3E62" />
                    <Text style={styles.statValue}>{streak} Days</Text>
                    <Text style={styles.statLabel}>Longest Streak</Text>
                </View>
            </View>

            <StepCountGrid />

            <BottomNavBar
                navigation={navigation}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

        </LinearGradient>
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
        color: "black",
        fontSize: calculatePercentage(5, width),
        fontWeight: "bold",
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems:"center",
        marginBottom: calculatePercentage(3, height),
    },
    statBox: {
        alignItems: "center",
        alignSelf:"center",
        backgroundColor: "#ffffff",
        padding: calculatePercentage(3, width),
        borderRadius: 10,
        width: "48%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation:3
    },
    statBoxBig: {
        alignSelf:"center",
        backgroundColor: "#EAF8FF",
        padding: calculatePercentage(2, width),
        borderRadius: 10,
        width: "48%",
        height: "30%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation:3
    },
    statValue: {
        fontSize: calculatePercentage(3.5, width),
        fontWeight: "bold",
        color: "black",
        marginTop: calculatePercentage(1, height),
    },
    statLabel: {
        fontSize: calculatePercentage(2, width),
        color: "black",
        opacity: 0.8,
    },
    footer: {
        position: 'absolute',
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
