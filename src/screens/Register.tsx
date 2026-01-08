import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState, useEffect } from 'react';
import {
    Alert,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
    Modal,
    Dimensions
} from 'react-native';
import { RootStackParamList } from '../App';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LinearGradient from 'react-native-linear-gradient';

type RegisterProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

// Get device dimensions for dynamic sizing
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Register = ({ navigation }: RegisterProps) => {
    const { width, height } = useWindowDimensions();

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirm_password, setConfirmPassword] = useState('');
    const [phone_number, setPhoneNumber] = useState('');
    const [ email, setEmail ] = useState('');


    const [errorMessage, setErrorMessage] = useState('');
    const [showInfoModal, setShowInfoModal] = useState(true);

    useEffect(() => {
        // Show the modal when the component mounts
        setShowInfoModal(true);
    }, []);

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
            const response = await fetch("http://172.16.0.60:8002/check-user", {
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
        backgroundColor: '#133E87',
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 20,
        width:'50%'
    },
    buttonArrow: {
        backgroundColor: '#133E87',
        borderRadius: 50,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 20,
        width: 50
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
        padding: screenWidth * 0.06,
        width: screenWidth * 0.8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: screenWidth * 0.06,
        fontWeight: 'bold',
        color: '#133E87',
        marginBottom: screenHeight * 0.02,
        textAlign: 'center',
    },
    modalText: {
        fontSize: screenWidth * 0.04,
        color: '#333',
        textAlign: 'center',
        marginBottom: screenHeight * 0.03,
        lineHeight: screenWidth * 0.05,
    },
    modalButton: {
        backgroundColor: '#133E87',
        borderRadius: 10,
        paddingVertical: screenHeight * 0.015,
        paddingHorizontal: screenWidth * 0.1,
        minWidth: screenWidth * 0.3,
    },
    modalButtonText: {
        color: '#FFFFFF',
        fontSize: screenWidth * 0.045,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default Register;
