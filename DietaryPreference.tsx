import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const DietaryPreference = () => {
  const [diet, setDiet] = useState('None');

  const dietaryOptions = ['Vegetarian', 'Pescatarian', 'Vegan', 'Dairy-free', 'Gluten-free', 'Paleo', 'Ovo-veg', 'Non-veg', 'None'];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>What is your dietary preference?</Text>
      <View style={styles.buttonContainer}>
        {dietaryOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.optionButton, diet === option && styles.selectedOption]}
            onPress={() => setDiet(option)}
          >
            <Text style={[styles.buttonText, diet === option && styles.selectedText]}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default DietaryPreference;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  title: { fontSize: 20, color: '#FFF', textAlign: 'center', marginVertical: 20 },
  buttonContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  optionButton: { backgroundColor: '#333', padding: 10, marginVertical: 5, borderRadius: 8, width: '30%', alignItems: 'center' },
  selectedOption: { backgroundColor: '#F0A500' },
  buttonText: { color: '#FFF' },
  selectedText: { color: '#000', fontWeight: 'bold' },
});
