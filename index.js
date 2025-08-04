/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import BackgroundFetch from 'react-native-background-fetch';
import backgroundTask from './src/tasks/BackgroundTask.ts';

AppRegistry.registerComponent(appName, () => App);

// Headless JS task for background-fetch
const HeadlessTask = async (event) => {
  console.log('[BackgroundFetch HeadlessTask] start: ', event);

  try {
    await backgroundTask(); // your actual background logic
  } catch (error) {
    console.error('Headless backgroundTask error:', error);
  }

  // Required: Signal completion of your task to native code
  BackgroundFetch.finish(event.taskId);
};

BackgroundFetch.registerHeadlessTask(HeadlessTask);
