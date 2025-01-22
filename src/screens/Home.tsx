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
import LinearGradient from 'react-native-linear-gradient';

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { SafeAreaView } from "react-native-safe-area-context";
import BottomNavBar from "../components/BottomNavBar";

import { useUser } from '../contexts/UserContext';
import { useStepCounter } from "../contexts/StepCounterContext"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import StepProgressCircle from "../components/StepProgress";
import StepCountGrid from "../components/MonthlySteps";

const { width, height } = Dimensions.get("window");
const calculatePercentage = (percentage: number, dimension: number) => (percentage / 100) * dimension;

const Home = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) => {

    const [activeTab, setActiveTab] = useState('Home');
    const { user, setUser } = useUser();
    const { stepCount, setStepCount } = useStepCounter();
    const [ streak, setStreak ] = useState(0);

    const handleLogout = async () => {
        try {
            await AsyncStorage.clear();
            navigation.navigate('Login');
            setUser(null as any);
        } catch (error) {
            Alert.alert('Error', 'Failed to log out. Please try again.');
            console.error(error);
        }
    };

    const handleRefresh = async () => {
        try {
            console.log("Refreshing...");

            console.log("current stepcount : ", stepCount);
    
            const storedStepCount = await AsyncStorage.getItem('stepCount');
            console.log("Fetched from AsyncStorage:", storedStepCount);
    
            if (storedStepCount) {
                console.log("Updating step count...");
                setStepCount(parseInt(storedStepCount));
                console.log("Updated step count:", storedStepCount);
            } else {
                console.log("No stored step count found.");
            }
            ToastAndroid.show('Refreshing...', ToastAndroid.SHORT);
        } catch (error) {
            console.error("Failed to fetch updated step count", error);
            ToastAndroid.show('Error refreshing, try again', ToastAndroid.SHORT);
        }
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
          const response = await fetch(`https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/get-streaks?id=${user?.user_id}`);
          const data = await response.json();
          
          // Assuming the API returns an object with step counts for each day
          console.log("Streaks : ", data)
          setStreak(data);
        } catch (error) {
          console.error('Error fetching step data:', error);
        }
    };

    useEffect(()=>{
        if (user?.user_id) {
            fetchStreaks();
        }
    },[user]);
    
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

    const metrics = calculateMetrics(stepCount, user?.weight, user?.height);

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
                    <TouchableOpacity onPress={handleRefresh}>
                        <FontAwesome name="refresh" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLogout}>
                        <MaterialIcons name="logout" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            </View>

            <StepProgressCircle stepCount={stepCount} stepGoal={user.stepgoal} />

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

            {/*
                <TouchableOpacity style={[styles.statBoxBig,{width:"100%"}]}>
                    <Text style={[styles.statValue, {fontSize:20, textAlign:"left", marginTop:1}]}>January</Text>
                    <Text style={[styles.statLabel, {alignSelf:"center", marginTop:"20%", fontSize:14}]}>Current Month Steps Data Will Be Displayed Here</Text>
                </TouchableOpacity>
            */}
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
