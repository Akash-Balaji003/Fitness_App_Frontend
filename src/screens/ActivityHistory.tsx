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
import BottomNavBar from "../components/BottomNavBar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { useUser } from "../contexts/UserContext";

const { width, height } = Dimensions.get("window");
const calculatePercentage = (percentage: number, dimension: number) =>
    (percentage / 100) * dimension;

const ActivityHistory = ({ navigation }: NativeStackScreenProps<RootStackParamList, "ActivityHistory">) => {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState("ActivityTimer");
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await fetch(`https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/fetch-activities?id=${user?.user_id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const data = await response.json();
                console.log("Fetched data:", data); // Debugging
                setActivities(data || []); // Use the data directly since it's already an array
            } catch (error) {
                console.error("Error fetching activities:", error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchActivities();
    }, []);

    const formatDuration = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins
            .toString()
            .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };
    
    

    const renderActivityCard = ({ item, index }: { item: any; index: number }) => (
        <View style={styles.card}>
            <Text style={styles.cardText}>{index + 1}</Text>
            <Text style={styles.cardText}>{item.activity}</Text>
            <Text style={styles.cardText}>{formatDuration(item.duration)}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topbar}>
                <Text style={[styles.title, { textAlign: "center", padding: 10 }]}>
                    Activity Tracker
                </Text>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        paddingHorizontal: calculatePercentage(2, width),
                        gap: 2,
                    }}
                >
                    <TouchableOpacity
                        style={[
                            styles.activeNavbarButton,
                            { backgroundColor: "#2c2c2e" },
                        ]}
                        onPress={() => navigation.navigate("ActivityTimer")}
                    >
                        <Text
                            style={[
                                {
                                    textAlign: "center",
                                    color: "white",
                                    fontSize: calculatePercentage(6, width),
                                },
                            ]}
                        >
                            Timer
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.navbarButton]}>
                        <Text
                            style={[
                                {
                                    textAlign: "center",
                                    color: "white",
                                    fontSize: calculatePercentage(6, width),
                                },
                            ]}
                        >
                            History
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.containerBody}>
                <View style={{flexDirection:"row", padding: calculatePercentage(2.5, width), justifyContent:"space-around"}}>
                    <Text style={styles.cardTitle}>Sn.No</Text>
                    <Text style={[styles.cardTitle, {marginRight:calculatePercentage(12, width)}]}>Activity</Text>
                    <Text style={[styles.cardTitle, {marginRight:calculatePercentage(8, width)}]}>Time</Text>
                </View>
                {loading ? (
                    <View>
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text style={{ color: "white", textAlign: 'center', marginTop: 10 }}>
                            Loading...
                        </Text>
                    </View>
                    
                ) : activities.length > 0 ? (
                    <FlatList
                        data={activities}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderActivityCard}
                    />
                ) : (
                    <Text style={styles.noDataText}>No activities found.</Text>
                )}
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
    navbarButton: {
        backgroundColor: "#1c1c1e",
        height: calculatePercentage(6, height),
        width: "49%",
        justifyContent: "center",
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5,
    },
    activeNavbarButton: {
        backgroundColor: "#1c1c1e",
        height: calculatePercentage(6, height),
        width: "49%",
        justifyContent: "center",
        borderRadius: 5,
    },
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
        justifyContent: "space-between",
        marginBottom: calculatePercentage(4, height),
        backgroundColor: "#3C3D37",
    },
    title: {
        color: "white",
        fontSize: calculatePercentage(6, width),
        fontWeight: "bold",
    },
    infoLabel: {
        color: "white",
        fontSize: calculatePercentage(3, width),
        marginTop: calculatePercentage(1, height),
        marginBottom: calculatePercentage(1, height),
    },
    loadingText: {
        color: "white",
        fontSize: calculatePercentage(3, width),
        textAlign: "center",
        marginTop: calculatePercentage(5, height),
    },
    noDataText: {
        color: "gray",
        fontSize: calculatePercentage(3, width),
        textAlign: "center",
        marginTop: calculatePercentage(5, height),
    },
    card: {
        backgroundColor: "#2c2c2e",
        flexDirection:"row",
        justifyContent:"space-around",
        padding: calculatePercentage(2.5, width),
        borderRadius: 10,
        marginBottom: calculatePercentage(2, height),
    },
    cardText: {
        color: "white",
        fontSize: calculatePercentage(3.5, width),
        marginBottom: 5,
    },
    cardTitle: {
        color: "white",
        fontSize: calculatePercentage(5, width),
        marginBottom: 5,
        marginRight:calculatePercentage(6, width),
    },
});

export default ActivityHistory;
