import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavBar from '../components/BottomNavBar';
import { RootStackParamList } from '../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useUser } from '../contexts/UserContext';

const { width, height } = Dimensions.get("window");

// Helper function for percentage-based sizing
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

const EditProfile = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Profile'>) => {
    const { user } = useUser();

    const [activeTab, setActiveTab] = useState('Profile');
    const [weight, setWeight] = useState(60); // Default weight
    const [heightValue, setHeightValue] = useState(150); // Default height
    const [diet, setDiet] = useState('Paleo');
    const [activity, setActivity] = useState('Moderate');
    const [stepCount, setStepCount] = useState(10000);

    const dietaryOptions = ['Vegetarian', 'Non-veg', 'Vegan', 'Dairy-free', 'Gluten-free', 'Paleo'];
    const activityLevels = ['Sedentary', 'Moderate', 'Active'];

    const handleDietSelect = (option: string) => setDiet(option);
    const handleActivitySelect = (level: string) => setActivity(level);

    if (!user) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={{ color: "white", textAlign: 'center', marginTop: 10 }}>
                    Loading...
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <View>
                    <Text style={styles.userName}>{user?.username}</Text>
                    <Text style={styles.userName}>{user?.email}</Text>
                </View>
                <View style={styles.avatarPlaceholder} />
            </View>

            {/* Weight Section */}
            <View style={styles.section}>
                <Text style={styles.label}>Current Weight</Text>
                <Text style={styles.value}>{user?.weight} kgs</Text>
                <Slider
                    minimumValue={40}
                    maximumValue={150}
                    step={1}
                    value={typeof user?.weight === 'number' ? user.weight : weight}
                    onValueChange={setWeight}
                    style={styles.slider}
                />
            </View>

            {/* Height Section */}
            <View style={styles.section}>
                <Text style={styles.label}>Current Height</Text>
                <Text style={styles.value}>{user?.height} cm</Text>
                <Slider
                    minimumValue={100}
                    maximumValue={220}
                    step={1}
                    value={typeof user?.height === 'number' ? user.height : weight}
                    onValueChange={setHeightValue}
                    style={styles.slider}
                />
            </View>

            {/* Dietary Preferences */}
            <View style={styles.section}>
                <Text style={styles.label}>Dietary Preferences</Text>
                <View style={styles.buttonContainer}>
                    {dietaryOptions.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.optionButton,
                                user?.diet === option && styles.selectedOption,
                            ]}
                            onPress={() => handleDietSelect(option)}
                        >
                            <Text
                                style={[
                                    styles.buttonText,
                                    user?.diet === option && styles.selectedText,
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
                                user.experience === level && styles.selectedOption,
                            ]}
                            onPress={() => handleActivitySelect(level)}
                        >
                            <Text
                                style={[
                                    styles.buttonText,
                                    user.experience === level && styles.selectedText,
                                ]}
                            >
                                {level}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Step Count */}
            <View style={styles.bottomSection}>
                <Text style={styles.label}>Daily Step Count</Text>
                <View style={styles.stepContainer}>
                    <TouchableOpacity onPress={() => setStepCount(Math.max(9000, stepCount - 1000))}>
                        <Text style={styles.stepButton}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepValue}>{user?.stepgoal}</Text>
                    <TouchableOpacity onPress={() => setStepCount(Math.min(20000, stepCount + 1000))}>
                        <Text style={styles.stepButton}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
        <BottomNavBar
            navigation={navigation}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
        />
        </SafeAreaView>
    );
};

export default EditProfile;

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1c1c1e",
        paddingHorizontal: wp(5),
        paddingTop: hp(1),
    },
    profileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: hp(2),
    },
    avatarPlaceholder: {
        width: wp(20),
        height: wp(20),
        borderRadius: wp(10),
        backgroundColor: 'grey',
    },
    userName: {
        fontSize: wp(5),
        fontWeight: 'bold',
        color: '#FFF',
        marginTop: hp(1),
    },
    section: {
        marginVertical: hp(2),
    },
    bottomSection: {
        marginVertical: hp(2),
        marginBottom: 100
    },
    label: {
        fontSize: wp(4.2),
        color: '#AAA',
        marginBottom: hp(1),
    },
    value: {
        fontSize: wp(5),
        fontWeight: 'bold',
        color: '#F0A500',
        textAlign: 'center',
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
        backgroundColor: '#333',
        paddingVertical: hp(1.2),
        marginVertical: hp(0.5),
        borderRadius: wp(2),
        width: '30%',
        alignItems: 'center',
    },
    selectedOption: {
        backgroundColor: '#F0A500',
    },
    buttonText: {
        color: '#FFF',
        fontSize: wp(3.5),
    },
    selectedText: {
        color: '#000',
        fontWeight: 'bold',
    },
    stepContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepButton: {
        fontSize: wp(8),
        color: '#F0A500',
        marginHorizontal: wp(5),
    },
    stepValue: {
        fontSize: wp(6),
        color: '#FFF',
        fontWeight: 'bold',
    },
});
