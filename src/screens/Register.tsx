import { View, Text } from 'react-native'
import React from 'react'

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { SafeAreaView } from 'react-native-safe-area-context';

import FontAwesome from 'react-native-vector-icons/FontAwesome';

type RegisterProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

const Register = ({navigation}: RegisterProps) => {
    return (
        <SafeAreaView>
            <View>
                <Text>Register</Text>
                <FontAwesome name='home' size={30} onPress={()=>navigation.navigate("Home")}/>
            </View>
        </SafeAreaView>
    )
}

export default Register;