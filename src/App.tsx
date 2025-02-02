import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';  // To format date as YYYY-MM-DD

import BackgroundService from 'react-native-background-actions';
const { StepCounterModule } = NativeModules;

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';

import Login from './screens/Login';
import Register from './screens/Register';
import Home from './screens/Home';
import Profile from './screens/Profile';
import WelcomePage from './screens/quizScreens/WelcomePage';
import ActivityLifestyle from './screens/quizScreens/ActivityLifestyle';
import DietaryPreference from './screens//quizScreens/DietaryPreference';
import GenderDOBPage from './screens/quizScreens/GenderDOBPage';
import StepCounterPage from './screens/quizScreens/StepCounterPage';
import WeightHeightPage from './screens/quizScreens/WeightHeightPage';
import ActivityTracker from './screens/ActivityTracker';
import LeaderBoard from './screens/LeaderBoard';
import Friends from './screens/Friends';
import EditProfile from './screens/EditProfile';
import Achievements from './screens/Achievements';

import { UserProvider } from './contexts/UserContext';
import { StepCounterProvider, useStepCounter } from './contexts/StepCounterContext';
import { getUserData, hasAlertBeenShown, saveAlertStatus } from './tasks/Storage';
import { ActivityIndicator, Alert, NativeModules, PermissionsAndroid, Platform, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import stepDetector from './tasks/StepCounterTask';
import SplashScreen from './screens/SplashScreen';

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
        blood: string
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
        blood: string,
        experience: string
    };
    Home: undefined;
    Profile: undefined;
    ActivityTracker: {isSelected: boolean};
    LeaderBoard: undefined;
    Friends: undefined;
    EditProfile: undefined;
    Achievements: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

let stepCount = 0;


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
    await BackgroundService.start(() => stepDetector({ delay: 1000, setStepCount }), options);
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

const checkAndResetSteps = (userId: string) => {

    const intervalId = setInterval(() => {

        const now = new Date();
        if (now.getHours() === 23 && now.getMinutes() === 55) {

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

const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    // Check for Activity Recognition permission
    const activityRecognitionGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION
    );

    if (activityRecognitionGranted) {
      console.log('Activity Recognition permission is already granted.');
    } else {
      const activityRecognitionResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
        {
          title: 'Activity Recognition Permission',
          message: 'The app needs to track your activity for step counting.',
          buttonPositive: 'OK',
        }
      );
      console.log(
        activityRecognitionResult === PermissionsAndroid.RESULTS.GRANTED
          ? 'Activity Recognition permission granted.'
          : 'Activity Recognition permission denied.'
      );
    }

    // Check for Foreground Service permission (Android 11+)
    if (Platform.Version >= 30) {
      const foregroundServiceGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.FOREGROUND_SERVICE
      );

      if (foregroundServiceGranted) {
        console.log('Foreground Service permission is already granted.');
      } else {
        const foregroundServiceResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.FOREGROUND_SERVICE,
          {
            title: 'Foreground Service Permission',
            message: 'The app needs to run in the background to count steps.',
            buttonPositive: 'OK',
          }
        );
        console.log(
          foregroundServiceResult === PermissionsAndroid.RESULTS.GRANTED
            ? 'Foreground Service permission granted.'
            : 'Foreground Service permission denied.'
        );
      }
    }
    if (Platform.Version >= 23) {
      StepCounterModule.requestIgnoreBatteryOptimization()
        .then((result: any) => {
          console.log(result);  // Log the result of battery optimization request
        })
        .catch((error: any) => {
          console.log('Error requesting battery optimization:', error);
        });
    }
  }
};

const showAlertIfNeeded = async () => {
  const hasShown = await hasAlertBeenShown();
  if (!hasShown) {
      Alert.alert(
          'Important Notice',
          'To ensure proper functionality, please enable background activity and disable battery optimisation for this app in your Battery Settings. After making the change, restart the app.',
          [
              {
                  text: 'OK',
                  onPress: async () => {
                      await saveAlertStatus();
                  },
              },
          ]
      );
  }
};

function App(): React.JSX.Element {

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);  // Will hold login state
  const [isSplashComplete, setIsSplashComplete] = useState(false); // Track splash screen completion


  useEffect(() => {

    requestPermissions();

    showAlertIfNeeded()

    const checkUserStatus = async () => {
      const userData = await getUserData();  // Fetch user data
      setIsLoggedIn(!!userData);  // If user data exists, set logged in to true
    };

    checkUserStatus();  // Check on app start
}, []);

  if (!isSplashComplete) {
    return <SplashScreen onAnimationEnd={() => setIsSplashComplete(true)} />;
  }

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
            <Stack.Navigator initialRouteName={isLoggedIn ? 'Home' : 'Login'} >
                <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
                <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
                <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
                <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
                <Stack.Screen name="WelcomePage" component={WelcomePage} options={{ headerShown: false }} />
                <Stack.Screen name="ActivityLifestyle" component={ActivityLifestyle} options={{ headerShown: false }} />
                <Stack.Screen name="DietaryPreference" component={DietaryPreference} options={{ headerShown: false }} />
                <Stack.Screen name="GenderDOBPage" component={GenderDOBPage} options={{ headerShown: false }} />
                <Stack.Screen name="WeightHeightPage" component={WeightHeightPage} options={{ headerShown: false }} />
                <Stack.Screen name="StepCounterPage" component={StepCounterPage} options={{ headerShown: false }} />
                <Stack.Screen name="ActivityTracker" component={ActivityTracker} options={{ headerShown: false }} />
                <Stack.Screen name="LeaderBoard" component={LeaderBoard} options={{ headerShown: false }} />
                <Stack.Screen name="Friends" component={Friends} options={{ headerShown: false }} />
                <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: false }} />
                <Stack.Screen name="Achievements" component={Achievements} options={{ headerShown: false }} />
            </Stack.Navigator>
            </NavigationContainer>
        </StepCounterProvider>
    </UserProvider>

  );
}

export default App;
