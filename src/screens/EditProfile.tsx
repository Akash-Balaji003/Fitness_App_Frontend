import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions, ActivityIndicator, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavBar from '../components/BottomNavBar';
import { RootStackParamList } from '../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useUser } from '../contexts/UserContext';
import Icon from 'react-native-vector-icons/MaterialIcons'; // For icons like Tick, Cross, and Pen
import { saveUserData } from '../tasks/Storage';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get("window");

const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

const EditProfile = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'EditProfile'>) => {
    const [activeTab, setActiveTab] = useState('Profile');

    const { user, setUser } = useUser();

    const [weightValue, setWeight] = useState(user?.weight || 0);
    const [heightValue, setHeightValue] = useState(user?.height || 0);
    const [bloodValue, setBlood] = useState(user?.blood || 'O +');
    const [activity, setActivity] = useState(user?.experience || 'Moderate');
    const [stepCount, setStepCount] = useState(user?.stepgoal || 10000);

    const dietaryOptions = ['A +', 'B +', 'O +', 'AB +', 'A -', 'B -', 'AB -', 'O -'];
    const activityLevels = ['Sedentary', 'Moderate', 'Active'];

    const handleDone = async () => {
        // Prepare the payload
        const updatedProfile = {
            user_id: user?.user_id,
            height: heightValue,
            weight: weightValue,
            blood: bloodValue,
            experience: activity,
            stepgoal: stepCount
            
        };

        console.log("DATA", updatedProfile);
    
        try {
            const response = await fetch('https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/update-user', {
                method: 'POST', // Use PUT for updates
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProfile),
            });
    
            if (!response.ok) {
                const errorDetails = await response.json();
                console.log("Error Details:", errorDetails);
                throw new Error('Failed to update profile');
            }
    
            const data = await response.json();
            setUser({
                user_id: user?.user_id || "",
                username: user?.username || "",
                phone_number: user?.phone_number || "",
                blood: bloodValue,
                height: heightValue,
                weight: weightValue,
                email: user?.email || "",
                experience: activity,
                stepgoal: stepCount,
                gender: user?.gender || "",
                DOB: user?.DOB || ""
            });


            await saveUserData({
                user_id: user?.user_id || "",
                username: user?.username || "",
                phone_number: user?.phone_number || "",
                blood: bloodValue,
                height: heightValue,
                weight: weightValue,
                email: user?.email || "",
                experience: activity,
                stepgoal: stepCount,
                gender: user?.gender || "",
                DOB: user?.DOB || ""
            });
            
            Alert.alert('Success', 'Profile updated successfully');
            navigation.goBack(); // Navigate back to the previous screen
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        }
    };

    if (!user) {
        return (
            <SafeAreaView style={[{ justifyContent: 'center', flex: 1, padding: 10, backgroundColor: '#2B2B2B' }]}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={{ color: "white", textAlign: 'center', marginTop: 10 }}>
                    Loading...
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <LinearGradient
            colors={['#ffffff', '#B1F0F7']} // White to #0095B7 gradient
            style={styles.container}
            start={{ x: 0, y: 0 }} // Gradient direction (top-left)
            end={{ x: 1, y: 1 }} // Gradient direction (bottom-right)
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="close" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Edit Profile</Text>
                <TouchableOpacity onPress={handleDone} style={styles.tickContainer}>
                    <Icon name="check" size={20} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Profile Picture and Info */}
            <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarPlaceholder}>
                        {/* Profile Picture */}
                        <TouchableOpacity style={styles.penIcon}>
                            <Icon name="edit" size={16} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.profileDetails}>
                    <Text style={styles.userName}>{user?.username || 'User Name'}</Text>
                    <Text style={styles.userInfo}>
                        25 years | { user?.gender || "Other"}
                    </Text>
                </View>
            </View>

            {/* Scrollable Editable Details */}
            <ScrollView style={styles.scrollContainer}>
                {/* Weight */}
                <View style={styles.section}>
                    <Text style={styles.label}>Weight (kgs)</Text>
                    <Text style={styles.value}>{weightValue}</Text>
                    <Slider
                        minimumValue={40}
                        maximumValue={150}
                        step={1}
                        value={weightValue}
                        onValueChange={setWeight}
                        style={styles.slider}
                    />
                </View>

                {/* Height */}
                <View style={styles.section}>
                    <Text style={styles.label}>Height (cm)</Text>
                    <Text style={styles.value}>{heightValue}</Text>
                    <Slider
                        minimumValue={100}
                        maximumValue={220}
                        step={1}
                        value={heightValue}
                        onValueChange={setHeightValue}
                        style={styles.slider}
                    />
                </View>

                {/* Dietary Preference */}
                <View style={styles.section}>
                    <Text style={styles.label}>Dietary Preferences</Text>
                    <View style={styles.buttonContainer}>
                        {dietaryOptions.map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.optionButton,
                                    bloodValue === option && styles.selectedOption,
                                ]}
                                onPress={() => setBlood(option)}
                            >
                                <Text
                                    style={[
                                        styles.buttonText,
                                        bloodValue === option && styles.selectedText,
                                    ]}
                                >
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Activity Level */}
                <View style={styles.section}>
                    <Text style={styles.label}>Activity Level</Text>
                    <View style={styles.buttonContainer}>
                        {activityLevels.map((level) => (
                            <TouchableOpacity
                                key={level}
                                style={[
                                    styles.optionButton,
                                    activity === level && styles.selectedOption,
                                ]}
                                onPress={() => setActivity(level)}
                            >
                                <Text
                                    style={[
                                        styles.buttonText,
                                        activity === level && styles.selectedText,
                                    ]}
                                >
                                    {level}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Step Count */}
                <View style={styles.section}>
                    <Text style={styles.label}>Daily Step Goal</Text>
                    <View style={styles.stepContainer}>
                        <TouchableOpacity onPress={() => setStepCount(Math.max(9000, stepCount - 1000))}>
                            <Text style={styles.stepButton}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.stepValue}>{stepCount}</Text>
                        <TouchableOpacity onPress={() => setStepCount(Math.min(20000, stepCount + 1000))}>
                            <Text style={styles.stepButton}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <BottomNavBar
            navigation={navigation}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
        />
        </LinearGradient>
    );
};

