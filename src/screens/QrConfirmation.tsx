import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform, Alert, ToastAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Icon1 from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../App'; // Assuming you have this
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useUser } from '../contexts/UserContext';

interface QrInfo {
    Name: string;
    amount: number;
    transaction_type: string;
    activity_type: string;
}

const { width } = Dimensions.get('window');

const QrConfirmation = ({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'QrConfirmation'>) => {

    const { user } = useUser();
    const {QRResult} = route.params;
    const [qrInfo, setQrInfo] = useState<QrInfo | null>(null);
    const [ balance, setBalance ] = useState(0);

    useEffect(() => {
        console.log("QR Result: ", QRResult);
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        try {
          // Replace with your actual API URL
          const response = await fetch(`https://9kz2rcl6-8000.inc1.devtunnels.ms/get-balance?id=${user?.user_id}`);
          const data = await response.json();
          
          // Assuming the API returns an object with step counts for each day
          console.log("Balance : ", data)
          setBalance(data);
        } catch (error) {
          console.error('Error fetching step data:', error);
        }
    };

    const creditDebit = async() => {
        try {
            const response = await fetch('http://172.16.0.60:8002/new-transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "user_id": user?.user_id,
                    "transaction_type": qrInfo?.transaction_type,
                    "activity_type": qrInfo?.activity_type,
                    "amount": qrInfo?.amount,
                }),
            });
    
            if (response.ok){
                ToastAndroid.show('Redeemed Successfully', ToastAndroid.SHORT);
                navigation.navigate("Home");
                console.log("DONE");
            }
        }
        catch (error) {
            Alert.alert(
                "Failed!",
                "Network error. Please try again shortly.",
                [{ text: "OK", style: "default" }]
            );
            console.log("Error in creditDebit:", error);
    
        }
    };

    const handleRedeem = () => {
        console.log("QR Info: ", qrInfo?.amount);
        console.log("Balance: ", balance);
        if ((qrInfo?.amount ?? 0) > balance) {
            Alert.alert(
                "OOPS!",
                "Insufficient balance to redeem this QR code.",
                [{ text: "OK", style: "default" }]
            );
            return;
        }
        else if ((qrInfo?.amount ?? 0) <= balance) {
            Alert.alert(
                "Redeem Confirmation",
                `Are you sure you want to redeem ${qrInfo?.amount} Fit Points?`,
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    {
                        text: "Redeem",
                        onPress: () => {
                            creditDebit();
                        }
                    }
                ]
            );
        }
    };

    useEffect(() => {
        const data = typeof QRResult === 'string' ? JSON.parse(QRResult) : QRResult;
        setQrInfo(data);
        fetchBalance();
    }, [QRResult]);

    return (
        <SafeAreaView style={styles.flexContainer}>
            <LinearGradient colors={['#ffffff', '#D9F8FB']} style={styles.flexContainer}>
                {/* Header with a close button */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.closeButton}>
                        <Icon1 name="close" size={30} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Main content area */}
                <View style={styles.contentContainer}>
                    {/* Vendor Info */}
                    <View style={styles.vendorContainer}>
                        <View style={styles.vendorIconCircle}>
                            <Icon name="swimmer" size={40} color="#114D5B" />
                        </View>
                        <Text style={styles.vendorName}>{qrInfo?.Name}</Text>
                        <Text style={styles.vendorSubtitle}>Paying with Fit Points {balance}</Text>
                    </View>

                    {/* Amount to Redeem */}
                    <View style={styles.amountContainer}>
                        <Text style={styles.amountText}>{qrInfo?.amount}</Text>
                        <Text style={styles.amountLabel}>fp</Text>
                    </View>
                </View>

                {/* Footer with the Redeem button */}
                <View style={styles.footer}>
                     <Text style={styles.redeemValue}>Current Balance: {balance} fp</Text>
                    <TouchableOpacity style={styles.payButton} onPress={handleRedeem}>
                        <Text style={styles.payButtonText}>Redeem</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        padding: 15,
    },
    closeButton: {
        padding: 5,
    },
    contentContainer: {
        flex: 1, // Takes up all available space between header and footer
        justifyContent: 'center', // Centers content vertically
        alignItems: 'center',
        paddingHorizontal: width * 0.05,
    },
    vendorContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    vendorIconCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(17, 77, 91, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    vendorName: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
    },
    vendorSubtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginTop: 30, // Space between vendor info and amount
    },
    amountText: {
        fontSize: 80,
        fontWeight: 'bold',
        color: '#114D5B',
        lineHeight: 88,
    },
    amountLabel: {
        fontSize: 26,
        fontWeight: '600',
        color: '#114D5B',
        marginLeft: 8,
        marginBottom: 12,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    redeemValue: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        marginBottom: 10,
    },
    payButton: {
        backgroundColor: '#114D5B',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    payButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default QrConfirmation;