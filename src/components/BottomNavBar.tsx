import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Foundation from 'react-native-vector-icons/Foundation';
import { RootStackParamList } from '../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { height } = Dimensions.get('window');

type BottomNavBarProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  activeTab: string;
  setActiveTab: (tabName: string) => void;
};

const BottomNavBar = ({ navigation, activeTab, setActiveTab }: BottomNavBarProps) => {
  const renderTabIcon = (iconName: string, tabName: string, isFoundation = false) => (
    <TouchableOpacity
      style={[styles.navItem, activeTab === tabName && styles.activeTab]}
      onPress={() => {
        setActiveTab(tabName);
        navigation.navigate(tabName as keyof RootStackParamList);
      }}
    >
      <View
        style={[
          styles.iconContainer,
          activeTab === tabName && styles.activeIconContainer,
        ]}
      >
        {isFoundation ? (
          <Foundation
            name={iconName}
            size={24}
            color={activeTab === tabName ? '#0C284D' : '#C4C4C4'}
          />
        ) : (
          <Icon
            name={iconName}
            size={24}
            color={activeTab === tabName ? '#0C284D' : '#C4C4C4'}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.bottomNav}>
      {renderTabIcon('home-outline', 'Home')}
      {renderTabIcon('run-fast', 'Activities')}
      {renderTabIcon('trophy-outline', 'Leaderboard')}
      {renderTabIcon('graph-bar', 'Statistics', true)}
      {renderTabIcon('account-outline', 'Profile')}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0.08,
    backgroundColor: '#0C284D',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
  },
  navItem: {
    padding: 10,
  },
  activeTab: {
    padding: 10,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  activeIconContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // White circle background for active tab
  },
});

export default BottomNavBar;
