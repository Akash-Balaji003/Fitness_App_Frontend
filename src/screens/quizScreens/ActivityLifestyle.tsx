import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { RootStackParamList } from "../../App";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import Icon from "react-native-vector-icons/FontAwesome";
import LinearGradient from 'react-native-linear-gradient';

const ActivityLifestyle = ({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'ActivityLifestyle'>) => {

  const { username, phone_number, password, DOB, gender, height, weight, diet, email } = route.params;

  const [activity, setActivity] = useState('Moderate');

  const activityLevels = ['Sedentary', 'Moderate', 'Active'];

  const navigateNext = async() => {
    navigation.navigate('StepCounterPage',{
        username: username,
        phone_number: phone_number,
        email: email,
        password: password,
        gender: gender,
        DOB: DOB,
        height: height,
        weight: weight,
        diet: diet,
        experience: activity
    })
  };

  return (
    <LinearGradient
          colors={['#ffffff', '#B1F0F7']} // White to #0095B7 gradient
          style={styles.container}
          start={{ x: 0, y: 0 }} // Gradient direction (top-left)
          end={{ x: 1, y: 1 }} // Gradient direction (bottom-right)
      >
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

export default ActivityLifestyle;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  title: { fontSize: 20, color: 'black', textAlign: 'center', marginVertical: 20 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  optionButton: { backgroundColor: '#fff', padding: 15, borderRadius: 8, width: '30%', alignItems: 'center', elevation:3 },
  selectedOption: { backgroundColor: '#F0A500', elevation:3 },
  buttonText: { color: '#333' },
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
