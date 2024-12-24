import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import BottomNavBar from "../components/BottomNavBar";
import { useUser } from '../contexts/UserContext';

const { width, height } = Dimensions.get("window");

// Helper function for percentage calculation
const calculatePercentage = (percentage: number, dimension: number) => (percentage / 100) * dimension;

const Friends = ({ navigation }: NativeStackScreenProps<RootStackParamList, "Friends">) => {
    const [activeTab, setActiveTab] = useState("Friends");

    // Access the user context
    const { user } = useUser();

    const [friends, setFriends] = useState([]); // State to store friends list
    const [pendingRequests, setPendingRequests] = useState([]); // State to store fetched requests
    const [loadingPending, setLoadingPending] = useState(true); // Loading for pending requests
    const [loadingFriends, setLoadingFriends] = useState(true); // Loading for friends

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
            const data = await response.json();
            console.log("Fetched friends list:", data); // Debugging
            setFriends(data || []);
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
            const response = await fetch(`https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/respond-request?id=${friendship_id}&status=${status}`, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const result = await response.json();

            if (response.ok) {
                console.log(`Friend request ${status} successfully!`, result);
                fetchPendingRequests(); // Refresh the list after responding
            } else {
                console.error("Error responding to request:", result.detail || "Unknown error");
            }
        } catch (error) {
            console.error("Error responding to request:", error);
        }
    };

    // Render a single friend card
    const renderFriendCard = ({ item, index }: { item: any; index: number }) => (
        <View style={[styles.card, {justifyContent:"space-between",}]}>
            <View style={{flexDirection:"row", justifyContent:"space-between", width:"35%"}}>
                <Text style={styles.cardText}>{index + 1}</Text>
                <Text style={styles.cardText}>{item.username}</Text>
            </View>
            <TouchableOpacity
                onPress={() => handleResponse(item.friendship_id, "rejected")}
                style={styles.rejectButton}
            >
                <Text style={styles.actionText}>✖</Text>
            </TouchableOpacity>
        </View>
    );

    // Render a single request card
    const renderRequestCard = ({ item, index }: { item: any; index: number }) => (
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

    console.log("Friends Data:", friends);
    console.log("Pending Requests Data:", pendingRequests);


  return (
    <SafeAreaView style={styles.container}>
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

        {/* Content */}
        <View style={styles.contentContainer}>
            {activeTab === "Friends" ? (
                loadingFriends ? (
                    <ActivityIndicator size="large" color="#007BFF" />
                ) : friends.length === 0 ? (
                    <Text style={styles.emptyText}>No friends added yet.</Text>
                ) : (
                    <FlatList
                        data={friends}
                        renderItem={renderFriendCard}
                        keyExtractor={(item) => item.user_id.toString()}
                    />
                )
            ) : loadingPending ? (
                <ActivityIndicator size="large" color="#007BFF" />
            ) : pendingRequests.length === 0 ? (
                <Text style={styles.emptyText}>No pending requests.</Text>
            ) : (
                <FlatList
                    data={pendingRequests}
                    renderItem={renderRequestCard}
                    keyExtractor={(item) => item.friendship_id.toString()}
                />
            )}
        </View>

      {/* Bottom Navigation Bar */}
      <BottomNavBar navigation={navigation} activeTab="Friends" setActiveTab={setActiveTab} />
    </SafeAreaView>
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
    color: "white",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#333",
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal:10
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: "#555",
    borderRadius: 8,
  },
  tabText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  activeTabText: {
    color: "#ffd700",
  },
  contentContainer: {
    flex: 1,
  },
  sectionItem: {
    backgroundColor: "#e0f7fa",
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
    backgroundColor: "#2c2c2e",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: calculatePercentage(2.5, width),
    borderRadius: 10,
    paddingBottom: calculatePercentage(3.5, width),
    marginBottom: calculatePercentage(2, height),
    paddingHorizontal: calculatePercentage(5, width),
},
cardText: {
    color: "white",
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