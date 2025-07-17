import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  NativeModules,
  NativeEventEmitter,
  ScrollView,
  Image,
} from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import * as Progress from 'react-native-progress';

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import BottomNavBar from "../components/BottomNavBar";
import { useUser } from '../contexts/UserContext';
import { useStepCount } from "../contexts/StepCounterContext";

import AsyncStorage from "@react-native-async-storage/async-storage";
import StepProgressCircle from "../components/StepProgress";
// 1. Re-import the StepCountGrid component
import StepCountGrid from "../components/MonthlySteps";

const { TypeStepCounterModule } = NativeModules;
const stepCounterEvent = new NativeEventEmitter(TypeStepCounterModule);

const { width, height } = Dimensions.get("window");

// --- Helper Component for Dashboard Cards ---
const InfoCard = ({ icon, title, value, unit, color, iconBgColor }: any) => (
    <View style={styles.infoCard}>
        <View style={[styles.infoCardIcon, { backgroundColor: iconBgColor }]}>
            <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        <View>
            <Text style={styles.infoCardTitle}>{title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <Text style={styles.infoCardValue}>{value}</Text>
                <Text style={styles.infoCardUnit}>{unit}</Text>
            </View>
        </View>
    </View>
);

const Home = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) => {
    const [activeTab, setActiveTab] = useState('Home');
    const { user } = useUser();
    const [streak, setStreak] = useState(0);
    const [sensorSteps, setSensorSteps] = useState(0);
    const { dailyStepCount, setDailyStepCount } = useStepCount();
    const [midnightStepCount, setMidnightStepCount] = useState(0);

    // --- All your existing useEffect and data fetching logic remains the same ---
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
        updateDailyStepCount();
    }, [sensorSteps, midnightStepCount]);

    const fetchMidnightStepCount = async () => {
        try {
            const response = await fetch(`https://9kz2rcl6-8000.inc1.devtunnels.ms/get-total-sensor-steps?id=${user?.user_id}`);
            const data = await response.json();
            if (data["total_steps"]) {
                setMidnightStepCount(data["total_steps"]);
                if(sensorSteps){ updateDailyStepCount(); }
                else{ refreshButton(); }
                return data["total_steps"];
            }
            return null;
        } catch (error) {
            console.error("[Fetch Midnight Step Count] Error:", error);
            return null;
        }
    };

    const getMidnightStepCount = async () => {
        try {
            const todayDate = new Date().toISOString().split("T")[0];
            const storedData = await AsyncStorage.getItem('MIDNIGHT_STEP_COUNT');
            if (storedData !== null) {
                const parsedData = JSON.parse(storedData);
                if (parsedData.date === todayDate) {
                    setMidnightStepCount(parsedData.midnightStepCount);
                    return parsedData.midnightStepCount;
                }
            }
            const fetchedStepCount = await fetchMidnightStepCount();
            if (fetchedStepCount !== null) {
                const newData = { date: todayDate, midnightStepCount: fetchedStepCount };
                await AsyncStorage.setItem('MIDNIGHT_STEP_COUNT', JSON.stringify(newData));
                setMidnightStepCount(fetchedStepCount);
                return fetchedStepCount;
            }
            return null;
        } catch (error) {
            console.error("[Get Midnight Step Count] Error:", error);
            return null;
        }
    };
      
    useEffect(() => {
        if (user?.user_id) {
            fetchStreaks();
            getMidnightStepCount();
        }
        TypeStepCounterModule.startStepCounter();
        const subscription = stepCounterEvent.addListener('StepCounter', (stepCount) => {
            setSensorSteps(parseInt(stepCount, 10));
        });
        return () => {
          TypeStepCounterModule.stopStepCounter();
          subscription.remove();
        };
    }, [user]);

    const refreshButton = () => {
        TypeStepCounterModule.startStepCounter();
        TypeStepCounterModule.stopStepCounter();
    };

    const calculateMetrics = (steps: number, weight: number, height: number): { distance: number, calories: number } => {
        const heightInMeters = height / 100; 
        const STRIDE_LENGTH = heightInMeters * 0.414;
        const distanceInMeters = steps * STRIDE_LENGTH;
        const distanceInKm = distanceInMeters / 1000;
        const caloriesBurned = 0.57 * weight * distanceInKm;
        return { distance: distanceInKm, calories: caloriesBurned };
    };

    const fetchStreaks = async () => {
        try {
          const response = await fetch(`https://9kz2rcl6-8000.inc1.devtunnels.ms/get-streaks?id=${user?.user_id}`);
          const data = await response.json();
          setStreak(data);
        } catch (error) {
          console.error('Error fetching step data:', error);
        }
    };
    
    if (!user) {
        return (
            <LinearGradient colors={['#F7F8FF', '#E2E7FF']} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A69FF" />
                <Text style={{ color: "#333", textAlign: 'center', marginTop: 10 }}>Loading Your Dashboard...</Text>
            </LinearGradient>
        );
    }

    const metrics = calculateMetrics(dailyStepCount, user?.weight, user?.height);
    const calorieGoal = user.caloriegoal || 2000;
    const calorieProgress = metrics.calories / calorieGoal;

    return (
        <View style={{flex: 1}}>
            <LinearGradient colors={['#F7F8FF', '#E2E7FF']} style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* --- Enhanced Header --- */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.greeting}>Hello, {user.username}!</Text>
                            <Text style={styles.subGreeting}>Ready to crush your goals?</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
                            <Image 
                                source={{ uri: `https://i.pravatar.cc/150?u=${user.user_id}` }} 
                                style={styles.profilePic}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* --- Main Progress Circle --- */}
                    <StepProgressCircle stepCount={dailyStepCount} stepGoal={user.stepgoal} />
                    
                    {/* 2. Add the monthly calendar grid back */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Monthly Progress</Text>
                        <StepCountGrid />
                    </View>


                    {/* --- Health Stats Dashboard --- */}
                    <View style={styles.dashboardContainer}>
                        <Text style={styles.sectionTitle}>Today's Activity</Text>
                        <InfoCard 
                            icon="walk"
                            title="Distance"
                            value={metrics.distance.toFixed(2)}
                            unit="km"
                            color="#3F51B5"
                            iconBgColor="rgba(63, 81, 181, 0.1)"
                        />
                        <InfoCard 
                            icon="fire"
                            title="Streak"
                            value={streak}
                            unit="days"
                            color="#FF9800"
                            iconBgColor="rgba(255, 152, 0, 0.1)"
                        />

                        {/* --- Calorie Progress Card --- */}
                        <View style={styles.calorieCard}>
                            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                                <Text style={styles.infoCardTitle}>Calories Burned</Text>
                                <MaterialCommunityIcons name="food-apple-outline" size={24} color="#E91E63" />
                            </View>
                            <Text style={styles.calorieValue}>{metrics.calories.toFixed(0)} <Text style={styles.calorieTotal}>/ {calorieGoal} cals</Text></Text>
                            <Progress.Bar 
                                progress={calorieProgress} 
                                width={null} // Fills the container
                                height={10}
                                color={'#E91E63'}
                                unfilledColor={'rgba(233, 30, 99, 0.2)'}
                                borderWidth={0}
                                borderRadius={10}
                            />
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
            <BottomNavBar
                navigation={navigation}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
        </View>
    );
};

