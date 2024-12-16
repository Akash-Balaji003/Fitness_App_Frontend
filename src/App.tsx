import React from 'react';
import { StyleSheet } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';

// Import your screens
import CalorieTracker from './screens/CalorieTracker';
import DietRecommendation from './screens/DietRecommendation.tsx';
import FoodSelectionPage from './screens/FoodSelectionPage';
import ExtrasPage from './screens/ExtrasPage.tsx';
import ActivityStart from './screens/ActivityStart.tsx';

enableScreens();

export type RootStackParamList = {
  CalorieTracker: undefined;
  DietRecommendation: undefined;
  FoodSelectionPage: undefined;
  ExtrasPage: undefined;
  ActivityStart: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ActivityStart">
        <Stack.Screen
          name="CalorieTracker"
          component={CalorieTracker}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DietRecommendation"
          component={DietRecommendation}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FoodSelectionPage"
          component={FoodSelectionPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ExtrasPage"
          component={ExtrasPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
        name="ActivityStart" 
        component={ActivityStart}
        options={{ headerShown: false }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});

export default App;
