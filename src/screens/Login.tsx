import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ToastAndroid,
} from 'react-native';
import { RootStackParamList } from '../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useUser } from '../contexts/UserContext';

import { saveUserData } from '../tasks/Storage';
import LinearGradient from 'react-native-linear-gradient';

type LoginProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

// Get device dimensions for dynamic sizing
const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }: LoginProps) => {
    const { setUser } = useUser();


    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async () => {
        try {
        const response = await fetch('https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/login', {
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

            setUser({
                user_id: data.user_id,
                username: data.username,
                phone_number: data.phone_number,
                blood: data.blood_group,
                height: data.height,
                weight: data.weight,
                email: data.email,
                experience: data.experience,
                stepgoal: data.stepgoal,
                gender: data.gender,
                DOB: data.DOB,
            });


            await saveUserData({
                user_id: data.user_id,
                username: data.username,
                phone_number: data.phone_number,
                blood: data.blood_group,
                height: data.height,
                weight: data.weight,
                email: data.email,
                experience: data.experience,
                stepgoal: data.stepgoal,
                gender: data.gender,
                DOB: data.DOB
            });

            navigation.navigate("Home");
        } else {
            // Set error message from backend response
            ToastAndroid.show('Invalid mobile number or password', ToastAndroid.SHORT);
            setErrorMessage(data.detail || 'Invalid mobile number or password');
        }
        } catch (error) {
            setErrorMessage('Failed to connect to the server. Please try again later.');
            ToastAndroid.show('Failed to connect to the server. Please try again later.', ToastAndroid.SHORT);

        }
    };
  

    return (
        <LinearGradient
            colors={['#ffffff', '#B1F0F7']} // White to #0095B7 gradient
            style={styles.container}
            start={{ x: 0, y: 0 }} // Gradient direction (top-left)
            end={{ x: 1, y: 1 }} // Gradient direction (bottom-right)
        >
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
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#1c1c1e",
    },
    header: {
        fontSize: width * 0.08, // Dynamic font size
        fontWeight: 'bold',
        color: 'black',
        marginBottom: height * 0.02,
    },
    subHeader: {
        fontSize: width * 0.06, // Dynamic font size
        color: 'black',
        marginBottom: height * 0.03,
    },
    input: {
        width: width * 0.8,
        height: height * 0.07,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        paddingHorizontal: 20,
        fontSize: width * 0.045, // Dynamic font size for input text
        color: 'black',
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
        backgroundColor: '#133E87',
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
        color: '#333',
        fontSize: width * 0.04,
        textDecorationLine: 'underline',
        marginBottom: height * 0.05,
    },
    signUpContainer: {
        flexDirection: 'row',
    },
    newHere: {
        color: '#333',
        fontSize: width * 0.04,
    },
    signUp: {
        color: '#333',
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
