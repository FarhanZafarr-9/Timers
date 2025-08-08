// utils/ignoreWarnings.js
import { LogBox } from 'react-native';

// Add any dev-only warning messages you want to hide here
const IGNORED_WARNINGS = [
    'expo-notifications: Android Push notifications', // Expo Go push notifications warning
    'Warning: Text strings must be rendered within a <Text> component.', // Specific warning you want to ignore
];

export function setupIgnoredWarnings() {
    if (__DEV__) {
        LogBox.ignoreLogs(IGNORED_WARNINGS);
    }
}
