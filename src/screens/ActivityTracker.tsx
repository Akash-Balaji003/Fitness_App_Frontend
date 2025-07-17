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
    ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import BottomNavBar from "../components/BottomNavBar";
import Svg, { Circle } from "react-native-svg";
import { useUser } from "../contexts/UserContext";
import LinearGradient from "react-native-linear-gradient";
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get("window");

const ACTIVITIES = {
    WALKING: { icon: "walk", color: "#4A90E2" },
    CYCLING: { icon: "bicycle", color: "#D0021B" },
    SWIMMING: { icon: "swim", color: "#50E3C2" },
};

// --- Reusable Activity History Card ---
const ActivityHistoryCard = ({ item }: { item: any }) => {
    const activityInfo = ACTIVITIES[item.activity as keyof typeof ACTIVITIES] || { icon: "timer-sand", color: "#777" };

    const formatDuration = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <View style={styles.historyCard}>
            <View style={[styles.historyIconContainer, { backgroundColor: `${activityInfo.color}20` }]}>
                <MaterialCommunityIcons name={activityInfo.icon} size={28} color={activityInfo.color} />
            </View>
            <View style={styles.historyDetails}>
                <Text style={styles.historyActivity}>{item.activity}</Text>
                <Text style={styles.historyDate}>{new Date(item.activity_date).toDateString()}</Text>
            </View>
            <Text style={styles.historyDuration}>{formatDuration(item.duration)}</Text>
        </View>
    );
};


