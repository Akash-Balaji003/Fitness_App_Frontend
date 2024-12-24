import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Circle } from "react-native-svg";

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
  const size = 150; // Diameter of the circle
  const strokeWidth = 10; // Thickness of the progress bar
  const radius = (size - strokeWidth) / 2; // Radius of the circle
  const circumference = 2 * Math.PI * radius; // Circumference of the circle
  const progress = Math.min(stepCount / stepGoal, 1); // Normalize progress to a max of 1
  const offset = circumference * (1 - progress); // Calculate the stroke-dashoffset

  // Get the interpolated color based on progress
  const strokeColor = interpolateColor(progress);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="black"
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
    marginTop: 20,
    marginBottom: 20,
  },
  centerContent: {
    position: "absolute", // Overlay text on top of the SVG
    justifyContent: "center",
    alignItems: "center",
  },
  stepCountText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4caf50",
  },
  stepGoalText: {
    fontSize: 14,
    color: "#757575",
  },
});

export default StepProgressCircle;
