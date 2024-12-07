import { View, Text } from 'react-native'
import React, { useState } from 'react'

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { SafeAreaView } from 'react-native-safe-area-context';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BottomNavBar from '../components/BottomNavBar';

type RegisterProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

const Register = ({navigation}: RegisterProps) => {
    const [activeTab, setActiveTab] = useState('Register');
    return (
        <SafeAreaView style={{flex:1}}>
            <View>
                <Text>Register</Text>
                <FontAwesome name='home' size={30} onPress={()=>navigation.navigate("Home")}/>
            </View>
            {/* Bottom Navigation Bar */}
            <BottomNavBar
                navigation={navigation}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
        </SafeAreaView>
    )
}

export default Register;