// --- New and Enhanced Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: width * 0.06,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: height * 0.02,
        marginBottom: height * 0.02,
    },
    greeting: {
        color: "#1E2022",
        fontSize: width * 0.065,
        fontWeight: "bold",
    },
    subGreeting: {
        color: "#777",
        fontSize: width * 0.04,
    },
    profilePic: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#4A69FF'
    },
    // 3. Removed quickActionsContainer and related styles
    sectionContainer: {
        marginTop: height * 0.03,
        marginBottom: height * 0.01,
    },
    dashboardContainer: {
        marginBottom: 100, // Space for bottom nav bar
    },
    sectionTitle: {
        fontSize: width * 0.05,
        fontWeight: 'bold',
        color: '#1E2022',
        marginBottom: 15,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    infoCardIcon: {
        padding: 12,
        borderRadius: 15,
        marginRight: 15,
    },
    infoCardTitle: {
        fontSize: width * 0.04,
        color: '#666',
        fontWeight: '500',
    },
    infoCardValue: {
        fontSize: width * 0.055,
        fontWeight: 'bold',
        color: '#1E2022',
    },
    infoCardUnit: {
        fontSize: width * 0.035,
        color: '#666',
        marginLeft: 4,
        marginBottom: 2,
    },
    calorieCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    calorieValue: {
        fontSize: width * 0.06,
        fontWeight: 'bold',
        color: '#1E2022',
        marginVertical: 8,
    },
    calorieTotal: {
        fontSize: width * 0.04,
        color: '#777',
        fontWeight: 'normal',
    },
});

export default Home;
