import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Foundation from 'react-native-vector-icons/Foundation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { height } = Dimensions.get('window');

type BottomNavBarProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, keyof RootStackParamList>;
    activeTab: string;
    setActiveTab: (tabName: string) => void;
};

const BottomNavBar = ({ navigation, activeTab, setActiveTab }: BottomNavBarProps) => {
    const renderTabIcon = (iconName: string, tabName: keyof RootStackParamList, iconType: 'Foundation' | 'FontAwesome5') => {
        const navigateToTab = () => {
            // Ensure correct parameter handling for each tab
            if (tabName === 'WelcomePage') {
                navigation.navigate('WelcomePage', {
                    username: 'defaultUsername',
                    phone_number: 'defaultPhoneNumber',
                    email: 'defaultEmail',
                    password: 'defaultPassword',
                });
            } else if(tabName === 'ActivityTracker'){
                navigation.navigate('ActivityTracker', {isSelected : true})
            }
            else {
                navigation.navigate(tabName as any); // Fallback for tabs with no parameters
            }
        };
    
        return (
            <TouchableOpacity
                style={[styles.navItem, activeTab === tabName && styles.activeTab]}
                onPress={() => {
                    setActiveTab(tabName);
                    navigateToTab();
                }}
            >
                <View
                    style={[
                        styles.iconContainer,
                        activeTab === tabName && styles.activeIconContainer,
                    ]}
                >
                    {/* Conditionally render icons from different packs */}
                    {iconType === 'Foundation' ? (
                        <Foundation
                            name={iconName}
                            size={23}
                            color={activeTab === tabName ? '#333333' : '#333333'}
                        />
                    ) : iconType === 'FontAwesome5' ? (
                        <FontAwesome5
                            name={iconName}
                            size={23}
                            color={activeTab === tabName ? '#333333' : '#333333'}
                        />
                    ) : (
                        <MaterialIcons
                            name={iconName}
                            size={23}
                            color={activeTab === tabName ? '#333333' : '#333333'}
                        />
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.bottomNav}>

            {renderTabIcon('home', 'Home', 'FontAwesome5')}

            {renderTabIcon('running', 'ActivityTracker', 'FontAwesome5')}

            {renderTabIcon('trophy', 'LeaderBoard', 'FontAwesome5')}

            {renderTabIcon('users', 'Friends', 'FontAwesome5')}
            
            {renderTabIcon('user', 'Profile', 'FontAwesome5')}
        </View>
    );
};

const styles = StyleSheet.create({
    bottomNav: {
        position: 'absolute',
        bottom: 15,
        left: 10,
        right: 10,
        height: height * 0.075,
        backgroundColor: '#A1C6D0',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderRadius: 10,
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
