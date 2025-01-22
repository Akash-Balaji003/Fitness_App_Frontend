import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions
} from 'react-native';
import { RootStackParamList } from '../App';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LinearGradient from 'react-native-linear-gradient';

type RegisterProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

const Register = ({ navigation }: RegisterProps) => {
    const { width, height } = useWindowDimensions();

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirm_password, setConfirmPassword] = useState('');
    const [phone_number, setPhoneNumber] = useState('');
    const [ email, setEmail ] = useState('');


    const [errorMessage, setErrorMessage] = useState('');

    const navigateNext = async() => {
        navigation.navigate('WelcomePage',{
            username: name,
            phone_number: phone_number,
            email: email,
            password: password,
        })
    };

    const handleNext = async () => {
        if (!name || !phone_number || !password || !confirm_password || !email) {
            setErrorMessage("All fields are required.");
            return;
        }
    
        if (password !== confirm_password) {
            setErrorMessage("Passwords don't match.");
            return;
        }
    
        try {
            // Make an API call to check if the phone number or email is already in use
            const response = await fetch("https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/check-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phone_number, email }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                // Backend returned success but also a message
                if (data.message === "This number or email already has an account") {
                    Alert.alert("Account Already Exists",data.message); // Alert the user about the account conflict
                    return; // Stop execution to prevent navigation
                }
    
                // Clear error and navigate to the next page if no account exists
                setErrorMessage("");
                navigateNext();
            } else {
                // Display the error message from the backend
                setErrorMessage(data.detail || "An error occurred.");
            }
        } catch (error) {
            setErrorMessage("Failed to connect to the server. Please try again later.");
        }
    };
    
    

    return (
        <LinearGradient
            colors={['#ffffff', '#B1F0F7']} // White to #0095B7 gradient
            style={styles.container}
            start={{ x: 0, y: 0 }} // Gradient direction (top-left)
            end={{ x: 1, y: 1 }} // Gradient direction (bottom-right)
        >

            {/* Form Title */}
            <Text style={styles.title}>CREATING ACCOUNT</Text>

            {/* Input Fields */}
            <View style={[styles.inputContainer, { width: Platform.OS === 'ios' ? '80%' : 'auto'}]}>
                <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} placeholderTextColor="#888" />
                <TextInput placeholder="Mobile number" value={phone_number} onChangeText={setPhoneNumber} style={styles.input} placeholderTextColor="#888" keyboardType="phone-pad" />
                <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} placeholderTextColor="#888" keyboardType='email-address' />
                <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} placeholderTextColor="#888" secureTextEntry />
                <TextInput placeholder="Confirm password" value={confirm_password} onChangeText={setConfirmPassword} style={styles.input} placeholderTextColor="#888" secureTextEntry />
                <Text style={[styles.stepLabel, {alignSelf:'center', color:'red'}]}>{errorMessage}</Text>
            </View>

            {/* Next Button */}
            <View style={[{flexDirection:'row', justifyContent:'space-between'}]}>
                <TouchableOpacity style={[styles.buttonBack]} onPress={() => navigation.goBack()}>
                    <Text style={styles.buttonText}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.buttonArrow]} onPress={handleNext}>
                    <AntDesign name="arrowright" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1c1c1e",
        justifyContent: 'space-around',
        paddingHorizontal: '10%',
    },
    stepLabel: {
        fontSize: 12,
        color: 'black',
        marginTop: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
        marginBottom: '5%',
    },
    inputContainer: {
        width: '100%',
        marginLeft: Platform.OS ==='ios' ? 'auto': '0%',
        marginRight: Platform.OS ==='ios' ? 'auto': '0%',
    },
    input: {
        backgroundColor: '#f2f2f2',
        color:"black",
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 15,
        fontSize: 16,
        marginVertical: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonBack: {
        backgroundColor: '#F0A500',
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 20,
        width:'50%'
    },
    buttonArrow: {
        backgroundColor: '#F0A500',
        borderRadius: 50,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 20,
        width: 50
    },
});

export default Register;
