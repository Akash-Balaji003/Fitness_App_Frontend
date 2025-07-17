import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../App'; // Assuming you have this
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// The RootStackParamList in App.tsx should be updated to pass pointsToRedeem
// type RootStackParamList = {
//   ...
//   RedeemScreen: { vendorName: string; vendorIcon: string; pointsToRedeem: number; };
// };

const { width } = Dimensions.get('window');

const RedeemScreen = ({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'RedeemScreen'>) => {
    // Data is now passed entirely through route params
    const { vendorName, vendorIcon, pointsToRedeem } = route.params || { 
        vendorName: 'TP Swimming Complex', 
        vendorIcon: 'water-outline',
        pointsToRedeem: 40 // Default value for demonstration
    };

    const handleRedeem = () => {
        // Add your logic for processing the redemption here
        console.log(`Redeeming ${pointsToRedeem} points at ${vendorName}`);
        // Example: Navigate to a success screen or back to home
        navigation.navigate('Home'); 
    };

    return (
        <SafeAreaView style={styles.flexContainer}>
            <LinearGradient colors={['#ffffff', '#D9F8FB']} style={styles.flexContainer}>
                {/* Header with a close button */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                        <Icon name="close" size={30} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Main content area */}
                <View style={styles.contentContainer}>
                    {/* Vendor Info */}
                    <View style={styles.vendorContainer}>
                        <View style={styles.vendorIconCircle}>
                            <Icon name={vendorIcon} size={30} color="#114D5B" />
                        </View>
                        <Text style={styles.vendorName}>{vendorName}</Text>
                        <Text style={styles.vendorSubtitle}>Paying with Fit Points</Text>
                    </View>

                    {/* Amount to Redeem */}
                    <View style={styles.amountContainer}>
                        <Text style={styles.amountText}>{pointsToRedeem}</Text>
                        <Text style={styles.amountLabel}>fp</Text>
                    </View>
                </View>

                {/* Footer with the Redeem button */}
                <View style={styles.footer}>
                     <Text style={styles.redeemValue}>Redeem Value: ₹{ (pointsToRedeem * 0.089).toFixed(2) }</Text>
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

export default RedeemScreen;