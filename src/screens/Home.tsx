import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import Ionicons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";
import Octicons from "react-native-vector-icons/Octicons";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { SafeAreaView } from "react-native-safe-area-context";
import BottomNavBar from "../components/BottomNavBar";

const { width, height } = Dimensions.get("window");
const calculatePercentage = (percentage: number, dimension: number) =>
  (percentage / 100) * dimension;

type HomeProps = NativeStackScreenProps<RootStackParamList, "Home">;

const Home = ({ navigation }: HomeProps) => {
    const [activeTab, setActiveTab] = useState('Home');
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome Akash,</Text>
        <TouchableOpacity onPress={() => Alert.alert("Notifications clicked")}>
            <FontAwesome name="bell-o" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.stepsSection}>
        <View style={styles.stepsCircle}>
          <Text style={styles.stepsCount}>11,200</Text>
          <Text style={styles.stepsText}>STEPS</Text>
        </View>
        <Text style={styles.distance}>5 km</Text>
        <Text style={styles.goal}>11,200 / 14,000</Text>
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
    fontSize: calculatePercentage(3, width),
    color: "white",
    opacity: 0.8,
    marginBottom: calculatePercentage(1, height),
  },
  goal: {
    fontSize: calculatePercentage(2.5, width),
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
    marginBottom: calculatePercentage(3, height),
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
