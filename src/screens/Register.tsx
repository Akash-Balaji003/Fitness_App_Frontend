import { View, Text } from 'react-native'
import React from 'react'

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type LoginProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

const Register = ({navigation}: LoginProps) => {
    return (
        <View>
            <Text>Register</Text>
        </View>
    )
}

export default Register;