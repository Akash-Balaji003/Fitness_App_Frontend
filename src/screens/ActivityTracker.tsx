import React, { useState, useRef, useEffect } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    Animated,
    ToastAndroid,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Entypo from "react-native-vector-icons/Entypo";
import Feather from "react-native-vector-icons/Feather";
import BottomNavBar from "../components/BottomNavBar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import Svg, { Circle } from "react-native-svg";
import { useUser } from "../contexts/UserContext";
import LinearGradient from "react-native-linear-gradient";

const { width, height } = Dimensions.get("window");
const calculatePercentage = (percentage: number, dimension: number) =>
    (percentage / 100) * dimension;

const ActivityTracker = ({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'ActivityTracker'>) => {

    const { user } = useUser();
    const [refreshing, setRefreshing] = useState(false); // State for pull-to-refresh

    const [activeTab, setActiveTab] = useState('ActivityTimer');
    const AnimatedCircle = Animated.createAnimatedComponent(Circle);
    const [user_activity, setActivity] = useState("WALKING");
    const [user_duration, setDuration] = useState(0); // Timer in seconds
    const [isPlaying, setIsPlaying] = useState(false);

    const progress = useRef(new Animated.Value(0)).current; // This will control the progress

    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState([]);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchActivities()]);
        setRefreshing(false);
    };

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

    useEffect(() => {
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
            <Text style={styles.cardText}>{item.activity_date}</Text>
            <Text style={styles.cardText}>{item.activity}</Text>
            <Text style={styles.cardText}>{formatDuration(item.duration)}</Text>
        </View>
    );

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

    // Animate the strokeDashoffset based on duration
    useEffect(() => {
        if (isPlaying) {
            // Animate progress based on time
            Animated.timing(progress, {
                toValue:  user_duration/60, // Adjust the duration limit as needed (e.g., 300 seconds for 5 minutes)
                duration: 1000, // Update every second
                useNativeDriver: false,
            }).start();
        } else {
        }
    }, [isPlaying, user_duration]);

    // Convert seconds to "HH:MM:SS"
    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins
            .toString()
            .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        
          // Return the formatted string variable
    };

    // Handle activity switching
    const handleArrowPress = (direction: string) => {
        const activities = ["WALKING", "CYCLING", "SWIMMING"];
        const currentIndex = activities.indexOf(user_activity);
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
        progress.setValue(0); // Reset animation
    };

    const handleSubmit = async () => {

        // Call API and store in DB
        try {
            const currentDate = new Date().toISOString().split('T')[0];

            const response = await fetch('https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/store-activity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    activity: user_activity,  // or 'RUNNING', 'CYCLING', etc.
                    duration: user_duration,       // Duration in seconds
                    user_id: user?.user_id,
                    activity_date: currentDate
                }), // The activity data to be sent in the body
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log("Activity stored successfully:", data.message);
                ToastAndroid.show('Activity stored successfully', ToastAndroid.SHORT);
                
            } else {
                const errorData = await response.json();
                console.error("Error storing activity:", errorData.detail);
                ToastAndroid.show('"Error storing activity', ToastAndroid.SHORT);

                
            }
        } catch (error) {
            console.error("Request failed:", error);
            ToastAndroid.show('Failed to connect to the server. Please try again later.', ToastAndroid.SHORT);
            
        }

        setIsPlaying(false);
        setDuration(0); // Reset timer
        progress.setValue(0); // Reset animation
    };

    // Circle radius and path length
    const circleRadius = calculatePercentage(30, width);
    const strokeDasharray = Math.PI * 2 * circleRadius;
    const strokeDashoffset = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [strokeDasharray, 0], // Animate strokeDashoffset
    });

    return (
        <LinearGradient
            colors={['#ffffff', '#B1F0F7']} // White to #0095B7 gradient
            style={styles.container}
            start={{ x: 0, y: 0 }} // Gradient direction (top-left)
            end={{ x: 1, y: 1 }} // Gradient direction (bottom-right)
        >
            <Text style={styles.screenTitle}>Track Your Activity</Text>
            {/* Header with Tabs */}
            <View style={styles.headerContainer}>
                <TouchableOpacity
                style={[styles.tab, activeTab === "ActivityTimer" && styles.activeTab]}
                onPress={() => setActiveTab("ActivityTimer")}
                >
                <Text style={[styles.tabText, activeTab === "ActivityTimer" && styles.activeTabText]}>Stop Watch</Text>
                </TouchableOpacity>
                <TouchableOpacity
                style={[styles.tab, activeTab === "ActivityHistory" && styles.activeTab]}
                onPress={() => setActiveTab("ActivityHistory")}
                >
                <Text style={[styles.tabText, activeTab === "ActivityHistory" && styles.activeTabText]}>History</Text>
                </TouchableOpacity>
            </View>
            <View style={{}}>
                {activeTab === "ActivityTimer" ? (
                    
                   <View style={styles.containerBodyTimer}>
                        {/* Title Section */}
                        <View style={styles.titleContainer}>
                            <TouchableOpacity onPress={() => handleArrowPress("left")}>
                                <Entypo name="arrow-left" size={24} color="black" />
                            </TouchableOpacity>
                            <Text style={styles.title}>{user_activity}</Text>
                            <TouchableOpacity onPress={() => handleArrowPress("right")}>
                                <Entypo name="arrow-right" size={24} color="black" />
                            </TouchableOpacity>
                        </View>

                        {/* Distance Widget with Circular Animation */}
                        <View style={styles.distanceWidget}>
                                <Svg height={calculatePercentage(70, width)} width={calculatePercentage(70, width)} style={{}}>
                                    <Circle
                                        cx={calculatePercentage(35, width)}
                                        cy={calculatePercentage(35, width)}
                                        r={circleRadius}
                                        stroke="#e6e6e6"
                                        strokeWidth="8"
                                        fill="none"
                                    />
                                    <AnimatedCircle
                                        cx={calculatePercentage(35, width)}
                                        cy={calculatePercentage(35, width)}
                                        r={circleRadius}
                                        stroke="#133E87"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${strokeDasharray}, ${strokeDasharray}`}
                                        strokeDashoffset={strokeDashoffset}
                                    />
                                    <Text
                                        style={[styles.distanceValue, {
                                            position: 'absolute',
                                            top: calculatePercentage(15, height),
                                            left: calculatePercentage(20, width),
                                            textAlign: 'center',
                                            fontSize: calculatePercentage(7, width),
                                        }]}
                                    >
                                        {formatTime(user_duration)} {/* Update this with dynamic time */}
                                    </Text>
                                </Svg>
                        </View>

                        {/* Controls */}
                        <View style={styles.controlsContainer}>
                            <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
                                <FontAwesome name="stop" size={24} color="white" style={{textAlign:'center'}}/>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.playPauseButton} onPress={handlePlayPause}>
                                <FontAwesome
                                    name={isPlaying ? "pause" : "play"}
                                    size={30}
                                    color="white"
                                    style={{textAlign:'center'}}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.playPauseButton, { backgroundColor: user_duration === 0 ? 'black' : 'green', }]} onPress={handleSubmit} disabled={user_duration === 0}>
                                <Feather
                                    name={"check"}
                                    size={30}
                                    color="white"
                                    style={{textAlign:'center'}}
                                />
                            </TouchableOpacity>
                        </View>
                   </View>
                ) :
                (
                    <View style={styles.containerBodyHistory}>
                        <View style={{flexDirection:"row", padding: calculatePercentage(2.5, width), justifyContent:"space-around"}}>
                            <Text style={[styles.cardTitle, {marginLeft:calculatePercentage(6, width)}]}>Date</Text>
                            <Text style={[styles.cardTitle, {marginLeft:calculatePercentage(5, width)}]}>Activity</Text>
                            <Text style={[styles.cardTitle, {}]}>Time</Text>
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
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        colors={["#007BFF"]}
                                    />
                                }
                            />
                        ) : (
                            <Text style={styles.noDataText}>No activities found.</Text>
                        )}
                    </View>
                )}

            </View>
            {/* Bottom Navigation Bar */}
            <BottomNavBar
                navigation={navigation}
                activeTab="ActivityTracker"
                setActiveTab={setActiveTab}
            />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({


    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "#B8E0E7",
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

      screenTitle: {
        color: "black",
        fontSize: 24,
        textAlign: "center",
        marginBottom: 16,
      },

    container: {
        flex: 1,
        backgroundColor: "#1c1c1e",
        paddingHorizontal: calculatePercentage(2, width),
        paddingTop: calculatePercentage(2, height),
    },
    containerBodyTimer:{
        paddingHorizontal: calculatePercentage(10, width),
        marginTop: calculatePercentage(6, width),

    },
    containerBodyHistory: {
        paddingHorizontal: calculatePercentage(0, width),
    },
    titleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: calculatePercentage(3, height),
    },
    topbar:{
        height: calculatePercentage(12.5, height),
        justifyContent:'space-between',
        marginBottom: calculatePercentage(4, height),
        backgroundColor:"#3C3D37"
    },
    title: {
        color: "#333",
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
    },
    squareContainer: {
        backgroundColor: "#2c2c2e",
        padding: calculatePercentage(4, width),
        borderRadius: 10,
        alignItems: "center",
        width: "40%",
    },
    infoLabel: {
        color: "black",
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
        borderColor: "black",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    distanceValue: {
        color: "#333",
        fontSize: calculatePercentage(8, width),
        fontWeight: "bold",
    },
    controlsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: calculatePercentage(4, height),
        gap: 10
    },
    playPauseButton: {
        backgroundColor: "#133E87",
        height: calculatePercentage(15, width),
        width: calculatePercentage(15, width),
        borderRadius: calculatePercentage(7.5, width),
        justifyContent:'center',
    },
    stopButton: {
        backgroundColor: "#C62E2E",
        height: calculatePercentage(15, width),
        width: calculatePercentage(15, width),
        borderRadius: calculatePercentage(7.5, width),
        justifyContent:'center',
    },
    noDataText: {
        color: "gray",
        fontSize: calculatePercentage(3, width),
        textAlign: "center",
        marginTop: calculatePercentage(5, height),
    },
    card: {
        backgroundColor: "#EAF8FF",
        flexDirection:"row",
        justifyContent:"space-around",
        padding: calculatePercentage(2.5, width),
        borderRadius: 10,
        marginBottom: calculatePercentage(2, height),
        elevation:3
    },
    cardText: {
        color: "black",
        fontSize: calculatePercentage(3.5, width),
        marginBottom: 5,
    },
    cardTitle: {
        color: "black",
        fontSize: calculatePercentage(5, width),
        marginBottom: 5,
        marginRight:calculatePercentage(6, width),
    },
});

export default ActivityTracker;