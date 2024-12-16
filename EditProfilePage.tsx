import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';

const EditProfile = () => {
  // State management
  const [weight, setWeight] = useState(60); // Default weight
  const [height, setHeight] = useState(150); // Default height
  const [diet, setDiet] = useState('Paleo');
  const [activity, setActivity] = useState('Moderate');
  const [stepCount, setStepCount] = useState(10000);

  // Dietary options
  const dietaryOptions = ['Vegetarian', 'Pescatarian', 'Vegan', 'Dairy-free', 'Gluten-free', 'Paleo'];

  // Activity levels
  const activityLevels = ['Sedentary', 'Moderate', 'Active'];

  // Handle diet selection
  const handleDietSelect = (option: string) => {
    setDiet(option);
  };

  // Handle activity level selection
  const handleActivitySelect = (level: string) => {
    setActivity(level);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileHeader}>
        <Image
          source={require('./assets/us.jpg')} // Replace with local image file
          style={styles.profileImage}
        />
        <Text style={styles.userName}>Deekshith P, 38</Text>
      </View>

      {/* Weight and Height Section */}
      <View style={styles.section}>
        <Text style={styles.label}>Current weight</Text>
        <Text style={styles.value}>{weight} kgs</Text>
        <Slider
          minimumValue={40}
          maximumValue={150}
          step={1}
          value={weight}
          onValueChange={(value) => setWeight(value)}
          style={styles.slider}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Current height</Text>
        <Text style={styles.value}>{height} cm</Text>
        <Slider
          minimumValue={100}
          maximumValue={250}
          step={1}
          value={height}
          onValueChange={(value) => setHeight(value)}
          style={styles.slider}
        />
      </View>

      {/* Dietary Preferences */}
      <View style={styles.section}>
        <Text style={styles.label}>What is your dietary preference?</Text>
        <View style={styles.buttonContainer}>
          {dietaryOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.optionButton, diet === option && styles.selectedOption]}
              onPress={() => handleDietSelect(option)}
            >
              <Text style={[styles.buttonText, diet === option && styles.selectedText]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Activity Level */}
      <View style={styles.section}>
        <Text style={styles.label}>How active are you in your daily lifestyle?</Text>
        <View style={styles.buttonContainer}>
          {activityLevels.map((level) => (
            <TouchableOpacity
              key={level}
              style={[styles.optionButton, activity === level && styles.selectedOption]}
              onPress={() => handleActivitySelect(level)}
            >
              <Text style={[styles.buttonText, activity === level && styles.selectedText]}>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Step Count */}
      <View style={styles.section}>
        <Text style={styles.label}>Set your daily minimum step count</Text>
        <View style={styles.stepContainer}>
          <TouchableOpacity onPress={() => setStepCount((prev) => Math.max(9000, prev - 1000))}>
            <Text style={styles.stepButton}>-</Text>
          </TouchableOpacity>
          <Text style={styles.stepValue}>{stepCount}</Text>
          <TouchableOpacity onPress={() => setStepCount((prev) => Math.min(11000, prev + 1000))}>
            <Text style={styles.stepButton}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Black background
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  section: {
    marginVertical: 15,
  },
  label: {
    fontSize: 16,
    color: '#AAA',
    marginBottom: 10,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F0A500',
    textAlign: 'center',
  },
  slider: {
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    backgroundColor: '#333',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    width: '30%',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#F0A500',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
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
    fontSize: 30,
    color: '#F0A500',
    marginHorizontal: 20,
  },
  stepValue: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
  },
});
