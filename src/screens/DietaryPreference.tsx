import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { RootStackParamList } from "../App";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import Icon from "react-native-vector-icons/FontAwesome";


const DietaryPreference = ({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'DietaryPreference'>) => {

  const { username, phone_number, password, DOB, gender, height, weight, email } = route.params;

  const [diet, setDiet] = useState('None');

  const dietaryOptions = ['Vegetarian', 'Pescatarian', 'Vegan', 'Dairy-free', 'Gluten-free', 'Paleo', 'Ovo-veg', 'Non-veg', 'None'];

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
    <SafeAreaView style={styles.container}>
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
      <View style={{flexDirection:"row", justifyContent:"space-between", margin:10, marginTop:100}}>
        <TouchableOpacity style={styles.nextButton} onPress={()=>navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={navigateNext}>
          <Icon name="arrow-right" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DietaryPreference;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20, justifyContent:"center" },
  title: { fontSize: 20, color: '#FFF', textAlign: 'center', marginVertical: 20 },
  buttonContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  optionButton: { backgroundColor: '#333', padding: 10, marginVertical: 5, borderRadius: 8, width: '30%', alignItems: 'center' },
  selectedOption: { backgroundColor: '#F0A500' },
  buttonText: { color: '#FFF' },
  selectedText: { color: '#000', fontWeight: 'bold' },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF8C00",
    justifyContent: "center",
    alignItems: "center",
  },
});
