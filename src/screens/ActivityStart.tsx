import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import BottomNavBar from "../components/BottomNavBar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

type ActivityStartProps = NativeStackScreenProps<RootStackParamList, "ActivityStart">;

const { width, height } = Dimensions.get("window");
const calculatePercentage = (percentage: number, dimension: number) =>
  (percentage / 100) * dimension;

const ActivityStart: React.FC<ActivityStartProps> = ({ navigation }) => {
  const [activity, setActivity] = useState("WALKING");
  const [steps, setSteps] = useState(1500); // Sample value
  const [duration, setDuration] = useState(0); // Timer in seconds
  const [calories, setCalories] = useState(120); // Sample calories
  const [distance, setDistance] = useState(3.5); // Sample distance in km
  const [isPlaying, setIsPlaying] = useState(false);

  const rotation = useRef(new Animated.Value(0)).current;

  // Timer management
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isPlaying) {
      timer = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else if (!isPlaying && timer) {
      clearInterval(timer);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  // Animation for the circular loader bead
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 4000, // Adjust speed (e.g., one full rotation in 4 seconds)
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotation.stopAnimation(); // Pause animation
    }
  }, [isPlaying, rotation]);

  // Convert seconds to "HH:MM:SS"
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle activity switching
  const handleArrowPress = (direction: string) => {
    const activities = ["WALKING", "RUNNING", "CYCLING"];
    const currentIndex = activities.indexOf(activity);
    const nextIndex =
      direction === "left"
        ? (currentIndex - 1 + activities.length) % activities.length
        : (currentIndex + 1) % activities.length;
    setActivity(activities[nextIndex]);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setDuration(0); // Reset timer
    rotation.setValue(0); // Reset animation
  };

  const rotateInterpolation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Title Section */}
      <View style={styles.titleContainer}>
        <TouchableOpacity onPress={() => handleArrowPress("left")}>
          <Entypo name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>{activity}</Text>
        <TouchableOpacity onPress={() => handleArrowPress("right")}>
          <Entypo name="arrow-right" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Info Containers */}
      <View style={styles.infoContainer}>
        <View style={styles.rectContainer}>
          <Text style={styles.infoValue}>{steps}</Text>
          <Text style={styles.infoLabel}>Steps</Text>
          <Ionicons name="footsteps" size={24} color="white" />
        </View>
        <View style={styles.squareContainer}>
          <Text style={styles.infoValue}>{formatTime(duration)}</Text>
          <Text style={styles.infoLabel}>Duration</Text>
          <FontAwesome name="clock-o" size={24} color="white" />
        </View>
        <View style={styles.rectContainer}>
          <Text style={styles.infoValue}>{calories}</Text>
          <Text style={styles.infoLabel}>kcal</Text>
          <MaterialCommunityIcons name="fire" size={24} color="white" />
        </View>
      </View>

      {/* Distance Widget with Circular Animation */}
      <View style={styles.distanceWidget}>
        <View style={styles.circularLoader}>
          <Text style={styles.distanceValue}>{distance.toFixed(1)} km</Text>
          <Animated.View
            style={[
              styles.circularBead,
              {
                transform: [
                  { rotate: rotateInterpolation },
                  { translateX: calculatePercentage(29, width) },
                ],
              },
            ]}
          />
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.playPauseButton}
          onPress={handlePlayPause}>
          <FontAwesome
            name={isPlaying ? "pause" : "play"}
            size={40}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
          <FontAwesome name="stop" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        navigation={navigation}
        activeTab="ActivityStart"
        setActiveTab={() => {}}
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
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: calculatePercentage(3, height),
  },
  title: {
    color: "white",
    fontSize: calculatePercentage(6, width),
    fontWeight: "bold",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: calculatePercentage(4, height),
  },
  rectContainer: {
    backgroundColor: "#2c2c2e",
    padding: calculatePercentage(4, width),
    borderRadius: 10,
    alignItems: "center",
    width: "28%",
  },
  squareContainer: {
    backgroundColor: "#2c2c2e",
    padding: calculatePercentage(4, width),
    borderRadius: 10,
    alignItems: "center",
    width: "40%",
  },
  infoLabel: {
    color: "white",
    fontSize: calculatePercentage(3, width),
    marginTop: calculatePercentage(1, height),
    marginBottom: calculatePercentage(1, height),
  },
  infoValue: {
    color: "#E37D00",
    fontWeight: "bold",
    fontSize: calculatePercentage(8, width),
    marginTop: calculatePercentage(0.5, height),
  },
  distanceWidget: {
    alignItems: "center",
    marginTop: calculatePercentage(3, height),
    marginBottom: calculatePercentage(4, height),
  },
  circularLoader: {
    width: calculatePercentage(60, width),
    height: calculatePercentage(60, width),
    borderRadius: calculatePercentage(30, width),
    borderWidth: 8,
    borderColor: "#E37D00",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  distanceValue: {
    color: "white",
    fontSize: calculatePercentage(8, width),
    fontWeight: "bold",
  },
  circularBead: {
    width: 20,
    height: 20,
    backgroundColor: "#E37D00",
    borderRadius: 10,
    position: "absolute",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: calculatePercentage(4, height),
  },
  playPauseButton: {
    backgroundColor: "#E37D00",
    padding: calculatePercentage(6, width),
    marginRight: 20,
    borderRadius: 50,
  },
  stopButton: {
    marginTop: 18,
    backgroundColor: "black",
    padding: calculatePercentage(3, width),
    borderRadius: 50,
    height: 50,
  },
});

export default ActivityStart;
