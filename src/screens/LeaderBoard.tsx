import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { RootStackParamList } from "../App";
import BottomNavBar from "../components/BottomNavBar";
import { useUser } from "../contexts/UserContext";
import LinearGradient from "react-native-linear-gradient";

const { width } = Dimensions.get("window");

type LeaderboardEntry = {
  step_count: number;
  user_id: number;
  username: string;
};

const LeaderBoard = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "LeaderBoard">) => {
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState("LeaderBoard");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboardData = async () => {
    try {
      const response = await fetch(
        `https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/get-leaderboard?id=${user?.user_id}`
      );
      const data: LeaderboardEntry[] = await response.json();
      // Sort the data by step_count in descending order
      const sortedData = data.sort((a, b) => b.step_count - a.step_count);
      setLeaderboardData(sortedData);
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const renderItem = (item: LeaderboardEntry, index: number) => (
    <View key={`others-${item.user_id}-${index}`} style={[styles.itemContainer]}>
      <Text style={styles.positionList}>{index + 4}</Text>
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.username}</Text>
        <Text style={styles.kcal}>{item.step_count} steps</Text>
      </View>
    </View>
  );

  const topThree = leaderboardData.slice(0, 3);
  const others = leaderboardData.slice(3);

  if (loading) {
    return (
      <LinearGradient
          colors={['#ffffff', '#B1F0F7']} // White to #0095B7 gradient
          style={styles.loadingContainer}
          start={{ x: 0, y: 0 }} // Gradient direction (top-left)
          end={{ x: 1, y: 1 }} // Gradient direction (bottom-right)
      >
        <ActivityIndicator size="large" color="blue" />
        <Text style={styles.loadingText}>Loading...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
                  colors={['#ffffff', '#B1F0F7']} // White to #0095B7 gradient
                  style={styles.container}
                  start={{ x: 0, y: 0 }} // Gradient direction (top-left)
                  end={{ x: 1, y: 1 }} // Gradient direction (bottom-right)
              >
      <Text style={styles.title}>LEADER BOARDS</Text>

      {/* Top Three Display */}
      <View style={styles.topThreeContainer}>
        {topThree.map((item, index) => (
          <View key={`top-${item.user_id}-${index}`}>
            <View
              style={[
                styles.circleContainer,
                index === 0 && styles.firstPlaceCircle,
                index === 1 && styles.secondPlaceCircle,
                index === 2 && styles.thirdPlaceCircle,
              ]}
            >
              <Text style={styles.crownIcon}>{index === 0 ? "👑" : ""}</Text>
              <Text style={styles.stepCountText}>{item.step_count}</Text>
            </View>
            <Text style={[styles.positionListTop, { textAlign: "center" }]}>
              {item.username}
            </Text>
          </View>
        ))}
      </View>


        {/* Others List */}
        <ScrollView style={styles.listContent}>
            {others.map((item, index) => renderItem(item, index))}
        </ScrollView>

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
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "black",
    textAlign: "center",
    marginBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "black",
    textAlign: "center",
    marginTop: 10,
  },
  topThreeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  circleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  firstPlaceCircle: {
    backgroundColor: "#FFD700",
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  secondPlaceCircle: {
    backgroundColor: "#C0C0C0",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  thirdPlaceCircle: {
    backgroundColor: "#CD7F32",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  crownIcon: {
    fontSize: 22,
    color: "gold",
    position: "absolute",
    top: -25,
  },
  stepCountText: {
    color: "black",
    fontSize: 18,
    fontWeight: "600",
  },
  nameLarge: {
    color: "black",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
    maxWidth: 80,
  },
  listContent: {
    marginBottom: 90, // Space for the BottomNavBar
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#EAF8FF",
    borderRadius: 15,
    marginVertical: 8,
    elevation:3,
    marginLeft:2,
    marginRight:2
  },
  positionList: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 14,
  },
  positionListTop: {
    color: "black",
    fontSize: 18,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    color: "black",
    fontSize: 14,
    fontWeight: "500",
  },
  kcal: {
    color: "#A1A1A1",
    fontSize: 14,
    fontWeight: "400",
  },
});

export default LeaderBoard;
