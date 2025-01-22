import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { accelerometer } from 'react-native-sensors';

let stepCount = 0; // Track total steps
const alpha = 0.7; // Low-pass filter constant
const STEP_THRESHOLD = 2.5; // Adjust for more or less sensitivity
const MIN_STEP_INTERVAL = 300; // Minimum time interval between steps in ms
const CLICK_THRESHOLD = 1.7; // Acceleration threshold to filter out clicks/taps

let lastStepTime = Date.now();
let lastClickTime = Date.now();
let gravity = { x: 0, y: 0, z: 0 }; // Gravity component
let lastHandledAppState = ''; // Track the last handled app state

const stepDetector = async (taskData?: { delay: number; setStepCount: (count: number) => void }): Promise<void> => {
    const { setStepCount } = taskData || { setStepCount: () => {} };
  
    console.log('Background Step Counter Task Running...');
  
    const fallbackAccelerometerLogic = (sensorData: any) => {
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
    
        if (totalAcceleration > CLICK_THRESHOLD && now - lastClickTime > 500) {
            lastClickTime = now;
            return;
        }
    
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
  
    const saveStepCount = async () => {
        try {
            await AsyncStorage.setItem('stepCount', stepCount.toString());
            console.log('Step count saved to AsyncStorage:', stepCount);
        } catch (error) {
            console.error('Failed to save step count:', error);
        }
    };
  
    const handleAppStateChange = async (nextAppState: string) => {
        // Ensure only one save operation occurs per state change
        if (nextAppState !== lastHandledAppState) {
            lastHandledAppState = nextAppState; // Update last handled state

            if (nextAppState === 'background' || nextAppState === 'inactive') {
                await saveStepCount();
                console.log('App is transitioning to background or inactive.');
            } else if (nextAppState === 'active') {
                await saveStepCount();
                console.log('App has come to the foreground!');
            }
        }
    };
  
    try {
        // Subscribe to accelerometer
        const accelerometerSubscription = accelerometer.subscribe(
            (data) => fallbackAccelerometerLogic(data),
            (error) => console.error('Accelerometer error:', error)
        );
    
        // Subscribe to app state changes
        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    
        // Prevent the task from exiting
        await new Promise(() => {});
    
        // Cleanup (not actually called, but ensures type consistency)
        accelerometerSubscription.unsubscribe();
        appStateSubscription.remove();

    } catch (error) {
        console.error('Error in step detector:', error);
    }
};

export default stepDetector;
