import React from "react";
import { View, Text, StyleSheet, Dimensions, SafeAreaView, ActivityIndicator } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useUser } from "../contexts/UserContext";

const { width } = Dimensions.get("screen");

interface StepProgressCircleProps {
  stepCount: number; // Number of steps taken
  stepGoal: number;  // Step goal to reach
}

// Helper function to interpolate colors
const interpolateColor = (progress: number): string => {
  if (progress <= 1 / 3) {
    // Blend from red to orange
    const ratio = progress / (1 / 3);
    const r = Math.round(255 + ratio * (255 - 255)); // R stays the same
    const g = Math.round(0 + ratio * 165); // G increases
    const b = Math.round(0); // B stays the same
    return `rgb(${r},${g},${b})`;
  } else if (progress <= 2 / 3) {
    // Blend from orange to green
    const ratio = (progress - 1 / 3) / (1 / 3);
    const r = Math.round(255 - ratio * 255); // R decreases
    const g = Math.round(165 + ratio * (255 - 165)); // G increases
    const b = Math.round(0); // B stays the same
    return `rgb(${r},${g},${b})`;
  } else {
    // Full green
    return "rgb(0,255,0)";
  }
};

const StepProgressCircle: React.FC<StepProgressCircleProps> = ({ stepCount, stepGoal }) => {

  const { user, setUser } = useUser();
  
  const size = 200; // Diameter of the circle
  const strokeWidth = 10; // Thickness of the progress bar
  const radius = (size - strokeWidth) / 2; // Radius of the circle
  const circumference = 2 * Math.PI * radius; // Circumference of the circle
  const progress = Math.min(stepCount / stepGoal, 1); // Normalize progress to a max of 1
  const offset = circumference * (1 - progress); // Calculate the stroke-dashoffset

  // Get the interpolated color based on progress
  const strokeColor = interpolateColor(progress);

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
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#696969"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference.toString()} // Total length of the circle
          strokeDashoffset={offset.toString()} // Offset based on progress
          strokeLinecap="round"
        />
      </Svg>
      {/* Centered Text */}
      <View style={styles.centerContent}>
        <Text style={[styles.stepGoalText, {fontSize:20, top:-10}]}>
          {metrics.distance.toFixed(2)} km {/* Display calculated distance */}
        </Text>
        <Text style={styles.stepCountText}>{stepCount}</Text>
        <Text style={styles.stepGoalText}>of {stepGoal} steps</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  centerContent: {
    position: "absolute", // Overlay text on top of the SVG
    justifyContent: "center",
    alignItems: "center",
  },
  stepCountText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#4caf50",
    top:-5
  },
  stepGoalText: {
    fontSize: 15,
    top:-5,
    color: "#757575",
  },
});

export default StepProgressCircle;
