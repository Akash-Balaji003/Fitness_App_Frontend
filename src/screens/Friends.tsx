import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, Dimensions, ActivityIndicator, ToastAndroid, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import BottomNavBar from "../components/BottomNavBar";
import { useUser } from '../contexts/UserContext';
import SearchBar from "../components/SearchBar";
import LinearGradient from "react-native-linear-gradient";

const { width, height } = Dimensions.get("window");

// Helper function for percentage calculation
const calculatePercentage = (percentage: number, dimension: number) => (percentage / 100) * dimension;

interface Friend {
    user_id: string;
    friend_id: string;
    username: string;
    // Add other properties as needed
}

const Friends = ({ navigation }: NativeStackScreenProps<RootStackParamList, "Friends">) => {
    const [activeTab, setActiveTab] = useState("Friends");

    // Access the user context
    const { user } = useUser();

    const [friends, setFriends] = useState<Friend[]>([]); // Typing the state
    const [pendingRequests, setPendingRequests] = useState([]); // State to store fetched requests
    const [loadingPending, setLoadingPending] = useState(true); // Loading for pending requests
    const [loadingFriends, setLoadingFriends] = useState(true); // Loading for friends
    const [refreshing, setRefreshing] = useState(false); // State for pull-to-refresh

    const removeDuplicates = (array: any[], key: string | number) => {
        return array.filter((item, index, self) => 
            index === self.findIndex((t) => t[key] === item[key])
        );
    };
    
    // Function to fetch friends
    const fetchFriends = async () => {
        try {
            const response = await fetch(
                `https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/get-friends?id=${user?.user_id}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            let data = await response.json();
            console.log("Fetched friends list:", data); // Debugging
    
            // Remove duplicates based on 'user_id'
            const uniqueFriends = removeDuplicates(data, "user_id");
    
            // Update the friends state with unique values
            setFriends(uniqueFriends || []);
        } catch (error) {
            console.error("Error fetching friends list:", error);
        } finally {
            setLoadingFriends(false);
        }
    };

    // Function to fetch pending friend requests
    const fetchPendingRequests = async () => {
        try {
            const response = await fetch(`https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/get-pending-requests?id=${user?.user_id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            console.log("Fetched pending requests:", data); // Debugging
            setPendingRequests(data || []); // Use the data directly
        } catch (error) {
            console.error("Error fetching pending requests:", error);
        } finally {
            setLoadingPending(false); // Stop loading
        }
    };

    useEffect(() => {
        fetchFriends(); // Fetch friends on mount
        fetchPendingRequests(); // Fetch requests on component mount
    }, []);

    // Function to handle friend request response
    const handleResponse = async (friendship_id: number, status: string) => {
        try {
            console.log("friendship_id : ", friendship_id)
            const response = await fetch(`https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/respond-request?id=${friendship_id}&status=${status}`, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const result = await response.json();

            if (response.ok) {
                console.log(`Friend request ${status} successfully!`, result);
                fetchFriends(); // Re-fetch friends after accepting or rejecting
                fetchPendingRequests();
                ToastAndroid.show('Friendship Status Updated', ToastAndroid.SHORT);
                
            } else {
                console.error("Error responding to request:", result.detail || "Unknown error");
            }
        } catch (error) {
            console.error("Error responding to request:", error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchFriends(), fetchPendingRequests()]);
        setRefreshing(false);
    };

    // Render a single friend card
    const renderFriendCard = ({ item, index }: { item: any; index: number }) => {
    
        return (
            <View style={[styles.card, { justifyContent: "space-between" }]}>
                <View style={{ flexDirection: "row", justifyContent: "flex-start", width: "40%", gap:20 }}>
                    <Text style={styles.cardText}>{index + 1}</Text>
                    <Text style={styles.cardText}>{item.username}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => handleResponse(item.friend_id, "rejected")}
                    style={styles.rejectButton}
                >
                    <Text style={styles.actionText}>✖</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Render a single request card
    const renderRequestCard = ({ item, index }: { item: any; index: number }) => {
        console.log("Pending Data From Backend: ", item); // Log the item object to check its structure and data
    
        return (
            <View style={styles.card}>
                <Text style={styles.cardText}>{index + 1}</Text>
                <Text style={styles.cardText}>{item.requester_name}</Text>
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        onPress={() => handleResponse(item.friendship_id, "accepted")}
                        style={styles.acceptButton}
                    >
                        <Text style={styles.actionText}>✔</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleResponse(item.friendship_id, "rejected")}
                        style={styles.rejectButton}
                    >
                        <Text style={styles.actionText}>✖</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };    

    console.log("Friends Data:", friends);
    console.log("Pending Requests Data:", pendingRequests);


  return (
    <LinearGradient
              colors={['#ffffff', '#B1F0F7']} // White to #0095B7 gradient
              style={styles.container}
              start={{ x: 0, y: 0 }} // Gradient direction (top-left)
              end={{ x: 1, y: 1 }} // Gradient direction (bottom-right)
          >
        {/* Screen Title */}
        <Text style={styles.screenTitle}>Manage Your Friends</Text>

        {/* Header with Tabs */}
        <View style={styles.headerContainer}>

            <TouchableOpacity
            style={[styles.tab, activeTab === "Friends" && styles.activeTab]}
            onPress={() => setActiveTab("Friends")}
            >
                <Text style={[styles.tabText, activeTab === "Friends" && styles.activeTabText]}>Friends</Text>
            </TouchableOpacity>

            <TouchableOpacity
            style={[styles.tab, activeTab === "Pending" && styles.activeTab]}
            onPress={() => setActiveTab("Pending")}
            >
                <Text style={[styles.tabText, activeTab === "Pending" && styles.activeTabText]}>Pending</Text>
            </TouchableOpacity>
        </View>

        {/* Search Bar - Adjusted for positioning */}
        <View style={styles.searchBarContainer}>
            <SearchBar />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
            {activeTab === "Friends" ? (
                loadingFriends ? (
                <ActivityIndicator size="large" color="#007BFF" />
                ) : friends.length === 0 ? (
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
                    refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#007BFF"]}
                    />
                    }
                >
                    <Text style={styles.emptyText}>No friends added yet.</Text>
                </ScrollView>
                ) : (
                <FlatList
                    data={friends}
                    renderItem={renderFriendCard}
                    keyExtractor={(item, index) => `${item.user_id}_${index}`}
                    refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#007BFF"]}
                    />
                    }
                />
                )
            ) : loadingPending ? (
                <ActivityIndicator size="large" color="#007BFF" />
            ) : pendingRequests.length === 0 ? (
                <ScrollView
                contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
                refreshControl={
                    <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={["#007BFF"]}
                    />
                }
                >
                <Text style={styles.emptyText}>No pending requests.</Text>
                </ScrollView>
            ) : (
                <FlatList
                data={pendingRequests}
                renderItem={renderRequestCard}
                keyExtractor={(item, index) => `${item.friend_id}_${index}`}
                refreshControl={
                    <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={["#007BFF"]}
                    />
                }
                />
            )}
            </View>


        {/* Bottom Navigation Bar */}
        <BottomNavBar navigation={navigation} activeTab="Friends" setActiveTab={setActiveTab} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1c1e",
    paddingHorizontal: calculatePercentage(2, width),
    paddingTop: calculatePercentage(2, height),
  },
  screenTitle: {
    color: "black",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#B8E0E7",
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal:10,
    elevation:1
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: "#133E87",
    borderRadius: 8,
  },
  tabText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  activeTabText: {
    color: "#ffffff",
  },
  searchBarContainer: {
    position: "absolute",
    marginTop: calculatePercentage(18, height),
    width: "100%",
    zIndex:1,
    alignSelf:"center",
    marginBottom:60
},
  contentContainer: {
    flex: 1,
    marginTop: calculatePercentage(10, height),
    marginBottom:80

  },
  sectionItem: {
    backgroundColor: "#EAF8FF",
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionText: {
    fontSize: 16,
    color: "#00796b",
  },
  emptyText: {
    fontSize: 16,
    color: "#aaa",
    fontStyle: "italic",
    textAlign:"center"
  },
  card: {
    backgroundColor: "#EAF8FF",
    flexDirection: "row",
    elevation:3,
    justifyContent: "space-between",
    padding: calculatePercentage(2.5, width),
    borderRadius: 10,
    paddingBottom: calculatePercentage(3.5, width),
    marginBottom: calculatePercentage(2, height),
    paddingHorizontal: calculatePercentage(5, width),
    marginRight:2,
    marginLeft:2,
    marginTop:2
},
cardText: {
    color: "black",
    fontSize: calculatePercentage(4, width),
    paddingTop: calculatePercentage(1, height),
},
noDataText: {
    color: "gray",
    fontSize: calculatePercentage(3, width),
    textAlign: "center",
    marginTop: calculatePercentage(5, height),
},
actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginLeft: 20,
    gap:15,
},
acceptButton: {
    backgroundColor: "#4CAF50", // Green
    padding: 7,
    borderRadius: 5,
    marginRight: 5,
},
rejectButton: {
    backgroundColor: "#F44336", // Red
    padding: 7,
    borderRadius: 5,
},
actionText: {
    color: "white",
    fontSize: calculatePercentage(3.5, width),
    textAlign: "center",
},
});

export default Friends;