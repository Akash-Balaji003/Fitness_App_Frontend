import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ToastAndroid,
  Modal,
} from 'react-native';
import { RootStackParamList } from '../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useUser } from '../contexts/UserContext';

import { saveUserData, saveUserId } from '../tasks/Storage';
import LinearGradient from 'react-native-linear-gradient';

type LoginProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

// Get device dimensions for dynamic sizing
const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }: LoginProps) => {
    const { setUser } = useUser();


    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showInfoModal, setShowInfoModal] = useState(true);

    useEffect(() => {
        // Show the modal when the component mounts
        setShowInfoModal(true);
    }, []);

    const handleLogin = async () => {
        try {
        const response = await fetch('http://172.16.0.60:8002/login', {   // https://9kz2rcl6-8000.inc1.devtunnels.ms
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
                caloriegoal: data.caloriegoal
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
                DOB: data.DOB,
                caloriegoal: data.caloriegoal,
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
            <Modal
                visible={showInfoModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowInfoModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Important Information</Text>
                        <Text style={styles.modalText}>
                            Please use your NetID and the same password ONLY.
                        </Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setShowInfoModal(false)}
                        >
                            <Text style={styles.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: width * 0.06,
        width: width * 0.8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: width * 0.06,
        fontWeight: 'bold',
        color: '#133E87',
        marginBottom: height * 0.02,
        textAlign: 'center',
    },
    modalText: {
        fontSize: width * 0.04,
        color: '#333',
        textAlign: 'center',
        marginBottom: height * 0.03,
        lineHeight: width * 0.05,
    },
    modalButton: {
        backgroundColor: '#133E87',
        borderRadius: 10,
        paddingVertical: height * 0.015,
        paddingHorizontal: width * 0.1,
        minWidth: width * 0.3,
    },
    modalButtonText: {
        color: '#FFFFFF',
        fontSize: width * 0.045,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default LoginScreen;
