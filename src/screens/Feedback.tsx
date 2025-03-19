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

import LinearGradient from 'react-native-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';

type FeedbackProps = NativeStackScreenProps<RootStackParamList, 'FeedbackScreen'>;

// Get device dimensions for dynamic sizing
const { width, height } = Dimensions.get('window');

const FeedbackScreen = ({ navigation }: FeedbackProps) => {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('FeedbackScreen');


    const [Feedback, setFeedback] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async () => {
        try {
            const response = await fetch('https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/feedback', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user?.user_id,
                    description: Feedback
                }),
            });
    
        const data = await response.json();
    
        if (response.ok) {
            // Pop up saying Feedback Submission was successful
            ToastAndroid.show('FeedBack Submitted Successfully', ToastAndroid.SHORT);
            navigation.navigate("Home");
        } else {
            // Set error message from backend response
            ToastAndroid.show('Error Sending Feedback', ToastAndroid.SHORT);
            setErrorMessage(data.detail || 'Error Sending Feedback');
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
            <Text style={styles.subHeader}>Please Provide Feedback</Text>

            <TextInput
                style={styles.input}
                keyboardType='default'
                placeholder="Feedback"
                placeholderTextColor="#C4C4C4"
                multiline={true}
                value={Feedback}
                onChangeText={setFeedback}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
                <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>

            {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text> // Show error message
            ) : null}

            <BottomNavBar
                navigation={navigation}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
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
        height: height * 0.2,
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
    submitButton: {
        width: width * 0.6,
        height: height * 0.07,
        backgroundColor: '#133E87',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginTop: height * 0.02,
        marginBottom: height * 0.02,
    },
    submitText: {
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

export default FeedbackScreen;
