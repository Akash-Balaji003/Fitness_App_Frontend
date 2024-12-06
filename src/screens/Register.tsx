import { View, Text } from 'react-native'
import React from 'react'

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { SafeAreaView } from 'react-native-safe-area-context';

type LoginProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

const Register = ({navigation}: LoginProps) => {
    return (
        <SafeAreaView>
            <View>
                <Text>Register</Text>
            </View>
        </SafeAreaView>
    )
}

export default Register;