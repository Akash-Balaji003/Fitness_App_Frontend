import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { StepProvider } from "./contexts/StepCounterContext";


import Login from './screens/Login';
import Register from './screens/Register';
import Home from './screens/Home';

enableScreens(); 

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
	Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {

	return (
        <StepProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName='Login'>
                    <Stack.Screen name='Login' component={Login} options={{ headerShown: false }} />
                    <Stack.Screen name='Register' component={Register} options={{ headerShown: false }} />
                    <Stack.Screen name='Home' component={Home} options={{ headerShown: false }} />
                </Stack.Navigator>
            </NavigationContainer>
        </StepProvider>
	);
}

export default App;
