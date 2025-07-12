import { Dimensions, Platform, ToastAndroid, Alert } from 'react-native';
import { Icons } from '../assets/icons';

import { MaterialIcons } from '@expo/vector-icons';

export const HEADER_MARGIN_TOP = 50;
export const MAX_HEADER_HEIGHT = 66;
export const MIN_HEADER_HEIGHT = 60;

export function shouldForceCollapsed(pageLength) {
    const screenHeight = Dimensions.get('window').height;
    return (pageLength !== null && (pageLength / 1.1) < screenHeight);
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
        label: 'Disabled',
        value: 'never',
        icon: <Icons.Ion name="close-circle-outline" size={16} />,
    },
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
];

export const sortOptions = [
    { label: 'Priority', value: 'priority', icon: <MaterialIcons name="flag" size={16} /> },
    { label: 'Time Left', value: 'timeLeft', icon: <MaterialIcons name="hourglass-empty" size={16} /> },
    { label: 'Recurring', value: 'recurring', icon: <MaterialIcons name="repeat" size={16} /> },
    { label: 'Non-Recurring', value: 'nonRecurring', icon: <MaterialIcons name="remove-circle-outline" size={16} /> },
];

export const priorityOptions = [
    { label: 'High', value: 'high', icon: <Icons.Ion name="flag" size={16} color="#ff0000" /> },
    { label: 'Medium', value: 'normal', icon: <Icons.Ion name="flag" size={16} color="#ffa500" /> },
    { label: 'Low', value: 'low', icon: <Icons.Ion name="flag" size={16} color="#008000" /> },
];

export const navOptions = [
    {
        label: 'Floating',
        value: 'floating',
        icon: <Icons.Ion name="layers-outline" size={16} />,
    },
    {
        label: 'Fixed',
        value: 'fixed',
        icon: <Icons.Ion name="home-outline" size={16} />,
    },
    //side navigation
    {
        label: 'Side',
        value: 'side',
        icon: <Icons.Ion name="menu-outline" size={16} />,
    },
];

export const headerOptions = [
    {
        label: 'Minimized',
        value: 'minimized',
        icon: <Icons.Ion name="remove-outline" size={16} />
    },
    {
        label: 'Fixed',
        value: 'fixed',
        icon: <Icons.Ion name="home-outline" size={16} />,
    },
    {
        label: 'Collapsible',
        value: 'collapsible',
        icon: <Icons.Material name="unfold-more" size={16} />
    },
];

export const recurrenceOptions = [
    {
        label: 'Daily',
        value: '1 day',
        icon: <Icons.Ion name="repeat-outline" size={16} />,
    },
    {
        label: 'Weekly',
        value: '1 week',
        icon: <Icons.Ion name="calendar-outline" size={16} />,
    },
    {
        label: 'Fortnightly',
        value: '2 weeks',
        icon: <Icons.Ion name="repeat-outline" size={16} />,
    },
    {
        label: 'Monthly',
        value: '1 month',
        icon: <Icons.Ion name="calendar-outline" size={16} />,
    },
    {
        label: 'Quarterly',
        value: '3 months',
        icon: <Icons.Ion name="repeat-outline" size={16} />,
    },
    {
        label: 'Annually',
        value: '1 year',
        icon: <Icons.Ion name="calendar-outline" size={16} />,
    },
];

export const borderOptions = [
    {
        label: 'Subtle',
        value: 'subtle',
        icon: <Icons.Ion name="checkmark-outline" size={16} />,
    },
    {
        label: 'None',
        value: 'none',
        icon: <Icons.Ion name="close-outline" size={16} />,
    },

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

export const appVersion = '1.0.14';

export const changelog = [
    {
        version: "1.0.14",
        date: "2025-07-12",
        title: "Changelog spacing & alignment",
        major: false,
        changes: [
            "Fixed wrapped line alignment",
            "Added vertical spacing",
            "Improved line height"
        ]
    },
    {
        version: "1.0.13",
        date: "2025-07-12",
        title: "Notification Bug fixed Finally! 🎉",
        major: false,
        changes: [
            "💥 Fixed the scheduling bug where notifications were not delayed correctly.",
            "🔍 Root cause: was missing the property inside trigger: 'type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL', which is required for Expo to understand it's a time interval trigger.",
            "🛠️ Added the missing 'type' field to the trigger object, ensuring the notification waits for the specified seconds before firing.",
            "🚀 Refactored the notification scheduling function to be dynamic, now accepts time (in seconds), title, and message as parameters.",
            "✨ Updated how the function is called throughout the app to pass these dynamic values, improving flexibility.",
            "🧹 Cleaned up redundant old notification code and made the data payload simpler."
        ]
    },
    {
        version: "1.0.12",
        date: "2025-07-12",
        title: "Notification Bug fix Probably (7)",
        major: false,
        changes: [
            "Changed setup and calling notificaions logic",
        ]
    },
    {
        version: "1.0.11",
        date: "2025-07-12",
        title: "Notification Bug fix Probably (6)",
        major: false,
        changes: [
            "Added more intervals for testing",
            "Added timer interval testing",
            "Disabled show alert"
        ]
    },
    {
        version: "1.0.10",
        date: "2025-07-12",
        title: "Notification Bug fix Probably (5)",
        major: false,
        changes: [
            "Added timer interval testing",
            "Tried to Fix a class bug "
        ]
    },
    {
        version: "1.0.9",
        date: "2025-07-12",
        title: "Notification Bug fix Probably (4)",
        major: false,
        changes: [
            "Added timer interval testing",
            "Tried to Fix a class bug "
        ]
    },
    {
        version: "1.0.8",
        date: "2025-07-12",
        title: "Notification Bug fix Probably (3)",
        major: false,
        changes: [
            "Tried to Fix a class bug "
        ]
    },
    {
        version: "1.0.7",
        date: "2025-07-12",
        title: "Notification Bug fix Probably (2)",
        major: false,
        changes: [
            "Tried to Fix a class bug "
        ]
    },
    {
        version: "1.0.6",
        date: "2025-07-12",
        title: "Notification Bug fix",
        major: false,
        changes: [
            "Tried to Fix a class bug "
        ]
    },
    {
        version: "1.0.5",
        date: "2025-07-12",
        title: "Notification Bug fixes",
        major: false,
        changes: [
            "TimerContext works fine now",
            "Fixed a class bug "
        ]
    },
    {
        version: "1.0.4",
        date: "2025-07-12",
        title: "New Dark Mode Enhancements",
        major: false,
        changes: [
            "Improved dark mode contrast",
            "Faster theme switching"
        ]
    },
    {
        version: "1.0.3",
        date: "2025-07-12",
        title: "New Dark Mode Enhancements",
        major: false,
        changes: [
            "Improved dark mode contrast",
            "Faster theme switching"
        ]
    },
    {
        version: "1.0.2",
        date: "2025-07-11",
        title: "Performance Update",
        major: true,
        changes: [
            "Major optimizations",
            "Minor UI improvements"
        ]
    }
];



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