const ActivityTracker = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'ActivityTracker'>) => {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState<'ActivityTimer' | 'ActivityHistory'>('ActivityTimer');
    const [userActivity, setUserActivity] = useState<keyof typeof ACTIVITIES>("WALKING");
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    // --- Animation and Data Fetching Logic (largely unchanged) ---
    const progress = useRef(new Animated.Value(0)).current;

    const fetchActivities = async () => {
        try {
            const response = await fetch(`https://9kz2rcl6-8000.inc1.devtunnels.ms/fetch-activities?id=${user?.user_id}`);
            const data = await response.json();
            setActivities(data || []);
        } catch (error) {
            console.error("Error fetching activities:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.user_id) fetchActivities();
    }, [user]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchActivities();
        setRefreshing(false);
    };

    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;
        if (isPlaying) {
            timer = setInterval(() => setDuration((prev) => prev + 1), 1000);
        }
        return () => { if (timer) clearInterval(timer); };
    }, [isPlaying]);
    
    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handlePlayPause = () => setIsPlaying(!isPlaying);

    const handleStop = () => {
        setIsPlaying(false);
        setDuration(0);
        progress.setValue(0);
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch('https://9kz2rcl6-8000.inc1.devtunnels.ms/store-activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    activity: userActivity,
                    duration: duration,
                    user_id: user?.user_id,
                    activity_date: new Date().toISOString().split('T')[0]
                }),
            });
            if (response.ok) {
                ToastAndroid.show('Activity saved!', ToastAndroid.SHORT);
                handleStop();
                await fetchActivities(); // Refresh history
            } else {
                ToastAndroid.show('Error saving activity', ToastAndroid.SHORT);
            }
        } catch (error) {
            ToastAndroid.show('Server error', ToastAndroid.SHORT);
        }
    };

    const circleRadius = width * 0.3;
    const strokeWidth = 15;
    const circumference = 2 * Math.PI * circleRadius;

    return (
        <View style={{ flex: 1 }}>
            <LinearGradient colors={['#ffffff', '#D9F8FB']} style={styles.container}>
                <Text style={styles.title}>Activity Tracker</Text>
                
                <View style={styles.tabContainer}>
                    <TouchableOpacity onPress={() => setActiveTab("ActivityTimer")} style={[styles.tabButton, activeTab === "ActivityTimer" && styles.tabButtonActive]}>
                        <Text style={[styles.tabText, activeTab === "ActivityTimer" && styles.tabTextActive]}>Timer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveTab("ActivityHistory")} style={[styles.tabButton, activeTab === "ActivityHistory" && styles.tabButtonActive]}>
                        <Text style={[styles.tabText, activeTab === "ActivityHistory" && styles.tabTextActive]}>History</Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'ActivityTimer' ? (
                    <ScrollView contentContainerStyle={{alignItems: 'center'}}>
                        <Text style={styles.sectionTitle}>Select Activity</Text>
                        <View style={styles.activitySelector}>
                            {Object.keys(ACTIVITIES).map((key) => {
                                const act = key as keyof typeof ACTIVITIES;
                                const { icon, color } = ACTIVITIES[act];
                                const isSelected = userActivity === act;
                                return (
                                    <TouchableOpacity key={act} style={[styles.activityCard, isSelected && { backgroundColor: color, elevation: 8, shadowColor: color }]} onPress={() => setUserActivity(act)}>
                                        <MaterialCommunityIcons name={icon} size={32} color={isSelected ? '#fff' : color} />
                                        <Text style={[styles.activityText, isSelected && { color: '#fff' }]}>{act}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        
                        <View style={styles.timerContainer}>
                            <Svg width={circleRadius * 2 + strokeWidth} height={circleRadius * 2 + strokeWidth}>
                                <Circle cx={circleRadius + strokeWidth/2} cy={circleRadius + strokeWidth/2} r={circleRadius} stroke="#E6E7F2" strokeWidth={strokeWidth} />
                                <Circle cx={circleRadius + strokeWidth/2} cy={circleRadius + strokeWidth/2} r={circleRadius} stroke={ACTIVITIES[userActivity].color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - (duration % 60) / 60)} strokeLinecap="round" transform={`rotate(-90 ${circleRadius + strokeWidth/2} ${circleRadius + strokeWidth/2})`} />
                            </Svg>
                            <Text style={styles.timerText}>{formatTime(duration)}</Text>
                        </View>

                        <View style={styles.controlsContainer}>
                            <TouchableOpacity style={[styles.controlButton, { backgroundColor: '#777' }]} onPress={handleStop}>
                                <Icon name="stop-outline" size={30} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.controlButton, styles.playPauseButton]} onPress={handlePlayPause}>
                                <Icon name={isPlaying ? "pause-outline" : "play-outline"} size={40} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.controlButton, { backgroundColor: duration > 0 ? '#4CAF50' : '#ccc' }]} onPress={handleSubmit} disabled={duration === 0}>
                                <Icon name="checkmark-done-outline" size={30} color="white" />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                ) : (
                    loading ? <ActivityIndicator size="large" color="#114D5B" style={{marginTop: 50}} /> :
                    <FlatList
                        data={activities}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item}) => <ActivityHistoryCard item={item} />}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Icon name="time-outline" size={60} color="#ccc" />
                                <Text style={styles.emptyText}>No activity history found.</Text>
                            </View>
                        )}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#114D5B"]} />}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                )}
            </LinearGradient>
            <BottomNavBar navigation={navigation} activeTab="ActivityTracker" setActiveTab={() => {}} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: width * 0.05,
    },
    title: {
        fontSize: width * 0.07,
        fontWeight: "bold",
        color: "#114D5B",
        textAlign: "center",
        marginVertical: height * 0.02,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(17, 77, 91, 0.1)',
        borderRadius: 25,
        padding: 5,
        marginBottom: 20,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 20,
    },
    tabButtonActive: {
        backgroundColor: '#114D5B',
        elevation: 8,
    },
    tabText: {
        textAlign: 'center',
        fontWeight: '600',
        color: '#114D5B',
    },
    tabTextActive: {
        color: '#fff',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginVertical: 20,
    },
    activitySelector: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    activityCard: {
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 15,
        width: width * 0.25,
        borderRadius: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    activityText: {
        marginTop: 8,
        fontWeight: '600',
        fontSize: 12,
    },
    timerContainer: {
        marginVertical: height * 0.05,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerText: {
        position: 'absolute',
        fontSize: width * 0.12,
        fontWeight: 'bold',
        color: '#114D5B',
        fontVariant: ['tabular-nums'],
    },
    controlsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: 'center',
        width: '80%',
    },
    controlButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    playPauseButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#114D5B',
    },
    historyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
        elevation: 2,
    },
    historyIconContainer: {
        padding: 12,
        borderRadius: 25,
        marginRight: 15,
    },
    historyDetails: {
        flex: 1,
    },
    historyActivity: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textTransform: 'capitalize',
    },
    historyDate: {
        fontSize: 12,
        color: '#777',
    },
    historyDuration: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#114D5B',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height * 0.1,
    },
    emptyText: {
        fontSize: 16,
        color: "#aaa",
        marginTop: 15,
        fontStyle: "italic",
    },
});

export default ActivityTracker;
