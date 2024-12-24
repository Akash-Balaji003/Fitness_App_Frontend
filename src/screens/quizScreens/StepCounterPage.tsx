import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ToastAndroid, ActivityIndicator } from 'react-native';
import { RootStackParamList } from '../../App';
import Icon from 'react-native-vector-icons/FontAwesome';

const StepCounterPage = ({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'StepCounterPage'>) => {

  const { username, phone_number, password, DOB, gender, height, weight, diet, experience, email } = route.params;

  const [stepGoal, setStepCount] = useState(10000);

  const [errorMessage, setErrorMessage] = useState('');

  const [loading, setLoading] = useState(false); // Loader state

  
  const registerUser = async() => {
    setLoading(true); // Show loader
    try {
        const response = await fetch('https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                phone_number: phone_number,
                email: email,
                password: password,
                gender: gender,
                DOB: DOB,
                height: height,
                weight: weight,
                diet: diet,
                experience: experience,
                stepgoal: stepGoal
            }),
        });

        if (response.ok){
            ToastAndroid.show('Account Created Successfully', ToastAndroid.SHORT);
            navigation.navigate("Login");
            console.log("DONE");
        }
    }
    catch (error) {
        setErrorMessage('Failed to connect to the server. Please try again later.');
        ToastAndroid.show('Failed to connect to the server. Please try again later.', ToastAndroid.SHORT);
        console.log("error");

    }
    finally{
      setLoading(false); // Hide loader
    }
  };


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Set your daily minimum step count</Text>
      <View style={styles.stepContainer}>
        <TouchableOpacity onPress={() => setStepCount((prev) => Math.max(9000, prev - 1000))}>
          <Text style={styles.stepButton}>-</Text>
        </TouchableOpacity>
        <Text style={styles.stepValue}>{stepGoal}</Text>
        <TouchableOpacity onPress={() => setStepCount((prev) => Math.min(11000, prev + 1000))}>
          <Text style={styles.stepButton}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.stepLabel, { alignSelf: 'center', color: 'red' }]}>{errorMessage}</Text>
      {loading ? ( // Show loader when loading
        <ActivityIndicator size="large" color="#FF8C00" style={{ marginVertical: 20 }} />
      ) : (
        <View style={{ flexDirection: "row", justifyContent: "space-between", margin: 10 }}>
          <TouchableOpacity style={styles.nextButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={registerUser}>
            <Icon name="arrow-right" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default StepCounterPage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  title: { fontSize: 20, color: '#FFF', textAlign: 'center', marginVertical: 20 },
  stepContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  stepButton: { fontSize: 40, color: '#F0A500', marginHorizontal: 20 },
  stepValue: { fontSize: 28, color: '#FFF', fontWeight: 'bold' },
  stepLabel: {
    fontSize: 12,
    color: 'black',
    marginTop: 5,
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF8C00",
    justifyContent: "center",
    alignItems: "center",
  },
});
