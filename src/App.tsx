import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';  // To format date as YYYY-MM-DD

import BackgroundService from 'react-native-background-actions';
import { accelerometer } from 'react-native-sensors';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';

import Login from './screens/Login';
import Register from './screens/Register';
import Home from './screens/Home';
import Profile from './screens/Profile';
import Statistics from './screens/Statistics';
import WelcomePage from './screens/WelcomePage';
import ActivityLifestyle from './screens/ActivityLifestyle';
import DietaryPreference from './screens/DietaryPreference';
import GenderDOBPage from './screens/GenderDOBPage';
import StepCounterPage from './screens/StepCounterPage';
import WeightHeightPage from './screens/WeightHeightPage';


import { UserProvider } from './contexts/UserContext';
import { StepCounterProvider, useStepCounter } from './contexts/StepCounterContext';
import { getUserData } from './tasks/Storage';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


enableScreens();

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;

    WelcomePage: {
        username: string;
        phone_number: string;
        email: string;
        password: string;
    };
    GenderDOBPage: {
        username: string;
        phone_number: string;
        email: string;
        password: string;
    };
    WeightHeightPage:{
        username: string;
        phone_number: string;
        email: string;
        password: string;
        gender: string,
        DOB: string,
    };
    DietaryPreference: {
        username: string;
        phone_number: string;
        email: string;
        password: string;
        gender: string,
        DOB: string,
        height: number,
        weight: number
    };
    ActivityLifestyle: {
        username: string;
        phone_number: string;
        email: string;
        password: string;
        gender: string,
        DOB: string,
        height: number,
        weight: number,
        diet: string
    };
    StepCounterPage: {
        username: string;
        phone_number: string;
        email: string;
        password: string;
        gender: string,
        DOB: string,
        height: number,
        weight: number,
        diet: string,
        experience: string
    };
    Home: undefined;
    Profile: undefined;
    Statistics: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Constants for step detection
const alpha = 0.7; // Low-pass filter constant
const STEP_THRESHOLD = 2.5; // Adjust for more or less sensitivity
const MIN_STEP_INTERVAL = 300; // Minimum time interval between steps in ms
const CLICK_THRESHOLD = 1.7; // Acceleration threshold to filter out clicks/taps

let gravity = { x: 0, y: 0, z: 0 };
let lastStepTime = 0;
let lastClickTime = 0;
let stepCount = 0;

const task = async (taskData?: { delay: number; setStepCount: (count: number) => void }) => {
    const { delay, setStepCount } = taskData || { delay: 1000, setStepCount: () => {} };

  console.log('Background Step Counter Task Running...');

  // Gravity & Step Detection Logic
  const fallbackAccelerometerLogic = (sensorData: any) => {
    // Apply low-pass filter to remove gravity
    gravity.x = alpha * gravity.x + (1 - alpha) * sensorData.x;
    gravity.y = alpha * gravity.y + (1 - alpha) * sensorData.y;
    gravity.z = alpha * gravity.z + (1 - alpha) * sensorData.z;

    const linearAcceleration = {
      x: sensorData.x - gravity.x,
      y: sensorData.y - gravity.y,
      z: sensorData.z - gravity.z,
    };

    const totalAcceleration = Math.sqrt(
      linearAcceleration.x ** 2 +
        linearAcceleration.y ** 2 +
        linearAcceleration.z ** 2
    );

    const now = Date.now();

    // Ignore clicks/taps
    if (totalAcceleration > CLICK_THRESHOLD && now - lastClickTime > 500) {
      lastClickTime = now;
      return;
    }

    // Detect steps and log step count
    if (
      totalAcceleration > STEP_THRESHOLD &&
      now - lastStepTime > MIN_STEP_INTERVAL
    ) {
      stepCount += 1;
      console.log(`Step Detected! Total Steps: ${stepCount}`);
      setStepCount(stepCount);
      lastStepTime = now;
    }
  };

  // Save the updated step count to AsyncStorage
  const saveStepCount = async () => {
    try {
        await AsyncStorage.setItem('stepCount', stepCount.toString());
        console.log('Step count saved to AsyncStorage:', stepCount);
    } catch (error) {
        console.error('Failed to save step count to AsyncStorage', error);
    }
  };


  try {
    // Start accelerometer subscription
    const subscription = accelerometer.subscribe(
      (data) => fallbackAccelerometerLogic(data),
      (error) => {
        console.error('Accelerometer error:', error);
      }
    );

    await new Promise<void>((resolve) => {
      setInterval(() => {
        console.log('Background task still running...');
        saveStepCount();  // Save the step count whenever it's updated
      }, delay);
    });

    subscription.unsubscribe();
  } catch (error) {
    console.error('Error in background task:', error);
  }
};

