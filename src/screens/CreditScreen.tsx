import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, LayoutAnimation, UIManager, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BottomNavBar from '../components/BottomNavBar';
import { useUser } from '../contexts/UserContext';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get('window');
const calculatePercentage = (percentage: number, dimension: number) => (percentage / 100) * dimension;

// --- Helper Types for Data ---
interface ApiTransaction {
    transaction_id: number;
    transaction_type: 'earn' | 'spend';
    activity_type: string;
    amount: number;
    created_at: string;
}

interface FormattedTransaction {
    id: number;
    title: string;
    points: number;
    date: string;
    type: 'credit' | 'debit';
    icon: string;
    details: any[];
}


const CreditSystem = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'CreditScreen'>) => {
    const { user } = useUser();

    const [activeTab, setActiveTab] = useState('CreditScreen');
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [expandedTransaction, setExpandedTransaction] = useState<number | null>(null);

    const [transactions, setTransactions] = useState<FormattedTransaction[]>([]);
    const [balance, setBalance] = useState(0); // State for the balance
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getIconForActivity = (activity: string): string => {
        switch (activity.toLowerCase()) {
            case 'steps': return 'walk-outline';
            case 'calories': return 'flame-outline';
            case 'redeem': return 'wallet-outline';
            case 'swimming': return 'water-outline';
            default: return 'cash-outline';
        }
    };

    // --- Function to fetch the user's balance ---
    const fetchBalance = async () => {
        try {
          const response = await fetch(`http://172.16.0.60:8002/get-balance?id=${user?.user_id}`);
          const data = await response.json();
          
          // Assuming the API returns a direct number or an object like { balance: 500 }
          // If it's an object, you might need data.balance
          console.log("Balance data received: ", data);
          setBalance(data.balance || data || 0); // Handle both cases: object or direct number
        } catch (error) {
          console.error('Error fetching balance:', error);
          // Optionally set an error state for the balance card
        }
    };

    const fetchTransactions = async () => {
        // This function remains the same
        if (!user?.user_id) {
            setError("User not found. Cannot fetch transactions.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const API_URL = `http://172.16.0.60:8002/get-transaction?id=${user.user_id}`; 
        
        try {
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`HTTP ${response.status}: Could not fetch transaction history. ${errorBody}`);
            }

            const data: ApiTransaction[] = await response.json();
            const formattedData = data.map((item): FormattedTransaction => {
                const isCredit = item.transaction_type === 'earn';
                return {
                    id: item.transaction_id,
                    title: `${isCredit ? 'Earned from' : 'Spent on'} ${item.activity_type}`,
                    points: isCredit ? item.amount : -item.amount,
                    date: new Date(item.created_at).toISOString().split('T')[0],
                    type: isCredit ? 'credit' : 'debit',
                    icon: getIconForActivity(item.activity_type),
                    details: []
                };
            });

            setTransactions(formattedData);
        } catch (e: any) {
            console.error("Fetch Error:", e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };
    
    // --- Updated useEffect to fetch both balance and transactions ---
    useEffect(() => {
        if (user?.user_id) {
            // Fetch both in parallel for efficiency
            Promise.all([fetchTransactions(), fetchBalance()]);
        }
    }, [user]);


    const toggleExpand = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedTransaction(expandedTransaction === index ? null : index);
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={30} color="black" style={styles.arrowIcon} />
            </TouchableOpacity>
            <View style={styles.rightHeaderIcons}>
                <TouchableOpacity onPress={() => navigation.navigate('RedeemScreen' as any, { pointsToRedeem: 40 })}>
                    <Icon name="qr-code-outline" size={30} color="black" style={styles.qrIcon} onPress={() => navigation.navigate("QrScreen")} />
                </TouchableOpacity>
            </View>
        </View>
    );

    // --- Updated renderCreditContainer to use dynamic balance ---
    const renderCreditContainer = () => (
        <View style={styles.creditContainer}>
            <Text style={styles.fitPoints}>{balance}</Text>
            <Text style={styles.fitPointsLabel}>Fit Points</Text>
            {/* Assuming the conversion rate is 1 point = ₹0.089 */}
            <Text style={styles.redeemText}>Redeem ₹{(balance * 0.0909).toFixed(2)}</Text>
        </View>
    );

    const filters = ['All', 'Calories Burnt', 'Swimming', 'Activity'];

    const renderFilters = () => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            {filters.map((filter) => (
                <TouchableOpacity
                    key={filter}
                    style={[styles.filterButton, selectedFilter === filter && styles.selectedFilter]}
                    onPress={() => setSelectedFilter(filter)}
                >
                    <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextSelected]}>{filter}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const renderTransactionList = () => {
        if (loading) {
            return <ActivityIndicator size="large" color="#114D5B" style={{ flex: 1 }} />;
        }

        if (error) {
            return <Text style={styles.errorText}>{error}</Text>;
        }
        
        if (transactions.length === 0) {
            return <Text style={styles.errorText}>No transactions found.</Text>;
        }

        return (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.transactionListContainer} showsVerticalScrollIndicator={false}>
                {transactions.map((item, index) => {
                    const isExpanded = expandedTransaction === index;
                    const pointColor = item.type === 'credit' ? styles.pointsCredit : styles.pointsDebit;
                    const pointPrefix = item.type === 'credit' ? '+' : '';

                    return (
                        <View key={item.id} style={styles.transactionCard}>
                            <TouchableOpacity style={styles.transactionItem} onPress={() => toggleExpand(index)}>
                                <Icon name={item.icon} size={24} color="#114D5B" style={styles.transactionIcon} />
                                <View style={styles.transactionDetails}>
                                    <Text style={styles.transactionTitle}>{item.title}</Text>
                                    <Text style={styles.transactionDate}>{item.date}</Text>
                                </View>
                                <View style={styles.transactionPointsContainer}>
                                    <Text style={[styles.transactionPoints, pointColor]}>{`${pointPrefix}${item.points} fp`}</Text>
                                    <Icon name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"} size={20} color="#888" />
                                </View>
                            </TouchableOpacity>

                            {isExpanded && (
                                <View style={styles.dropdownContainer}>
                                    <Text style={styles.dropdownTitle}>Breakdown</Text>
                                    {item.details.length > 0 ? (
                                        item.details.map((detail, detailIndex) => (
                                            <View key={detailIndex} style={styles.subDetail}>
                                                <Text style={styles.subDetailText}>{detail.description}</Text>
                                                <Text style={styles.subDetailPoints}>{`+${detail.points} fp`}</Text>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={styles.subDetailText}>No further details available.</Text>
                                    )}
                                </View>
                            )}
                        </View>
                    );
                })}
            </ScrollView>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#ffffff', '#B1F0F7']} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={{ flex: 1 }}>
                    {renderHeader()}
                    {renderCreditContainer()}
                    <Text style={styles.historyHeading}>Transaction History</Text>
                    {renderFilters()}
                    {renderTransactionList()}
                </View>

                <BottomNavBar navigation={navigation} activeTab={activeTab} setActiveTab={setActiveTab} />
            </LinearGradient>
        </SafeAreaView>
    );
};

export default CreditSystem;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    gradient: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: calculatePercentage(2, height) },
    arrowIcon: { marginLeft: calculatePercentage(4, width) },
    rightHeaderIcons: { flexDirection: 'row', alignItems: 'center' },
    qrIcon: { marginRight: calculatePercentage(4, width) },
    walletIcon: { marginRight: calculatePercentage(2, width) },
    creditContainer: { backgroundColor: '#114D5B', borderRadius: 15, padding: 25, alignItems: 'center', marginVertical: calculatePercentage(0.5, height), marginHorizontal: calculatePercentage(6, width) },
    fitPoints: { fontSize: 45, fontWeight: 'bold', color: 'white' },
    fitPointsLabel: { fontSize: 18, color: '#888' },
    redeemText: { fontSize: 16, color: '#00c853' },
    historyHeading: { fontSize: 24, fontWeight: 'bold', marginTop: calculatePercentage(1, height), marginLeft: calculatePercentage(4, width), marginBottom: 10 },
    filterContainer: { flexDirection: 'row', maxHeight: calculatePercentage(6, height), marginVertical: calculatePercentage(1, height), paddingLeft: calculatePercentage(4, width) },
    filterButton: { paddingHorizontal: 15, paddingVertical: 4, borderRadius: 20, backgroundColor: '#eee', marginRight: 15, height: calculatePercentage(4.5, height), justifyContent: 'center', alignItems: 'center' },
    selectedFilter: { backgroundColor: '#114D5B' },
    filterText: { color: '#333333' },
    filterTextSelected: { color: '#fff' },
    transactionListContainer: { paddingHorizontal: calculatePercentage(4, width), paddingBottom: 90, flexGrow: 1 },
    transactionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    transactionIcon: {
        marginRight: 15,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    transactionDate: {
        fontSize: 13,
        color: '#777',
        marginTop: 2,
    },
    transactionPointsContainer: {
        alignItems: 'flex-end',
    },
    transactionPoints: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    pointsCredit: {
        color: '#2e7d32',
    },
    pointsDebit: {
        color: '#d32f2f',
    },
    dropdownContainer: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginTop: 15,
        paddingTop: 15,
    },
    dropdownTitle: {
        fontWeight: 'bold',
        marginBottom: 10,
        fontSize: 14,
    },
    subDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    subDetailText: {
        fontSize: 14,
        color: '#555',
    },
    subDetailPoints: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2e7d32',
    },
    errorText: {
        flex: 1,
        textAlign: 'center',
        textAlignVertical: 'center',
        color: '#d32f2f',
        fontSize: 16,
        paddingHorizontal: 20,
    }
});
