import { Dimensions, Platform, ToastAndroid, Alert } from 'react-native';
import { Icons } from '../assets/icons';

import { MaterialIcons } from '@expo/vector-icons';

export const HEADER_MARGIN_TOP = 50;
export const MAX_HEADER_HEIGHT = Platform.OS === 'ios' ? 130 : 66;
export const MIN_HEADER_HEIGHT = 60;

export function shouldForceCollapsed(pageLength) {
    const screenHeight = Dimensions.get('window').height;
    return pageLength !== null && (pageLength / 1.1) < screenHeight;
}

export const themeOptions = [
    {
        label: 'System',
        value: 'system',
        icon: <Icons.Ion name="phone-portrait-outline" size={16} />,
    },
    {
        label: 'Light',
        value: 'light',
        icon: <Icons.Ion name="sunny-outline" size={16} />,
    },
    {
        label: 'Dark',
        value: 'dark',
        icon: <Icons.Ion name="moon-outline" size={16} />,
    },
];

export const privacyOptions = [
    {
        label: 'Off',
        value: 'off',
        icon: <Icons.Ion name="eye-outline" size={16} />,
    },
    {
        label: 'Mask',
        value: 'mask',
        icon: <Icons.Ion name="lock-closed-outline" size={16} />,
    },
    {
        label: 'Jumble',
        value: 'jumble',
        icon: <Icons.Ion name="shuffle-outline" size={16} />,
    },
];

export const lockoutOptions = [
    {
        label: 'Instant',
        value: '0',
        icon: <Icons.Ion name="flash-outline" size={16} />,
    },
    {
        label: '30 seconds',
        value: '30000',
        icon: <Icons.Ion name="time-outline" size={16} />,
    },
    {
        label: '1 minute',
        value: '60000',
        icon: <Icons.Ion name="alarm-outline" size={16} />,
    },
    //5min
    {
        label: '5 minutes',
        value: '300000',
        icon: <Icons.Ion name="timer-outline" size={16} />,
    },
    //15min
    {
        label: '15 minutes',
        value: '900000',
        icon: <Icons.Ion name="timer-outline" size={16} />,
    },
    //30min
    {
        label: '30 minutes',
        value: '1800000',
        icon: <Icons.Ion name="timer-outline" size={16} />,
    },
    {
        label: 'Never',
        value: 'never',
        icon: <Icons.Ion name="close-circle-outline" size={16} />,
    },
];

export const sortOptions = [
    { label: 'Priority', value: 'priority', icon: <MaterialIcons name="flag" size={16} /> },
    { label: 'Time Left', value: 'timeLeft', icon: <MaterialIcons name="hourglass-empty" size={16} /> },
    { label: 'Recurring', value: 'recurring', icon: <MaterialIcons name="repeat" size={16} /> },
    { label: 'Non-Recurring', value: 'nonRecurring', icon: <MaterialIcons name="remove-circle-outline" size={16} /> },
];

export const jumbleText = (str) => {
    // Replace each character with a random letter (except spaces)
    return str.split('').map(char =>
        char === ' ' ? ' ' : String.fromCharCode(97 + Math.floor(Math.random() * 26))
    ).join('');
};

export const maskText = (str) => {
    // Replace each character with an asterisk (except spaces)
    return str.split('').map(char => (char === ' ' ? ' ' : '*')).join('');
};

export const showToast = (msg) => {
    if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
        Alert.alert('Error', msg);
    }
};

/*
function check        { npm run check }
function doctor       { npm run doctor }
function checkall     { npm run checkall }

function startapp     { npm run start }              # Starts Expo server
function startweb     { npm run web }                # Starts in browser

function runandroid   { npx expo run:android }       # Bare workflow build & run
function runios       { npx expo run:ios }

function clean        { npx expo start -c }          # Start with cache cleared

function buildapk     { eas build --profile production --platform android }
function buildios     { eas build --profile production --platform ios }

*/