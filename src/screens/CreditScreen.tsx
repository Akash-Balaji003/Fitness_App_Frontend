import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BottomNavBar from '../components/BottomNavBar';

const { width, height } = Dimensions.get('window');
const calculatePercentage = (percentage: number, dimension: number) => (percentage / 100) * dimension;

const CreditSystem = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'CreditScreen'>) => {
      const [activeTab, setActiveTab] = useState('CreditScreen');
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [expandedTransaction, setExpandedTransaction] = useState<number | null>(null);

    const transactions = [
        {
            title: 'Swimming @ TP Swimming Pool',
            points: '-40 fp',
            date: '2025-02-20',
            details: []
        },
        {
            title: '10 Day Streak!',
            points: '+120 fp',
            date: '2025-02-15',
            details: [
                { description: 'You have walked 7000 steps', points: '+70 fp' },
                { description: 'You have burnt 243 cals', points: '+50 fp' }
            ]
        },
        {
            title: 'First Place in Leaderboard',
            points: '+50 fp',
            date: '2025-02-10',
            details: []
        },
        {
            title: '10000 cals burnt! MILESTONE',
            points: '+300 fp',
            date: '2025-02-05',
            details: []
        },
        {
            title: 'Bye Bye 20 day streak :(',
            points: '-100 fp',
            date: '2025-01-30',
            details: []
        }
    ];

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={30} color="black" style={styles.arrowIcon} />
            </TouchableOpacity>
            <Icon name="wallet" size={30} color="black" style={styles.walletIcon} />
        </View>
    );

    const renderCreditContainer = () => (
        <View style={styles.creditContainer}>
            <Text style={styles.fitPoints}>500</Text>
            <Text style={styles.fitPointsLabel}>Fit Points</Text>
            <Text style={styles.redeemText}>Redeem ₹44.67</Text>
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

    const renderTransactions = () => (
      <ScrollView 
          contentContainerStyle={{}} // Extra padding at bottom
          showsVerticalScrollIndicator={false} 
      >
          <View style={styles.transactionList}>
              {transactions.map((item, index) => (
                  <View key={index}>
                      <TouchableOpacity 
                          style={styles.transactionItem} 
                          onPress={() => setExpandedTransaction(expandedTransaction === index ? null : index)}
                      >
                          <Text style={styles.transactionTitle}>{item.title}</Text>
                          <Text style={styles.transactionPoints}>{item.points}</Text>
                      </TouchableOpacity>
                      <Text style={styles.transactionDate}>{item.date}</Text>
  
                      {expandedTransaction === index && (
                          <View style={styles.dropdownContainer}>
                              <Text style={styles.dropdownTitle}>Daily reward</Text>
                              <Text style={styles.dropdownPoints}>{item.points}</Text>
                              {item.details.map((detail, detailIndex) => (
                                  <View key={detailIndex} style={styles.subDetail}>
                                      <Text style={styles.subDetailText}>{detail.description}</Text>
                                      <Text style={styles.subDetailPoints}>{detail.points}</Text>
                                  </View>
                              ))}
                              <TouchableOpacity onPress={() => setExpandedTransaction(null)}>
                                  <Text style={styles.showLess}>Show less ▲</Text>
                              </TouchableOpacity>
                          </View>
                      )}
                  </View>
              ))}
          </View>
      </ScrollView>
  );  

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#ffffff', '#B1F0F7']}
                style={styles.container}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >            
                {renderHeader()}
                {renderCreditContainer()}
                <Text style={styles.historyHeading}>Transaction History</Text>
                {renderFilters()}
                {renderTransactions()}
                <BottomNavBar
                    navigation={navigation}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
            </LinearGradient>
        </SafeAreaView>
    );
};

export default CreditSystem;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: calculatePercentage(2, height)
    },
    arrowIcon: {
        marginLeft: calculatePercentage(2, width)
    },
    walletIcon: {
        marginRight: calculatePercentage(2, width)
    },
    creditContainer: {
        backgroundColor: '#114D5B',
        borderRadius: 15,
        padding: 25,
        alignItems: 'center',
        marginVertical: calculatePercentage(0.5, height),
        marginHorizontal: calculatePercentage(6, width)
    },
    fitPoints: {
        fontSize: 45,
        fontWeight: 'bold',
        color: 'white'
    },
    fitPointsLabel: {
        fontSize: 18,
        color: '#888'
    },
    redeemText: {
        fontSize: 16,
        color: '#00c853'
    },
    historyHeading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: calculatePercentage(1, height),
        marginLeft: calculatePercentage(2, width),
    },
    filterContainer: {
        flexDirection: 'row',
        marginVertical: calculatePercentage(1, height),
        marginLeft: calculatePercentage(2, width),
    },
    filterButton: {
        paddingHorizontal: 15,
        paddingVertical: 4,
        borderRadius: 20,
        backgroundColor: '#eee',
        marginRight: 20,
        marginBottom:calculatePercentage(1.5, height),
        height: calculatePercentage(4.5, height),
        justifyContent: 'center',
        alignItems: 'center'
    },
    selectedFilter: {
        backgroundColor: '#3b5998'
    },
    filterText: {
        color: '#333333'
    },
    filterTextSelected: {
      color: '#fff'
    },
    transactionList: {
      marginTop: calculatePercentage(1, height),
      marginHorizontal: calculatePercentage(2, width),
      marginBottom: calculatePercentage(31, height), // Prevents cutoff
      height: calculatePercentage(40, height), // Prevents cutoff
      gap: 10
  },
  dropdownContainer: {
      backgroundColor: '#f5f5f5',
      padding: 10,
      borderRadius: 10,
      marginBottom: calculatePercentage(1, height), // Adds space after dropdown
  },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10
    },
    transactionTitle: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
    },
    transactionPoints: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    transactionDate: {
        color: '#777',
        marginTop: -8, 
    },
    dropdownTitle: {
        fontWeight: 'bold'
    },
    subDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    showLess: {
        textAlign: 'right',
        color: '#3b5998',
        marginTop: 5
    },
    dropdownPoints: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#00c853', // Green color to indicate points earned
      textAlign: 'right',
      marginVertical: calculatePercentage(0.5, height),
  },
  subDetailText: {
      fontSize: 14,
      color: '#555', // Dark grey for better readability
      flex: 1, // Allows text to take up available space
  },
  subDetailPoints: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#00c853', // Green to indicate positive points
      textAlign: 'right',
  }
});
