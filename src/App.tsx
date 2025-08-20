import React, { useEffect, useState } from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';

import Login from './screens/Login';
import Register from './screens/Register';
import Home from './screens/Home';
import Profile from './screens/Profile';
import WelcomePage from './screens/quizScreens/WelcomePage';
import ActivityLifestyle from './screens/quizScreens/ActivityLifestyle';
import BloodGroup from './screens/quizScreens/BloodGroup';
import GenderDOBPage from './screens/quizScreens/GenderDOBPage';
import StepCounterPage from './screens/quizScreens/StepCounterPage';
import WeightHeightPage from './screens/quizScreens/WeightHeightPage';
import ActivityTracker from './screens/ActivityTracker';
import LeaderBoard from './screens/LeaderBoard';
import Friends from './screens/Friends';
import EditProfile from './screens/EditProfile';
import Achievements from './screens/Achievements';
import Rewardssystem from './screens/Rewardssystem';
import TypeStepCount from './screens/TypeStepCount';
import CreditScreen from './screens/CreditScreen';
import CalorieGoal from './screens/quizScreens/CalorieGoal';
import { UserProvider, useUser } from './contexts/UserContext';
import { StepCountProvider } from './contexts/StepCounterContext';
import { getUserData, hasAlertBeenShown, saveAlertStatus } from './tasks/Storage';
import { ActivityIndicator, Alert, NativeModules, Permission, PermissionsAndroid, Platform, View } from 'react-native';
import SplashScreen from './screens/SplashScreen';
import About from './screens/About';
import QrConfirmation from './screens/QrConfirmation';
import QrScreen from './screens/QrScreen';

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
    BloodGroup: {
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
    CalorieGoal: {
      username: string;
      phone_number: string;
      email: string;
      password: string;
      gender: string,
      DOB: string,
      height: number,
      weight: number,
      blood: string,
      experience: string,
      stepgoal: number
  };
    Home: undefined;
    Profile: undefined;
    ActivityTracker: {isSelected: boolean};
    LeaderBoard: undefined;
    Friends: undefined;
    EditProfile: undefined;
    Achievements: undefined;
    Rewardssystem: undefined;
    TypeStepCount: undefined;
    About: undefined;
    CreditScreen: undefined;
    QrScreen: undefined;
    QrConfirmation: { 
      QRResult: string | undefined;
    };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const requestAllPermissions = async () => {
  // We only need to ask for permissions on Android
  if (Platform.OS !== 'android') {
    return true;
  }

  const permissionsToRequest: Permission[] = [];

  // Activity Recognition: Required for Android 10 (API 29) and above
  if (Platform.Version >= 29) {
    permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION);
  }

  // Post Notifications: Required for Android 13 (API 33) and above for the foreground service
  if (Platform.Version >= 33) {
    permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  }

  // If we don't need to request any permissions (e.g., on an older Android version)
  if (permissionsToRequest.length === 0) {
    return true; // All good to go
  }

  try {
    // Request all permissions at once
    const granted = await PermissionsAndroid.requestMultiple(permissionsToRequest);

    const isActivityRecognitionGranted =
      Platform.Version < 29 || granted[PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION] === PermissionsAndroid.RESULTS.GRANTED;

    const isPostNotificationsGranted =
      Platform.Version < 33 || granted[PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS] === PermissionsAndroid.RESULTS.GRANTED;

    if (isActivityRecognitionGranted && isPostNotificationsGranted) {
      console.log('All required permissions granted! Starting service');
      NativeModules.StartStepServiceModule.startService();
      return true;
    } else {
      console.log('Some permissions were denied.');
      return false;
    }
  } catch (err) {
    console.warn(err);
    return false;
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

    requestAllPermissions();
    
    showAlertIfNeeded()

    const checkUserStatus = async () => {
      const userData = await getUserData();  // Fetch user data
      setIsLoggedIn(!!userData);  // If user data exists, set logged in to true
    };

    checkUserStatus();  // Check on app start

  }, []);

  getUserData().then((userData) => {
    if (userData) {
      console.log("userData outside", userData);
    }
  });

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
        <StepCountProvider>
            <NavigationContainer>
              <Stack.Navigator initialRouteName={isLoggedIn ? 'Home' : 'Login'} >
                  <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
                  <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
                  <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
                  <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
                  <Stack.Screen name="WelcomePage" component={WelcomePage} options={{ headerShown: false }} />
                  <Stack.Screen name="ActivityLifestyle" component={ActivityLifestyle} options={{ headerShown: false }} />
                  <Stack.Screen name="BloodGroup" component={BloodGroup} options={{ headerShown: false }} />
                  <Stack.Screen name="GenderDOBPage" component={GenderDOBPage} options={{ headerShown: false }} />
                  <Stack.Screen name="WeightHeightPage" component={WeightHeightPage} options={{ headerShown: false }} />
                  <Stack.Screen name="StepCounterPage" component={StepCounterPage} options={{ headerShown: false }} />
                  <Stack.Screen name="ActivityTracker" component={ActivityTracker} options={{ headerShown: false }} />
                  <Stack.Screen name="LeaderBoard" component={LeaderBoard} options={{ headerShown: false }} />
                  <Stack.Screen name="Friends" component={Friends} options={{ headerShown: false }} />
                  <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: false }} />
                  <Stack.Screen name="Achievements" component={Achievements} options={{ headerShown: false }} />
                  <Stack.Screen name="Rewardssystem" component={Rewardssystem} options={{ headerShown: false }} />
                  <Stack.Screen name="TypeStepCount" component={TypeStepCount} options={{ headerShown: false }} />
                  <Stack.Screen name="About" component={About} options={{ headerShown: false }} />
                  <Stack.Screen name="CreditScreen" component={CreditScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="CalorieGoal" component={CalorieGoal} options={{ headerShown: false }} />
                  <Stack.Screen name="QrConfirmation" component={QrConfirmation} options={{ headerShown: false }} />
                  <Stack.Screen name="QrScreen" component={QrScreen} options={{ headerShown: false }} />
              </Stack.Navigator>
            </NavigationContainer>
        </StepCountProvider>
    </UserProvider>

  );
}

export default App;
