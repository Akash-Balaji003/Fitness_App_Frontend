import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { RootStackParamList } from '../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type LoginProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

// Get device dimensions for dynamic sizing
const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }: LoginProps) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('https://digicard-backend-deg0gdhzbjamacad.southeastasia-01.azurewebsites.net/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: mobileNumber,
          password: password,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Navigate to Home screen on successful login
        navigation.navigate("Home");
      } else {
        // Set error message from backend response
        setErrorMessage(data.detail || 'Invalid mobile number or password');
      }
    } catch (error) {
      setErrorMessage('Failed to connect to the server. Please try again later.');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hi there!</Text>
      <Text style={styles.subHeader}>LOGIN</Text>

      <TextInput
        style={styles.input}
        keyboardType='numeric'
        placeholder="Mobile number"
        placeholderTextColor="#C4C4C4"
        value={mobileNumber}
        onChangeText={setMobileNumber}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#C4C4C4"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>LOGIN</Text>
      </TouchableOpacity>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text> // Show error message
      ) : null}

      <TouchableOpacity>
        <Text style={styles.forgotPassword}>Forgot password?</Text>
      </TouchableOpacity>

      <View style={styles.signUpContainer}>
        <Text style={styles.newHere}>If you’re new here, please </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.signUp}>sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F9F5', // Light greenish background
  },
  header: {
    fontSize: width * 0.08, // Dynamic font size
    fontWeight: 'bold',
    color: '#0C284D',
    marginBottom: height * 0.02,
  },
  subHeader: {
    fontSize: width * 0.06, // Dynamic font size
    color: '#0C284D',
    marginBottom: height * 0.03,
  },
  input: {
    width: width * 0.8,
    height: height * 0.07,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: width * 0.045, // Dynamic font size for input text
    color: '#0C284D',
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  loginButton: {
    width: width * 0.6,
    height: height * 0.07,
    backgroundColor: '#0C284D',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: height * 0.02,
    marginBottom: height * 0.02,
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: width * 0.05,
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: '#0C284D',
    fontSize: width * 0.04,
    textDecorationLine: 'underline',
    marginBottom: height * 0.05,
  },
  signUpContainer: {
    flexDirection: 'row',
  },
  newHere: {
    color: '#0C284D',
    fontSize: width * 0.04,
  },
  signUp: {
    color: '#0C284D',
    fontSize: width * 0.04,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: width * 0.04,
    marginTop: height * 0.02,
  },
});

export default LoginScreen;
