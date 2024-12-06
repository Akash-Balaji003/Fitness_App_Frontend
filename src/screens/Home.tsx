import { View, Text } from 'react-native'
import React from 'react'

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type LoginProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const Home = ({navigation}: LoginProps) => {
    return (
        <View>
            <Text>Home</Text>
        </View>
    )
}

export default Home;