export default EditProfile;

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1c1c1e",
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        paddingVertical: hp(2),
    },
    title: {
        fontSize: wp(5),
        color: "#333",
        fontWeight: 'bold',
    },
    tickContainer: {
        backgroundColor: "#F0A500",
        borderRadius: wp(5),
        padding: wp(1.5),
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: wp(5),
    },
    avatarContainer: {
        marginRight: wp(5),
    },
    avatarPlaceholder: {
        width: wp(20),
        height: wp(20),
        borderRadius: wp(10),
        backgroundColor: "grey",
        alignItems: 'center',
        justifyContent: 'center',
    },
    penIcon: {
        position: 'absolute',
        bottom: -wp(2),
        left: -wp(2),
        backgroundColor: "#F0A500",
        borderRadius: wp(5),
        padding: wp(1),
    },
    profileDetails: {
        justifyContent: 'center',
    },
    userName: {
        fontSize: wp(5),
        color: "#333",
        fontWeight: 'bold',
    },
    userInfo: {
        fontSize: wp(4),
        color: "#AAA",
    },
    scrollContainer: {
        paddingHorizontal: wp(5),
        marginBottom:80
    },
    section: {
        marginVertical: hp(2),
    },
    label: {
        fontSize: wp(4),
        color: "#333",
        marginBottom: hp(0.5),
    },
    value: {
        fontSize: wp(5),
        fontWeight: 'bold',
        color: "#F0A500",
    },
    slider: {
        marginTop: hp(1),
    },
    buttonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    optionButton: {
        backgroundColor: '#fff',
        paddingVertical: hp(1),
        marginVertical: hp(0.5),
        borderRadius: wp(2),
        width: '30%',
        alignItems: 'center',
        elevation:3
    },
    selectedOption: {
        backgroundColor: "#F0A500",
        elevation:3
    },
    buttonText: {
        color: "#333",
        fontSize: wp(3.5),
    },
    selectedText: {
        color: "#000",
        fontWeight: 'bold',
    },
    stepContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepButton: {
        fontSize: wp(8),
        color: "#F0A500",
        marginHorizontal: wp(5),
    },
    stepValue: {
        fontSize: wp(6),
        fontWeight: 'bold',
        color: "#333",
    },
});
