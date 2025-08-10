/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import { backgroundTask } from './src/tasks/BackgroundTask';

AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerHeadlessTask("BackgroundStepTask", () => backgroundTask);