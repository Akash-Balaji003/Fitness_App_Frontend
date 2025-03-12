import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomNavBar from '../components/BottomNavBar';  // Assuming the path is correct
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');
const calculatePercentage = (percentage: number, dimension: number) => (percentage / 100) * dimension;

//Main Component Section
const CreditSystem = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'CreditScreen'>) => {
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [expandedTransaction, setExpandedTransaction] = useState(null);
  
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

    // Header Section
    const renderHeader = () => (
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={30} color="black" style={styles.arrowIcon} />
          </TouchableOpacity>
          <Icon name="wallet" size={30} color="black" style={styles.walletIcon} />
        </View>
      );

    // Credit Container
    const renderCreditContainer = () => (
    <View style={styles.creditContainer}>
        <Text style={styles.fitPoints}>500</Text>
        <Text style={styles.fitPointsLabel}>Fit Points</Text>
        <Text style={styles.redeemText}>Redeem ₹44.67</Text>
    </View>
    );
    
    // Transaction Filters
    const filters = ['All', 'Calories Burnt', 'Swimming', 'Activity'];
  
    const renderFilters = () => (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity 
            key={filter}
            style={[styles.filterButton, selectedFilter === filter && styles.selectedFilter]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={styles.filterText}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );

    // Transaction List with Drop-down Details
    
    const renderTransactions = () => (
        <ScrollView>
        <View style={styles.transactionList}>
          {transactions.map((item, index) => (
            <View key={index}>
              <TouchableOpacity 
                style={styles.transactionItem} 
                onPress={() => 
                    {const [expandedTransaction, setExpandedTransaction] = useState<number | null>(null);}
                }
              >
                <Text style={styles.transactionTitle}>{item.title}</Text>
                <Text style={styles.transactionPoints}>{item.points}</Text>
              </TouchableOpacity>
              <Text style={styles.transactionDate}>{item.date}</Text>
              
              {expandedTransaction === index && (
                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownTitle}>Daily reward</Text>
                  <Text style={styles.dropdownPoints}>+120 fp</Text>
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
                    colors={['#ffffff', '#B1F0F7']} // White to #0095B7 gradient
                    style={styles.container}
                    start={{ x: 0, y: 0 }} // Gradient direction (top-left)
                    end={{ x: 1, y: 1 }} // Gradient direction (bottom-right)
                >            
                {renderHeader()}
                {renderCreditContainer()}
                <Text style={styles.historyHeading}>Transaction History</Text>
                {renderFilters()}
                {renderTransactions()}
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
        background: {
          flex: 1,
          paddingHorizontal: calculatePercentage(5, width)
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
          marginVertical: calculatePercentage(2, height),
          marginLeft: calculatePercentage(6, width),
          marginRight: calculatePercentage(6, width)
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
          marginTop: calculatePercentage(2, height),
          marginLeft: calculatePercentage(2, width),
        },
        filterContainer: {
          flexDirection: 'row',
          marginVertical: calculatePercentage(2, height),
          marginLeft: calculatePercentage(2, width),
          marginBottom: calculatePercentage(0, height),
        },
        filterButton: {
          paddingHorizontal: 15,
          paddingVertical: 8,
          borderRadius: 20,
          backgroundColor: '#eee',
          marginRight: 20
        },
        selectedFilter: {
          backgroundColor: '#3b5998'
        },
        filterText: {
          color: '#fff'
        },
        transactionList: {
          marginVertical: calculatePercentage(2, height),
          marginLeft: calculatePercentage(2, width),
          marginRight: calculatePercentage(2, width),
          marginTop: calculatePercentage(0.5, width),
        },
        transactionItem: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: 41
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
          marginTop: -18, 
        },
        dropdownContainer: {
          backgroundColor: '#f5f5f5',
          padding: 10,
          borderRadius: 10
        },
        dropdownTitle: {
          fontWeight: 'bold'
        },
        dropdownPoints: {
          textAlign: 'right'
        },
        subDetail: {
          flexDirection: 'row',
          justifyContent: 'space-between'
        },
        subDetailText: {
          color: '#555'
        },
        subDetailPoints: {
          color: '#00c853'
        },
        showLess: {
          textAlign: 'right',
          color: '#3b5998',
          marginTop: 5
        }
      });
      
