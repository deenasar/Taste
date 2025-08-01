import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import './backgroundMessageHandler';
import App from './App';
import { name as appName } from './app.json';

// Standard React Native entry point for native mobile apps
AppRegistry.registerComponent(appName, () => App);
