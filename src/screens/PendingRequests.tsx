import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    FlatList,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { useUser } from "../contexts/UserContext";
import BottomNavBar from "../components/BottomNavBar";

const { width, height } = Dimensions.get("window");
const calculatePercentage = (percentage: number, dimension: number) =>
    (percentage / 100) * dimension;

const PendingRequests = ({ navigation }: NativeStackScreenProps<RootStackParamList, "PendingRequests">) => {
    const [activeTab, setActiveTab] = useState('PendingRequests');
    const { user } = useUser();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);

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
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const renderRequestCard = ({ item, index }: { item: any; index: number }) => {
        const handleResponse = async (status: string) => {
            try {
                const response = await fetch(`https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/respond-request?id=${item.friendship_id}&status=${status}`, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
    
                const result = await response.json();
    
                if (response.ok) {
                    console.log(`Friend request ${status} successfully!`, result);
                    // Optionally refresh the pending requests list
                    fetchPendingRequests();
                } else {
                    console.error("Error responding to request:", result.detail || "Unknown error");
                }
            } catch (error) {
                console.error("Error responding to request:", error);
            }
        };
    
        return (
            <View style={styles.card}>
                <Text style={styles.cardText}>{index + 1}</Text>
                <Text style={styles.cardText}>{item.requester_name}</Text>
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        onPress={() => handleResponse("accepted")}
                        style={styles.acceptButton}
                    >
                        <Text style={styles.actionText}>✔</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleResponse("rejected")}
                        style={styles.rejectButton}
                    >
                        <Text style={styles.actionText}>✖</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };
    

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topbar}>
                <Text style={[styles.title, { textAlign: "center", padding: 10 }]} onPress={()=> navigation.navigate("Home")}>
                    Pending Friend Requests
                </Text>
            </View>
            <View style={styles.containerBody}>
                {loading ? (
                    <View>
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text style={{ color: "white", textAlign: 'center', marginTop: 10 }}>
                            Loading...
                        </Text>
                    </View>
                ) : pendingRequests.length > 0 ? (
                    <FlatList
                        data={pendingRequests}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderRequestCard}
                    />
                ) : (
                    <Text style={styles.noDataText}>No pending requests found.</Text>
                )}
            </View>
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
    },
    containerBody: {
        paddingHorizontal: calculatePercentage(3, width),
        flex: 1,
    },
    topbar: {
        height: calculatePercentage(12.5, height),
        justifyContent: "center",
        marginBottom: calculatePercentage(4, height),
        backgroundColor: "#3C3D37",
    },
    title: {
        color: "white",
        fontSize: calculatePercentage(6, width),
        fontWeight: "bold",
    },
    card: {
        backgroundColor: "#2c2c2e",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: calculatePercentage(2.5, width),
        borderRadius: 10,
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

export default PendingRequests;
