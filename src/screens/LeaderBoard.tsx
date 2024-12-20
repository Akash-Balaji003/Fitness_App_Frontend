import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../App";
import BottomNavBar from "../components/BottomNavBar";

const { width } = Dimensions.get("window");

type LeaderboardEntry = {
  id: number;
  name: string;
  kcal: number;
  crown?: boolean;
  profilePic: string;
};

const LeaderBoard = ({ navigation }: NativeStackScreenProps<RootStackParamList, "LeaderBoard">) => {
  const [activeTab, setActiveTab] = useState('LeaderBoard');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data: LeaderboardEntry[] = [
        { id: 1, name: "Akash Balaji", kcal: 500, crown: true, profilePic: "https://example.com/akash.jpg" },
        { id: 2, name: "Deekshit Parathasarathy", kcal: 430, profilePic: "https://example.com/deekshit.jpg" },
        { id: 3, name: "Abishek", kcal: 425, profilePic: "https://example.com/abishek.jpg" },
        { id: 4, name: "Marsha Fisher", kcal: 420, profilePic: "https://example.com/marsha.jpg" },
        { id: 5, name: "Juanita Cormier", kcal: 410, profilePic: "https://example.com/juanita.jpg" },
        { id: 6, name: "You", kcal: 400, profilePic: "https://example.com/you.jpg" },
        { id: 7, name: "Tamara Schmidt", kcal: 380, profilePic: "https://example.com/tamara.jpg" },
        { id: 8, name: "Ricardo Veum", kcal: 299, profilePic: "https://example.com/ricardo.jpg" },
        { id: 9, name: "Gary Sanford", kcal: 180, profilePic: "https://example.com/gary.jpg" },
        { id: 10, name: "Becky Bartell", kcal: 100, profilePic: "https://example.com/becky.jpg" },
      ];
      setLeaderboardData(data);
    };

    fetchData();
  }, []);

  const renderItem = (item: LeaderboardEntry, index: number) => (
    <View
      key={item.id}  // Added the key prop here
      style={[
        styles.itemContainer,
        item.name === "You" && styles.highlight,
      ]}
    >
      <Text style={styles.positionList}>{index + 4}</Text>
      <Image source={{ uri: item.profilePic }} style={styles.profilePic} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
      </View>
    </View>
  );

  const topThree = leaderboardData.slice(0, 3);
  const others = leaderboardData.slice(3);

  return (
    <SafeAreaView style={styles.container}>
      {/* Title and Top Three */}
      <Text style={styles.title}>LEADER BOARDS</Text>

      {/* Render Dynamic Circles */}
        <View style={{ height: 125, width: "100%", flexDirection: "row" }}>
            {topThree.map((item, index) => (
            <View
                key={item.id}  // Added the key prop here
                style={{
                height: 200,
                width: "32%",
                justifyContent: index === 1 ? "flex-start" : "flex-end",
                marginRight: index === 1 ? 0 : index === 0 ? 0 : -15,
                marginLeft: index === 0 ? 30 : 0,
                }}
            >
                <View
                    style={[
                        styles.circle,
                        index === 1 && styles.firstPlaceCircle,
                        index === 0 && styles.secondPlaceCircle,
                        index === 2 && styles.thirdPlaceCircle,
                        index === 1 && styles.firstPlaceCircleSize,
                        (index === 0 || index === 2) && styles.otherPlaceCircleSize,
                        (index === 0 || index === 2) && styles.moveUp, // Apply moveUp to both circle and name container
                        (index === 1 ) && styles.moveRight, // Apply moveUp to both circle and name container

                    ]}
                >
                    {index === 1 && <Text style={styles.crownIcon}>👑</Text>}
                    <Image
                        source={{ uri: item.profilePic }}
                        style={index === 1 ? styles.firstPlaceProfilePic : styles.profilePicLarge}
                    />
                    <Text style={styles.position}>{index === 1 ? 1 : index === 0 ? 2 : 3}</Text>
                </View>
                <Text style={[styles.nameLarge, (index === 0 || index === 2) && styles.moveUp, styles.moveRight]} numberOfLines={1} ellipsizeMode="tail">
                {item.name}
                </Text>
        </View>
        ))}
        </View>

      {/* Static List for Others */}
      <View style={styles.listContent}>
        {others.map((item, index) => renderItem(item, index))}
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
    moveUp: {
        top: -80, // Adjust this value to make the circle move higher
    },

    moveRight: {
        right: 10, // Adjust this value to make the circle move higher
    },

  container: {
    flex: 1,
    backgroundColor: "#1c1c1e",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
    marginBottom: 30,
  },
  circleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  circle: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    position: "relative",
  },
  firstPlaceCircle: {
    backgroundColor: "#FFD700",
  },
  secondPlaceCircle: {
    backgroundColor: "#C0C0C0",
  },
  thirdPlaceCircle: {
    backgroundColor: "#CD7F32",
  },
  firstPlaceCircleSize: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  otherPlaceCircleSize: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  firstPlaceProfilePic: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profilePicLarge: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  position: {
    position: "absolute",
    bottom: -10,
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 5,
    borderRadius: 10,
  },
  nameLarge: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: 80,
  },
  kcalLarge: {
    color: "#A1A1A1",
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
  },
  crownIconLarge: {
    marginTop: 0,
    fontSize: 24,
    color: "gold",
  },
  listContent: {
    marginBottom: 90, // Adjust to add space for BottomNavBar
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#333",
    height:48,
    borderRadius: 15,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  highlight: {
    backgroundColor: "#FFB400",
  },
  profilePic: {
    width: 31,
    height: 31,
    borderRadius: 15.5,
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#FFB400",
  },
  textContainer: {
    height:45,
    justifyContent:"center"
  },
  name: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  kcal: {
    color: "#A1A1A1",
    fontSize: 16,
    fontWeight: "400",
  },
  crownIcon: {
    fontSize: 22,
    color: "gold",
    textAlign: "center",
  },
  positionList: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 14,
    paddingTop:10,
    height:45,
    justifyContent:"center"
  },
});

export default LeaderBoard;
