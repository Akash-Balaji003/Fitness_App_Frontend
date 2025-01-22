import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { RootStackParamList } from "../../App";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import Icon from "react-native-vector-icons/FontAwesome";
import LinearGradient from 'react-native-linear-gradient';


const DietaryPreference = ({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'DietaryPreference'>) => {

  const { username, phone_number, password, DOB, gender, height, weight, email } = route.params;

  const [diet, setDiet] = useState('None');

  const dietaryOptions = ['A +', 'B +', 'O +', 'AB +', 'A -', 'B -', 'AB -', 'O -'];

  const navigateNext = async() => {
    navigation.navigate('ActivityLifestyle',{
        username: username,
        phone_number: phone_number,
        email: email,
        password: password,
        gender: gender,
        DOB: DOB,
        height: height,
        weight: weight,
        diet: diet
    })
  };

  return (
    <LinearGradient
            colors={['#ffffff', '#B1F0F7']} // White to #0095B7 gradient
            style={styles.container}
            start={{ x: 0, y: 0 }} // Gradient direction (top-left)
            end={{ x: 1, y: 1 }} // Gradient direction (bottom-right)
      >
      <Text style={styles.title}>What is your blood group?</Text>
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
      <View style={{flexDirection:"row", justifyContent:"space-between", margin:10, marginTop:100}}>
        <TouchableOpacity style={styles.nextButton} onPress={()=>navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={navigateNext}>
          <Icon name="arrow-right" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default DietaryPreference;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 20, color: "black", textAlign: "center", marginVertical: 20 },
  buttonContainer: {
    flexDirection: "row", // Arrange items in rows
    flexWrap: "wrap", // Allow wrapping into multiple rows
    justifyContent: "space-between", // Space between items
    alignItems: "center", // Align items vertically
  },
  optionButton: {
    backgroundColor: "#fff",
    paddingVertical: 15, // Increased for better touch area
    borderRadius: 8,
    width: "45%", // Ensure two buttons fit side by side
    margin: 5, // Spacing between buttons
    alignItems: "center",
    elevation: 3, // Shadow for depth
  },
  selectedOption: { backgroundColor: "#F0A500", elevation: 3 },
  buttonText: { color: "black" },
  selectedText: { color: "#000", fontWeight: "bold" },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF8C00",
    justifyContent: "center",
    alignItems: "center",
  },
});

