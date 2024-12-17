import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { RootStackParamList } from '../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BottomNavBar from '../components/BottomNavBar';

type StepData = {
    stepCountDateRange: string;
    stepCountData: number[];
    todaySteps: number;
    averageSteps: number;
    calorieBurntData: number[];
};

const Statistics = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Statistics'>) => {
    const [stepData, setStepData] = useState<StepData | undefined>(undefined);
    const [activeTab, setActiveTab] = useState('Statistics');


  useEffect(() => {
    const fetchData = async () => {
      const dataFromDatabase = {
        stepCountDateRange: '1–7 Dec 2024',
        stepCountData: [1000, 2000, 3000, 5000, 4000, 3000, 2000],
        todaySteps: 1567,
        averageSteps: 4222,
        calorieBurntData: [1700, 1500, 800],
      };
      setStepData(dataFromDatabase);
    };

    fetchData();
  }, []);

  if (!stepData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>YOUR STATISTICS</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Step Count</Text>
          <Text style={styles.averageText}>AVERAGE</Text>
          <Text style={styles.highlightText}>3,000 Steps</Text>
          <Text style={styles.subtitle}>{stepData.stepCountDateRange}</Text>
          <BarChart
            data={{
              labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
              datasets: [{ data: stepData.stepCountData }],
            }}
            width={Dimensions.get('window').width - 30}
            height={210}
            chartConfig={{
                backgroundGradientFrom: '#2E2C2C',
                backgroundGradientTo: '#1F1F1F',
                color: (opacity = 1) => `rgba(255, 153, 51, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                barPercentage: 0.7, // Adjust bar width
                formatYLabel: (yLabel) => parseInt(yLabel).toString(), // Remove .00 on Y labels
            }}
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix=" k"
          />
        </View>

        <View style={[styles.card, { paddingBottom: 20 }]}>
          <Text style={styles.cardTitle}>Steps</Text>
          <Text style={styles.text}>You're not walking as much as you normally would.</Text>
          <LineChart
            data={{
              labels: ['12 AM', '6 AM', '12 PM', '6 PM', '10 PM'],
              datasets: [{ data: [0, 1500, 2000, 4000, 1600] }],
            }}
            width={Dimensions.get('window').width - 30}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
          />
          <Text style={styles.text}>Today: <Text style={styles.highlightText}>{stepData.todaySteps} steps</Text></Text>
          <Text style={styles.text}>Average: <Text style={styles.highlightText}>{stepData.averageSteps} steps</Text></Text>
        </View>

        <View style={styles.BottomCard}>
          <Text style={styles.cardTitle}>Calorie Burnt</Text>
          <Text style={styles.subtitle}>DECEMBER 2024</Text>
          <BarChart
            data={{
                labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                datasets: [{ data: stepData.stepCountData }],
            }}
            width={Dimensions.get('window').width - 30}
            height={220}
            chartConfig={{
                backgroundGradientFrom: '#2E2C2C',
                backgroundGradientTo: '#1F1F1F',
                color: (opacity = 1) => `rgba(255, 153, 51, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                barPercentage: 0.7, // Adjust bar width
                formatYLabel: (yLabel) => parseInt(yLabel).toString(), // Remove .00 on Y labels
            }}
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix=""
            />
        </View>
      </ScrollView>
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
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#3A3A3A', padding: 5, borderRadius: 10, marginBottom: 20 },
  BottomCard: { backgroundColor: '#3A3A3A', padding: 5, borderRadius: 10, marginBottom: 100 },
  cardTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  chart: { borderRadius: 10, marginTop: 10, marginRight:0, marginLeft:0 },
  text: { color: '#BBBBBB', fontSize: 14, marginTop: 5 },
  highlightText: { color: '#FF9933', fontSize: 16, fontWeight: 'bold' },
  averageText: { color: '#BBBBBB', fontSize: 12, marginTop: 5 },
  subtitle: { color: '#BBBBBB', fontSize: 12, marginTop: 5 },
});

export default Statistics;
