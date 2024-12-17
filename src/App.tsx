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

import Login from './screens/Login';
import Register from './screens/Register';
import Home from './screens/Home';
import Home2 from './screens/Home2';
import { UserProvider } from './contexts/UserContext';
import { StepCounterProvider } from './contexts/StepCounterContext';

enableScreens(); 

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
	Home: undefined;
    Home2: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {

	return (
        <StepCounterProvider>
            <UserProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName='Login'>
                        <Stack.Screen name='Login' component={Login} options={{ headerShown: false }} />
                        <Stack.Screen name='Register' component={Register} options={{ headerShown: false }} />
                        <Stack.Screen name='Home' component={Home} options={{ headerShown: false }} />
                        <Stack.Screen name='Home2' component={Home2} options={{ headerShown: false }} />
                    </Stack.Navigator>
                </NavigationContainer>
            </UserProvider>
        </StepCounterProvider>
	);
}

export default App;
