import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { RootStackParamList } from '../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BottomNavBar from '../components/BottomNavBar';

import { getUserData } from '../tasks/Storage';

interface WeeklyData {
    labels: string[];
    steps: number[];
}

interface ProcessedData {
    labels: string[];
    steps: number[];
}

const Statistics = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Statistics'>) => {

    const [userData, setUserData] = useState<any>(null);  // State to store the fetched user data

    const [stepData, setStepData] = useState<ProcessedData | undefined>(undefined);
    const [activeTab, setActiveTab] = useState('Statistics');

    // Fetch user data
    const fetchUserData = async () => {

        const data = await getUserData(); // Fetch all user data

        if (data) {
            console.log('User Data found:', data);
            setUserData(data); // Store user data in state
        }
    };

    const processWeeklyData = (rawData: WeeklyData): ProcessedData => {
        const fullWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const stepsByDay: Record<string, number> = {};
    
        // Ensure rawData has labels and steps before proceeding
        if (!rawData.labels || !rawData.steps) {
            console.error("Missing labels or steps in the data.");
            return {
                labels: fullWeek,
                steps: new Array(7).fill(0), // Default to 0 steps for each day
            };
        }
    
        rawData.labels.forEach((day, index) => {
            stepsByDay[day] = rawData.steps[index];
        });
    
        const processedSteps = fullWeek.map((day) => stepsByDay[day] || 0);
    
        return {
            labels: fullWeek,
            steps: processedSteps,
        };
    };

    useEffect(() => {
        // First fetch user data
        fetchUserData();
    }, []);
    

    useEffect(() => {
        // Fetch weekly data once user data is available
        const fetchWeeklyData = async () => {
          if (!userData?.user_id) {
            console.error('User ID is missing!');
            return;
          }
    
          try {
            console.log("Fetching weekly data for user ID:", userData.user_id);
            const response = await fetch(
              `https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/weekly-steps?id=${userData.user_id}`
            );
            const rawData: WeeklyData = await response.json(); // Cast the response data
            console.log('rawData: ', rawData);
    
            const processedData = processWeeklyData(rawData);
            setStepData(processedData);
          } catch (error) {
            console.error('Error fetching weekly data:', error);
          }
        };
    
        if (userData) {
          fetchWeeklyData(); // Fetch weekly data once user data is available
        }
    }, [userData]); // Triggered when userData changes

    const calculateAverageSteps = (steps: number[]): number => {
        const totalSteps = steps.reduce((acc, curr) => acc + curr, 0);
        return totalSteps / steps.length;
    };

    if (!stepData) {
        return (
            <SafeAreaView style={[{ justifyContent: 'center', flex: 1, padding: 10, backgroundColor: '#2B2B2B' }]}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={{ color: "white", textAlign: 'center', marginTop: 10 }}>
                    Loading...
                </Text>
            </SafeAreaView>
        );
    }

    const averageSteps = calculateAverageSteps(stepData.steps);

    

    return (
        <SafeAreaView style={styles.safeArea}>
            <Text style={styles.title}>YOUR STATISTICS</Text>
            <View style={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Step Count</Text>
                    <Text style={styles.averageText}>AVERAGE</Text>
                    <Text style={styles.highlightText}>{averageSteps.toFixed(0)} Steps</Text>
                    <BarChart
                        data={{
                            labels: stepData.labels, // Full week labels
                            datasets: [{ data: stepData.steps }], // Full week steps
                        }}
                        width={Dimensions.get('window').width - 30}
                        height={210}
                        chartConfig={{
                            backgroundGradientFrom: '#2E2C2C',
                            backgroundGradientTo: '#1F1F1F',
                            color: (opacity = 1) => `rgba(255, 153, 51, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            barPercentage: 0.7,
                            formatYLabel: (yLabel) => parseInt(yLabel).toString(),
                        }}
                        style={styles.chart}
                        yAxisLabel=""
                        yAxisSuffix=""
                    />
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

const chartConfig = {
    backgroundGradientFrom: '#2E2C2C',
    backgroundGradientTo: '#1F1F1F',
    color: (opacity = 1) => `rgba(255, 153, 51, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    formatYLabel: (yLabel: string) => parseInt(yLabel).toString(),
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#2B2B2B' },
  container: { flex: 1, padding: 10 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, marginTop: 15 },
  card: { backgroundColor: '#3A3A3A', padding: 5, borderRadius: 10, marginBottom:'auto', marginTop:'auto' },
  BottomCard: { backgroundColor: '#3A3A3A', padding: 5, borderRadius: 10, marginBottom: 100 },
  cardTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  chart: { borderRadius: 10, marginTop: 10, marginRight:0, marginLeft:0 },
  text: { color: '#BBBBBB', fontSize: 14, marginTop: 5 },
  highlightText: { color: '#FF9933', fontSize: 16, fontWeight: 'bold' },
  averageText: { color: '#BBBBBB', fontSize: 12, marginTop: 5 },
  subtitle: { color: '#BBBBBB', fontSize: 12, marginTop: 5 },
});

export default Statistics;
