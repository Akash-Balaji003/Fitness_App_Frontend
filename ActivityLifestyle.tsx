import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const ActivityLifestyle = () => {
  const [activity, setActivity] = useState('Moderate');

  const activityLevels = ['Sedentary', 'Moderate', 'Active'];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>How active are you in your daily lifestyle?</Text>
      <View style={styles.buttonContainer}>
        {activityLevels.map((level) => (
          <TouchableOpacity
            key={level}
            style={[styles.optionButton, activity === level && styles.selectedOption]}
            onPress={() => setActivity(level)}
          >
            <Text style={[styles.buttonText, activity === level && styles.selectedText]}>{level}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default ActivityLifestyle;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  title: { fontSize: 20, color: '#FFF', textAlign: 'center', marginVertical: 20 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  optionButton: { backgroundColor: '#333', padding: 15, borderRadius: 8, width: '30%', alignItems: 'center' },
  selectedOption: { backgroundColor: '#F0A500' },
  buttonText: { color: '#FFF' },
  selectedText: { color: '#000', fontWeight: 'bold' },
});
