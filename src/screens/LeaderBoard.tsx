import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { RootStackParamList } from "../App";
import BottomNavBar from "../components/BottomNavBar";
import { useUser } from "../contexts/UserContext";
import LinearGradient from "react-native-linear-gradient";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get("window");

type LeaderboardEntry = {
  step_count: number;
  user_id: number;
  username: string;
};

// --- Reusable component for list items ---
const LeaderboardItem = ({ item, index, isCurrentUser }: { item: LeaderboardEntry, index: number, isCurrentUser: boolean }) => (
    <View style={[styles.itemContainer, isCurrentUser && styles.currentUserItem]}>
        <Text style={[styles.itemRank, isCurrentUser && { color: '#fff' }]}>{index + 1}</Text>
        <Image 
            source={{ uri: `https://i.pravatar.cc/150?u=${item.user_id}` }} 
            style={styles.itemProfilePic}
        />
        <View style={styles.itemDetails}>
            <Text style={[styles.itemName, isCurrentUser && { color: '#fff' }]}>{item.username}</Text>
        </View>
        <Text style={[styles.itemSteps, isCurrentUser && { color: '#fff' }]}>{item.step_count.toLocaleString()} steps</Text>
    </View>
);

const LeaderBoard = ({ navigation }: NativeStackScreenProps<RootStackParamList, "LeaderBoard">) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("LeaderBoard");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('Daily'); // 'Daily', 'Weekly', 'Monthly'

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      // You can modify the endpoint based on the timeFilter state in a real app
      const response = await fetch(
        `http://172.16.0.60:8002get-leaderboard?id=${user?.user_id}&filter=${timeFilter.toLowerCase()}`
      );
      const data: LeaderboardEntry[] = await response.json();
      const sortedData = data.sort((a, b) => b.step_count - a.step_count);
      setLeaderboardData(sortedData);
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.user_id) {
        fetchLeaderboardData();
    }
  }, [timeFilter, user]); // Refetch when filter or user changes

  const topThree = leaderboardData.slice(0, 3);
  const others = leaderboardData.slice(3);

  const renderPodium = () => {
    const podiumOrder = [1, 0, 2]; // Index order for visual layout: 2nd, 1st, 3rd
    return (
        <View style={styles.podiumContainer}>
            {podiumOrder.map(index => {
                const player = topThree[index];
                if (!player) return <View key={index} style={styles.podiumPillar} />;

                const isFirst = index === 0;
                const isSecond = index === 1;

                return (
                    <View key={player.user_id} style={[styles.podiumPillar, isFirst && styles.podiumPillarFirst]}>
                        <Image 
                            source={{ uri: `https://i.pravatar.cc/150?u=${player.user_id}` }} 
                            style={[styles.podiumProfilePic, isFirst && styles.podiumProfilePicFirst]}
                        />
                        <Text style={styles.podiumName} numberOfLines={1}>{player.username}</Text>
                        <Text style={styles.podiumSteps}>{player.step_count.toLocaleString()}</Text>
                        <View style={[styles.podiumMedal, isFirst ? styles.medalFirst : isSecond ? styles.medalSecond : styles.medalThird]}>
                            <MaterialCommunityIcons name="medal" size={24} color="#fff" />
                        </View>
                    </View>
                );
            })}
        </View>
    );
  };

  return (
    <View style={{flex: 1}}>
        <LinearGradient colors={['#ffffff', '#D9F8FB']} style={styles.container}>
            <Text style={styles.title}>Leaderboard</Text>

            {/* --- Filter Tabs --- */}
            <View style={styles.filterContainer}>
                {['Daily', 'Weekly', 'Monthly'].map(filter => (
                    <TouchableOpacity key={filter} onPress={() => setTimeFilter(filter)} style={[styles.filterButton, timeFilter === filter && styles.filterButtonActive]}>
                        <Text style={[styles.filterText, timeFilter === filter && styles.filterTextActive]}>{filter}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#114D5B" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {renderPodium()}
                    {leaderboardData.slice(3).map((item, index) => (
                        <LeaderboardItem 
                            key={item.user_id}
                            item={item} 
                            index={index + 3} 
                            isCurrentUser={item.user_id === Number(user?.user_id)}
                        />
                    ))}
                </ScrollView>
            )}
        </LinearGradient>
        <BottomNavBar
            navigation={navigation}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.05,
  },
  scrollContent: {
    paddingBottom: 90, // Added padding to ensure last item is not hidden by the nav bar
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: "bold",
    color: "#114D5B",
    textAlign: "center",
    marginVertical: height * 0.02,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 77, 91, 0.1)',
    borderRadius: 25,
    padding: 5,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: '#114D5B',
    shadowColor: "#114D5B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  filterText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#114D5B',
  },
  filterTextActive: {
    color: '#fff',
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: height * 0.25,
    marginBottom: 20,
  },
  podiumPillar: {
    alignItems: 'center',
    width: width * 0.28,
  },
  podiumPillarFirst: {
    height: '90%',
  },
  podiumProfilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#C0C0C0',
    marginBottom: 8,
  },
  podiumProfilePicFirst: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: '#FFD700',
  },
  podiumName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  podiumSteps: {
    fontSize: 12,
    color: '#666',
  },
  podiumMedal: {
    position: 'absolute',
    bottom: -10,
    right: 15,
    padding: 4,
    borderRadius: 15,
  },
  medalFirst: { backgroundColor: '#FFD700' },
  medalSecond: { backgroundColor: '#C0C0C0' },
  medalThird: { backgroundColor: '#CD7F32' },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUserItem: {
    backgroundColor: '#114D5B',
  },
  itemRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#777',
    width: 30,
  },
  itemProfilePic: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginHorizontal: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemSteps: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#114D5B',
  },
});

export default LeaderBoard;