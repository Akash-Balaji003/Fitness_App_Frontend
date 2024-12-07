import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Foundation from 'react-native-vector-icons/Foundation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

const { height, width } = Dimensions.get('window');

type BottomNavBarProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, keyof RootStackParamList>;
  activeTab: string;
  setActiveTab: (tabName: string) => void;
};

const BottomNavBar = ({ navigation, activeTab, setActiveTab }: BottomNavBarProps) => {
  const renderTabIcon = (iconName: string, tabName: keyof RootStackParamList, isFoundation = false) => (
    <TouchableOpacity
      style={[styles.navItem, activeTab === tabName && styles.activeTab]}
      onPress={() => {
        setActiveTab(tabName);
        navigation.navigate(tabName);
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
      {renderTabIcon('run-fast', 'Login')}
      {renderTabIcon('trophy-outline', 'Register')}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 15,
    left:10,
    right:10,
    height: height * 0.075,
    backgroundColor: '#2c2c2e',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius:10,
    elevation: 3,
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
    backgroundColor: 'white',
    borderRadius: 20,
  },
});

export default BottomNavBar;
