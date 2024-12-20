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
import Svg, { Circle } from "react-native-svg";

const { width, height } = Dimensions.get("window");
const calculatePercentage = (percentage: number, dimension: number) =>
    (percentage / 100) * dimension;

const ActivityTimer = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'ActivityTimer'>) => {
    const [activeTab, setActiveTab] = useState('ActivityTimer');
    const AnimatedCircle = Animated.createAnimatedComponent(Circle);
    const [activity, setActivity] = useState("WALKING");
    const [duration, setDuration] = useState(0); // Timer in seconds
    const [isPlaying, setIsPlaying] = useState(false);

    const progress = useRef(new Animated.Value(0)).current; // This will control the progress

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
                toValue:  duration/60, // Adjust the duration limit as needed (e.g., 300 seconds for 5 minutes)
                duration: 1000, // Update every second
                useNativeDriver: false,
            }).start();
        } else {
        }
    }, [isPlaying, duration]);

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
        <SafeAreaView style={styles.container}>
            <View style={styles.topbar}>
                <Text style={[styles.title, {textAlign:'center', padding:10}]}>Activity Tracker</Text>
                <View style={{flexDirection:'row', justifyContent:'space-between', paddingHorizontal:calculatePercentage(2, width), gap:2}}>
                    <TouchableOpacity style={[styles.navbarButton]} disabled={true}>
                        <Text style={[{textAlign:'center',color: "white", fontSize: calculatePercentage(6, width),}]}>Timer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.activeNavbarButton, {backgroundColor:"#2c2c2e"}]} onPress={() => navigation.navigate("ActivityHistory")}>
                        <Text style={[{textAlign:'center',color: "white", fontSize: calculatePercentage(6, width),}]}>History</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.containerBody}>
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

                {/* Distance Widget with Circular Animation */}
                <View style={styles.distanceWidget}>
                        <Svg height={calculatePercentage(70, width)} width={calculatePercentage(70, width)} style={{}}>
                            <Circle
                                cx={calculatePercentage(35, width)}
                                cy={calculatePercentage(35, width)}
                                r={circleRadius}
                                stroke="black"
                                strokeWidth="8"
                                fill="none"
                            />
                            <AnimatedCircle
                                cx={calculatePercentage(35, width)}
                                cy={calculatePercentage(35, width)}
                                r={circleRadius}
                                stroke="#E37D00"
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
                                {formatTime(duration)} {/* Update this with dynamic time */}
                            </Text>
                        </Svg>
                </View>

                {/* Controls */}
                <View style={styles.controlsContainer}>
                    <TouchableOpacity style={styles.playPauseButton} onPress={handlePlayPause}>
                        <FontAwesome
                            name={isPlaying ? "pause" : "play"}
                            size={30}
                            color="white"
                            style={{textAlign:'center'}}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
                        <FontAwesome name="stop" size={24} color="white" style={{textAlign:'center'}}/>
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
    navbarButton:{backgroundColor: "#1c1c1e", height: calculatePercentage(6, height), width:'49%', justifyContent:"center", borderTopRightRadius:5, borderTopLeftRadius:5 },
    activeNavbarButton:{backgroundColor: "#1c1c1e", height: calculatePercentage(6, height), width:'49%', justifyContent:"center", borderRadius:5 },
    container: {
        flex: 1,
        backgroundColor: "#1c1c1e",
    },
    containerBody:{
        paddingHorizontal: calculatePercentage(10, width),
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
        borderColor: "black",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    distanceValue: {
        color: "white",
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
        backgroundColor: "#E37D00",
        height: calculatePercentage(15, width),
        width: calculatePercentage(15, width),
        borderRadius: calculatePercentage(7.5, width),
        justifyContent:'center',
    },
    stopButton: {
        backgroundColor: "black",
        height: calculatePercentage(15, width),
        width: calculatePercentage(15, width),
        borderRadius: calculatePercentage(7.5, width),
        justifyContent:'center',
    },
});

export default ActivityTimer;
