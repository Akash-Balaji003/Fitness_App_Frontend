import React, { useState, useEffect } from 'react';
import { View, Button, Text, ToastAndroid, PermissionsAndroid, Alert, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import GoogleFit, {
  Scopes,
} from 'react-native-google-fit';


const BACKEND_URL = 'https://hchjn6x7-8000.inc1.devtunnels.ms';

const App = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [stepCount, setStepCount] = useState<number | null>(null);
  const [Distance, setDistance] = useState<number | null>(null);
  const [heartRate, setHeartRate] = useState<number | null>(null);

  useEffect(() => {
    const requestActivityRecognitionPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
          {
            title: 'Activity Recognition Permission',
            message: 'We need access to your fitness data to show step counts.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permission granted');
          return true;
        } else {
          console.log('Permission denied');
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    };

    requestActivityRecognitionPermission();
    
    const handleDeepLink = async (event: { url: any; }) => {
      const { url } = event;
      console.log('🚀 Deep link URL:', url);
      const code1 = new URL(url).searchParams.get('code');
      console.log('Extracted Code:', code1);  // Log the extracted code
      
      if (url.includes('/auth/callback?code=')) {
        const code = new URL(url).searchParams.get('code');        
        try {
          const codeVerifier = await AsyncStorage.getItem('code_verifier');
          if (!code) {
            console.error('❌ No code found in the URL');
            ToastAndroid.show('Failed to login: No code found', ToastAndroid.SHORT);
            return;
          }
          if (!codeVerifier) {
            console.error('❌ No code verifier found in AsyncStorage');
            ToastAndroid.show('Failed to login: Code verifier missing', ToastAndroid.SHORT);
            return;
          }

          console.log("📦 Code: ", code);
          console.log("📦 Code Verifier: ", codeVerifier);          
          const response = await fetch(`${BACKEND_URL}/auth/callback?code=${encodeURIComponent(code)}&code_verifier=${encodeURIComponent(codeVerifier)}`);
          const { access_token } = await response.json();
          
          if (access_token) {
            console.log('✅ Login successful, access token received:', access_token);
            setAccessToken(access_token);
            ToastAndroid.show('Login Successful', ToastAndroid.SHORT);
          } else {
            console.error('❌ No access token received from the backend');
            ToastAndroid.show('Failed to login: No access token', ToastAndroid.SHORT);
          }
        } catch (error) {
          console.error('❌ Error during callback:', error);
          ToastAndroid.show('Failed to login', ToastAndroid.SHORT);
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) handleDeepLink({ url: initialUrl });
    })();

    return () => subscription.remove();
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`);
      const { login_url, code_verifier } = await response.json();

      if (code_verifier) {
        await AsyncStorage.setItem('code_verifier', code_verifier);
        console.log("📦 Code verifier stored in AsyncStorage: ", code_verifier);
      }

      if (login_url) {
        console.log("🔗 Opening login URL: ", login_url);
        Linking.openURL(login_url);
      } else {
        ToastAndroid.show('Login URL not received', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('❌ Login request failed', error);
      ToastAndroid.show('Login failed', ToastAndroid.SHORT);
    }
  };

  const fetchFitnessData = async () => {

    try {
        const tokenResponse = await fetch(`${BACKEND_URL}/get/token?id=200`); // Should pass user id
        const tokenData = await tokenResponse.json();
        const accessTokenDB = tokenData.access_token; // Extract the access token

        const response = await fetch(`${BACKEND_URL}/fit/data?access_token=${accessTokenDB}`);
        const data = await response.json();
        
        const stepCount = data?.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal ?? 0;
        const distance = data?.bucket?.[1]?.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal ?? 0; // Distance in meters
        const heartRate = data?.bucket?.[2]?.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal ?? 0; // BPM
        
        console.log('Full response:', data);
        setStepCount(stepCount);
        setDistance(distance);
        setHeartRate(heartRate);
        console.log('✅ Step count fetched: ', stepCount);
        console.log('✅ Distance fetched: ', distance, 'meters');
        console.log('✅ Heart rate fetched: ', heartRate, 'bpm');
    } catch (error) {
      console.error('❌ Failed to fetch fitness data:', error);
      ToastAndroid.show('Failed to fetch fitness data', ToastAndroid.SHORT);
    }
  };


  return (
    <View style={{ padding: 20 , gap:50 }}>
      <Button title="Login with Google Fit" onPress={handleLogin} />
      <Button title="Get Step Count" onPress={fetchFitnessData} />
      {stepCount !== null && <Text style={{color:"black"}}>Step Count: {stepCount}</Text>}
      {Distance !== null && <Text style={{color:"black"}}>Distance: {Distance}</Text>}
      {heartRate !== null && <Text style={{color:"black"}}>Heart Rate: {heartRate}</Text>}
    </View>
  );
};

export default App;
