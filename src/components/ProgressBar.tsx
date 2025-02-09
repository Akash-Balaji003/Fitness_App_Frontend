import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Badge {
    steps?: number;
    streaks?: number;
    calories?: number;
}

interface ProgressBarProps {
    selectedBadge: Badge;
    userSteps: number;
    userStreaks: number;
    userCalories: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ selectedBadge, userSteps, userStreaks, userCalories }) => {
    const calculateProgress = (selectedBadge: Badge, userSteps: number, userStreaks: number, userCalories: number): number => {
        let progress = 0;

        if (selectedBadge.steps) {
            progress = userSteps / selectedBadge.steps;
        } else if (selectedBadge.streaks) {
            progress = userStreaks / selectedBadge.streaks;
        } else if (selectedBadge.calories) {
            progress = userCalories / selectedBadge.calories;
        }

        return Math.min(progress, 1); // Ensuring progress does not exceed 100%
    };

    const progress = calculateProgress(selectedBadge, userSteps, userStreaks, userCalories);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Progress</Text>
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        margin: 5,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    progressBar: {
        width: '80%',
        height: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
    },
});

export default ProgressBar;