// Background Service options
const options = {
  taskName: 'StepCounterTask',
  taskTitle: 'Step Counter Running',
  taskDesc: 'Counting your steps in the background',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#FF5733',
  parameters: {
    delay: 1000,
  },
};

const startBackgroundService = async (setStepCount: (count: number) => void) => {
    try {
      console.log('Starting Background Step Counter...');
      await BackgroundService.start(() => task({ delay: 500, setStepCount }), options);
      console.log('Background Step Counter Started');
    } catch (error) {
      console.error('Error starting background task:', error);
    }
};

const updateStepsAtEndOfDay = async (userId: string, stepCount: number) => {
    const date = format(new Date(), 'yyyy-MM-dd');
  
    try {
        const response = await fetch('https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/update-steps', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            user_id: userId,
            date: date,
            steps: stepCount,
            }),
    });

    if (!response.ok) {
        throw new Error('Failed to update steps');
    }

    console.log('Steps updated successfully');

    } catch (error) {
        console.error('Error updating steps:', error);
    }
};

  
// Function to check and reset step count every day at 11 PM
const checkAndResetSteps = (userId: string) => {

    const intervalId = setInterval(() => {

        const now = new Date();
        if (now.getHours() === 23 && now.getMinutes() === 0) {

            updateStepsAtEndOfDay(userId, stepCount);
            stepCount = 0;  // Reset the step count for the next day

        }
    }, 60000); // Check every minute

    return intervalId; // Return the intervalId for cleanup
};

const AppWrapper = () => {
  const { setStepCount } = useStepCounter();

    useEffect(() => {
        console.log('AppWrapper useEffect triggered');

        const loadStepCount = async () => {
          try {
            const storedStepCount = await AsyncStorage.getItem('stepCount');
            if (storedStepCount) {
              console.log('Step count loaded from AsyncStorage:', storedStepCount);
              setStepCount(parseInt(storedStepCount)); // Initialize the stepCount
            } else {
              console.log('No step count found in AsyncStorage.');
              setStepCount(0); // Initialize with 0 if no value is found
            }
          } catch (error) {
            console.error('Failed to load step count', error);
          }
      };
  
      loadStepCount(); // Load the step count on app start
      
      const fetchUserData = async () => {
          const userData = await getUserData(); // Fetch all user data (not just user_id)
          
          if (userData) {
              console.log('User Data found:', userData);

              // Start background service for step counting
              startBackgroundService(setStepCount);

              // Check and reset steps daily
              const intervalId = checkAndResetSteps(userData.user_id);  // Use user_id from the fetched data              

              // Clean up the interval when the component unmounts
              return () => clearInterval(intervalId);
          }
      };

      fetchUserData(); // Fetch the user data when the component mounts
  }, []);

  return null; // No rendering needed here
};


function App(): React.JSX.Element {

    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);  // Will hold login state

    useEffect(() => {
        const checkUserStatus = async () => {
        const userData = await getUserData();  // Fetch user data
        setIsLoggedIn(!!userData);  // If user data exists, set logged in to true
        };
        
        checkUserStatus();  // Check on app start
    }, []);

    if (isLoggedIn === null) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          );
    }

  return (
    <UserProvider>
        <StepCounterProvider>
            <AppWrapper />
            <NavigationContainer>
            <Stack.Navigator initialRouteName={isLoggedIn ? 'Home' : 'Login'}>
                <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
                <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
                <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
                <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
                <Stack.Screen name="Statistics" component={Statistics} options={{ headerShown: false }} />
                <Stack.Screen name="WelcomePage" component={WelcomePage} options={{ headerShown: false }} />
                <Stack.Screen name="ActivityLifestyle" component={ActivityLifestyle} options={{ headerShown: false }} />
                <Stack.Screen name="DietaryPreference" component={DietaryPreference} options={{ headerShown: false }} />
                <Stack.Screen name="GenderDOBPage" component={GenderDOBPage} options={{ headerShown: false }} />
                <Stack.Screen name="WeightHeightPage" component={WeightHeightPage} options={{ headerShown: false }} />
                <Stack.Screen name="StepCounterPage" component={StepCounterPage} options={{ headerShown: false }} />
            </Stack.Navigator>
            </NavigationContainer>
        </StepCounterProvider>
    </UserProvider>

  );
}

export default App;
