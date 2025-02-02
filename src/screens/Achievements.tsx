import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import ProgressBar from '../components/ProgressBar';
import { useUser } from '../contexts/UserContext';

interface Badge {
    title: string;
    image: any;
    description: string;
    color: string;
    steps?: number;
    streaks?: number;
    calories?: number;
    unlocked?: boolean;
}

// Updated Badge Data with Nested Structure
const badges: { category: string; badges: Badge[] }[] = [
    {
        category: 'Steps',
        badges: [
            { title: 'BRONZE', steps: 50000, color: '#CD7F32', image: require('../assets/step_bronze.png'), description: 'Awarded for completing 50,000 steps.', unlocked: false },
            { title: 'SILVER', steps: 100000, color: '#C0C0C0', image: require('../assets/step_silver.png'), description: 'Awarded for completing 1,00,000 steps.', unlocked: false },
            { title: 'GOLD', steps: 500000, color: '#FFD700', image: require('../assets/step_gold.png'), description: 'Awarded for completing 5,00,000 steps.', unlocked: false },
        ],
    },
    {
        category: 'Streaks',
        badges: [
            { title: 'BRONZE', streaks: 30, color: '#FF5733', image: require('../assets/30_days.png'), description: 'Awarded for maintaining a 30-day streak.', unlocked: false },
            { title: 'SILVER', streaks: 75, color: '#FFC300', image: require('../assets/75_days.png'), description: 'Awarded for maintaining a 75-day streak.', unlocked: false },
            { title: 'GOLD', streaks: 100, color: '#FFD700', image: require('../assets/100_days.png'), description: 'Awarded for maintaining a 100-day streak.', unlocked: false },
        ],
    },
    {
        category: 'Calories Burned',
        badges: [
            { title: 'BRONZE', calories: 500, color: '#8E44AD', image: require('../assets/cal_bronze.png'), description: 'Awarded for burning 500 calories.', unlocked: false },
            { title: 'SILVER', calories: 1000, color: '#3498DB', image: require('../assets/cal_silver.png'), description: 'Awarded for burning 1000 calories.', unlocked: false },
            { title: 'GOLD', calories: 5000, color: '#FFD700', image: require('../assets/cal_gold.png'), description: 'Awarded for burning 5000 calories.', unlocked: false },
        ],
    },
];

const AchievementsScreen = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Achievements'>) => {
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
    const [activeTab, setActiveTab] = useState('Achievements');
    
    const [totSteps, setSteps] = useState(0);
    const [calories, setCalories] = useState(0);

    const { user } = useUser();
    const [ streaks , setStreak ] = useState(0);

    const updatedBadges = badges.map(category => ({
        ...category,
        badges: category.badges.map(badge => {
            // Ensure the badge is unlocked only if the condition meets the threshold
            if (badge.steps && totSteps >= badge.steps) {
                badge.unlocked = true; // Mark as unlocked if total steps are greater than or equal
            } else if (badge.streaks && streaks >= badge.streaks) {
                badge.unlocked = true; // Mark as unlocked if streaks are met
            } else if (badge.calories && calories >= badge.calories) {
                badge.unlocked = true; // Mark as unlocked if calories are met
            } else {
                badge.unlocked = false; // Ensure it's locked if conditions aren't met
            }
            return badge;
        }),
    }));    
    

    const earnedBadges = updatedBadges.flatMap(category => category.badges).filter(badge => badge.unlocked);
    const lockedBadges = updatedBadges.flatMap(category => category.badges).filter(badge => !badge.unlocked);

    const calculateMetrics = (steps: number, weight: number, height: number): { distance: number, calories: number } => {
        const heightInMeters = height / 100; 
        const STRIDE_LENGTH = heightInMeters * 0.414; // Stride length in meters
        const distanceInMeters = steps * STRIDE_LENGTH; // Distance in meters
        const distanceInKm = distanceInMeters / 1000; // Convert to kilometers
      
        const caloriesBurned = 0.57 * weight * distanceInKm;
      
        return {
          distance: distanceInKm, // Distance in km
          calories: caloriesBurned, // Calories burned
        };
    };

    const fetchStreaks = async () => {
        try {
            // Replace with your actual API URL
            const response = await fetch(`https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/get-streaks?id=${user?.user_id}`);
            const data = await response.json();
            
            // Assuming the API returns an object with step counts for each day
            console.log("Streaks : ", data)
            setStreak(data);
        } catch (error) {
            console.error('Error fetching step data:', error);
        }
    };

    const fetchTotalSteps = async () => {
        try {
            // Replace with your actual API URL
            const response = await fetch(`https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/get-total-steps?id=${user?.user_id}`);
            const data = await response.json();
            
            // Assuming the API returns an object with step counts for each day
            console.log("Total Steps : ", data["total_steps"])
            setSteps(data["total_steps"])
        } catch (error) {
            console.error('Error fetching step data:', error);
        }
    };

    useEffect(()=>{
        if (user?.user_id) {
            fetchStreaks();
            fetchTotalSteps();
        }
    },[user]);

    if (!user) {
            return (
                <LinearGradient
                    colors={['#ffffff', '#B1F0F7']} // White to #0095B7 gradient
                    style={styles.safeContainer}
                    start={{ x: 0, y: 0 }} // Gradient direction (top-left)
                    end={{ x: 1, y: 1 }} // Gradient direction (bottom-right)
                >
                    <ActivityIndicator size="large" color="blue" />
                    <Text style={{ color: "#333", textAlign: 'center', marginTop: 10 }}>
                        Loading...
                    </Text>
                </LinearGradient>
            );
        }
    
    useEffect(() => {
        const metrics = calculateMetrics(totSteps, user?.weight, user?.height);
        setCalories(parseFloat(metrics.calories.toFixed(0))); // Update calories after metrics calculation
    }, [totSteps, user?.weight, user?.height]);  // Dependency array ensures it runs only when these values change
    
    return (
        <LinearGradient
            colors={['#ffffff', '#B1F0F7']}
            style={styles.safeContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <ScrollView>
                <Text style={styles.title}>Achievements</Text>
                <Text style={styles.subtitle}>Earn badges by walking more!</Text>

                {/* Earned Badges Section */}
                <Text style={styles.earnedTitle}>Earned Badges</Text>
                <View style={[styles.badgeContainer,{marginBottom:30}]}>
                    {earnedBadges.length === 0 ? (
                        <Text style={styles.noBadgesText}>No badges earned yet!</Text> // Change the message as needed
                    ) : (
                        earnedBadges.map((badge, index) => (
                            <TouchableOpacity key={index} onPress={() => setSelectedBadge(badge)}>
                                <Image source={badge.image} style={styles.badgeImage} />
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Locked Badges Section */}
                <Text style={styles.lockedTitle}>Locked Badges</Text>
                <View style={styles.badgeContainer}>
                    {lockedBadges.map((badge, index) => (
                        <TouchableOpacity key={index} onPress={() => setSelectedBadge(badge)}>
                            <Image source={badge.image} style={[styles.badgeImage, { opacity: 0.4 }]} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Modal for Enlarged Badge View */}
            <Modal visible={!!selectedBadge} transparent animationType="slide">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    {selectedBadge && (
                        <View style={{alignContent:"center",}}>
                            <Image source={selectedBadge.image} style={styles.largeBadgeImage} />

                            <Text style={styles.badgeDescription}>{selectedBadge.description}</Text>

                            {/* Progress Bar */}
                            <ProgressBar
                                selectedBadge={selectedBadge} 
                                userSteps={totSteps} 
                                userStreaks={streaks} 
                                userCalories={calories} 
                            />

                            {/* Progress Text (Ensure `steps` exist) */}
                            {selectedBadge.steps !== undefined && (
                                <Text style={styles.progressText}>
                                    {totSteps >= (selectedBadge.steps ?? 0) ? 'Completed!' : `${totSteps} / ${selectedBadge.steps} steps`}
                                </Text>
                            )}

                            {/* Streak Progress */}
                            {selectedBadge.streaks !== undefined && (
                                <Text style={styles.progressText}>
                                    {streaks >= (selectedBadge.streaks ?? 0) ? 'Completed!' : `${streaks} / ${selectedBadge.streaks} streaks`}
                                </Text>
                            )}

                            {/* Calories Progress */}
                            {selectedBadge.calories !== undefined && (
                                <Text style={styles.progressText}>
                                    {calories >= (selectedBadge.calories ?? 0) ? 'Completed!' : `${calories} / ${selectedBadge.calories} calories`}
                                </Text>
                            )}

                            <TouchableOpacity onPress={() => setSelectedBadge(null)} style={{height:"8%", width:"20%", alignSelf:"center", marginTop:25}}>
                                <Text style={styles.closeModal}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>

        <BottomNavBar
            navigation={navigation}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
        />

        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
        marginTop:5
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        color: '#555',
    },
    earnedTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E8B57',
        marginBottom: 5,
    },
    lockedTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#B22222',
        marginBottom: 5,
    },
    badgeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    badgeImage: {
        width: 100,
        height: 100,
        margin: 5,
    },
    largeBadgeImage: {
        width: 150,
        height: 150,
        alignSelf:"center"
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        alignSelf:"center"

    },
    badgeDescription: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
        color: '#555',
    },
    progressText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 5,
        color: '#333',
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        display:"flex",
        height: '50%', // Adjust height as needed
        width: '80%', // Adjust height as needed
    },
    closeModal: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: 'bold',
        alignSelf:"center",
    },
    noBadgesText: {
        fontSize: 16,
        color: "#aaa",
        fontStyle: "italic",
        textAlign:"center",
        marginRight:"auto",
        marginLeft:"auto",
        marginTop:5
      },
});

export default AchievementsScreen;
