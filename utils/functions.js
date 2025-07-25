import { Dimensions, Platform, ToastAndroid, Alert } from 'react-native';
import { Icons } from '../assets/icons';
import { MaterialIcons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import { View, Text } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import * as Crypto from 'expo-crypto';


import { useRef, useEffect } from 'react';

export function useRenderLogger(name = 'Component') {
    const count = useRef(1);
    useEffect(() => {
        if (__DEV__) {
            console.log(`[RENDER] ${name} → Render Count: ${count.current}`);
            count.current += 1;
        }
    });
}

export async function checkForUpdateAndReload() {
    if (__DEV__) {
        console.log("🚀 Skipping OTA check in Expo Go (__DEV__ mode).");
        return 'dev-mode';
    }

    try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
            console.log("✅ New update found, downloading...");
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
            return 'updated';
        } else {
            console.log("👍 App is up to date.");
            return 'up-to-date';
        }
    } catch (err) {
        console.log("⚠️ Expo update check failed:", err);
        return 'error';
    }
}

export const HEADER_MARGIN_TOP = 50;
export const MAX_HEADER_HEIGHT = 66;
export const MIN_HEADER_HEIGHT = 60;

const ENCRYPTION_KEY_STORAGE = 'ENCRYPTION_KEY';

export function shouldForceCollapsed(pageLength) {
    const screenHeight = Dimensions.get('window').height;
    return (pageLength !== null && (pageLength / 1.1) < screenHeight);
}

export const themeOptions = [
    { label: 'System', value: 'system', icon: <Icons.Ion name="phone-portrait-outline" size={16} />, description: 'Sync with your phone or OS setting' },
    { label: 'Light', value: 'light', icon: <Icons.Ion name="sunny-outline" size={16} />, description: 'Crisp whites and high-contrast text' },
    { label: 'Dark', value: 'dark', icon: <Icons.Ion name="moon-outline" size={16} />, description: 'Deep blacks, easy on the eyes at night' },
];

export const accentOptions = [
    { label: 'Mono', value: 'default', icon: <Icons.Ion name="contrast-outline" size={16} />, description: 'Sleek grayscale, zero color distraction' },
    { label: 'Blue', value: 'blue', icon: <Icons.Ion name="color-palette-outline" size={16} color="#3b82f6" />, description: 'Calm, professional sky-blue highlights' },
    { label: 'Green', value: 'green', icon: <Icons.Ion name="leaf-outline" size={16} color="#22c55e" />, description: 'Fresh minty pops for natural focus' },
    { label: 'Purple', value: 'purple', icon: <Icons.Ion name="flower-outline" size={16} color="#a855f7" />, description: 'Electric violet sparks for bold flair' },
    { label: 'Rose', value: 'rose', icon: <Icons.Ion name="rose-outline" size={16} color="#f43f5e" />, description: 'Soft coral touches, warm and friendly' },
    { label: 'Amber', value: 'amber', icon: <Icons.Ion name="sunny-outline" size={16} color="#f59e0b" />, description: 'Golden amber warmth, cheerful highlights' },
    { label: 'Teal', value: 'teal', icon: <Icons.Ion name="water-outline" size={16} color="#14b8a6" />, description: 'Deep teal ocean vibes, tranquil feel' },
    { label: 'Indigo', value: 'indigo', icon: <Icons.Ion name="ellipse-outline" size={16} color="#6366f1" />, description: 'Mysterious indigo tones, elegant edge' },
    { label: 'Cyan', value: 'cyan', icon: <Icons.Ion name="ice-cream-outline" size={16} color="#06b6d4" />, description: 'Bright cyan zings, cool & playful' },
    { label: 'Lime', value: 'lime', icon: <Icons.Ion name="sparkles-outline" size={16} color="#84cc16" />, description: 'Zesty lime pops, energetic highlights' },
    { label: 'Fuchsia', value: 'fuchsia', icon: <Icons.Ion name="sparkles-outline" size={16} color="#d946ef" />, description: 'Neon fuchsia pops, modern & playful' },
    { label: 'Slate', value: 'slate', icon: <Icons.Ion name="grid-outline" size={16} color="#64748b" />, description: 'Subtle slate blues, modern & muted' },
];

export const privacyOptions = [
    { label: 'Off', value: 'off', icon: <Icons.Ion name="eye-outline" size={16} />, description: 'Everything visible, no masking' },
    { label: 'Mask', value: 'mask', icon: <Icons.Ion name="lock-closed-outline" size={16} />, description: 'Mask out title and names on screen' },
    { label: 'Jumble', value: 'jumble', icon: <Icons.Ion name="shuffle-outline" size={16} />, description: 'Scramble title and names into unreadable words' },
    { label: 'Invisible', value: 'invisible', icon: <Icons.Ion name="eye-off-outline" size={16} />, description: 'Text appears invisible but layout is preserved' },
    { label: 'Ghost', value: 'ghost', icon: <Icons.Ion name="remove-circle-outline" size={16} />, description: 'Text is completely hidden without occupying space' },
    { label: 'Emoji', value: 'emoji', icon: <Icons.Ion name="happy-outline" size={16} />, description: 'Swap title and names with cute expressive icons' },
];

export const lockoutOptions = [
    { label: 'Disabled', value: 'never', icon: <Icons.Ion name="close-circle-outline" size={16} />, description: 'App stays open until you quit' },
    { label: 'Instant', value: '0', icon: <Icons.Ion name="flash-outline" size={16} />, description: 'Lock the moment you leave the app' },
    { label: '30 seconds', value: '30000', icon: <Icons.Ion name="time-outline" size={16} />, description: 'Quick half-minute grace period' },
    { label: '1 minute', value: '60000', icon: <Icons.Ion name="alarm-outline" size={16} />, description: 'Short 60-second buffer' },
    { label: '5 minutes', value: '300000', icon: <Icons.Ion name="timer-outline" size={16} />, description: 'Coffee-break friendly timeout' },
    { label: '15 minutes', value: '900000', icon: <Icons.Ion name="timer-outline" size={16} />, description: 'Quarter-hour of idle leeway' },
    { label: '30 minutes', value: '1800000', icon: <Icons.Ion name="timer-outline" size={16} />, description: 'Long lunch-break protection' },
];

export const pomodoroOptions = [
    {
        label: '15 seconds',
        value: '15000',
        icon: <Icons.Ion name="flash-outline" size={16} />,
        description: 'A quick burst to test focus or preview the flow.',
    },
    {
        label: '30 seconds',
        value: '30000',
        icon: <Icons.Ion name="time-outline" size={16} />,
        description: 'Just enough to breathe or clear your mind.',
    },
    {
        label: '1 minute',
        value: '60000',
        icon: <Icons.Ion name="alarm-outline" size={16} />,
        description: 'One solid minute to plan or prep.',
    },
    {
        label: '5 minutes',
        value: '300000',
        icon: <Icons.Ion name="timer-outline" size={16} />,
        description: 'Great for microtasks or meditation breaks.',
    },
    {
        label: '10 minutes',
        value: '600000',
        icon: <Icons.Ion name="timer-outline" size={16} />,
        description: 'Enough time to enter light focus mode.',
    },
    {
        label: '15 minutes',
        value: '900000',
        icon: <Icons.Ion name="timer-outline" size={16} />,
        description: 'A mini sprint to knock out small goals.',
    },
    {
        label: '25 minutes (Classic)',
        value: '1500000',
        icon: <Icons.Ion name="rocket-outline" size={16} />,
        description: 'The OG Pomodoro — pure focus, no fluff.',
    },
    {
        label: '30 minutes',
        value: '1800000',
        icon: <Icons.Ion name="timer-outline" size={16} />,
        description: 'Perfect balance for study or deep dive work.',
    },
    {
        label: '1 hour',
        value: '3600000',
        icon: <Icons.Ion name="hourglass-outline" size={16} />,
        description: 'Deep work mode — no distractions allowed.',
    },
    {
        label: '2 hours',
        value: '7200000',
        icon: <Icons.Ion name="hourglass-outline" size={16} />,
        description: 'For ultra focus or extended creative flow.',
    },
];

export const sortOptions = [
    { label: 'Priority', value: 'priority', icon: <MaterialIcons name="flag" size={16} />, description: 'Red flags first, greens last' },
    { label: 'Time Left', value: 'timeLeft', icon: <MaterialIcons name="hourglass-empty" size={16} />, description: 'Nearest deadline rises to top' },
    { label: 'Recurring', value: 'recurring', icon: <MaterialIcons name="repeat" size={16} />, description: 'Repeating tasks grab the spotlight' },
    { label: 'Non-Recurring', value: 'nonRecurring', icon: <MaterialIcons name="remove-circle-outline" size={16} />, description: 'One-offs lead the queue' },
];

export const priorityOptions = [
    { label: 'High', value: 'high', icon: <Icons.Ion name="flag" size={16} color="#ff0000" />, description: 'Drop everything and tackle now' },
    { label: 'Medium', value: 'normal', icon: <Icons.Ion name="flag" size={16} color="#ffa500" />, description: 'Handle today if possible' },
    { label: 'Low', value: 'low', icon: <Icons.Ion name="flag" size={16} color="#008000" />, description: 'Nice-to-do when you have time' },
];

export const navOptions = [
    { label: 'Floating', value: 'floating', icon: <Icons.Ion name="layers-outline" size={16} />, description: 'Drifting bubble over content' },
    { label: 'Fixed', value: 'fixed', icon: <Icons.Ion name="home-outline" size={16} />, description: 'Stays glued to bottom edge' },
    { label: 'Side', value: 'side', icon: <Icons.Ion name="menu-outline" size={16} />, description: 'Slide-in drawer from the left' },
];

export const headerOptions = [
    { label: 'Minimized', value: 'minimized', icon: <Icons.Ion name="remove-outline" size={16} />, description: 'Tiny strip, maximum screen space' },
    { label: 'Fixed', value: 'fixed', icon: <Icons.Ion name="home-outline" size={16} />, description: 'Always visible, quick access' },
    { label: 'Collapsible', value: 'collapsible', icon: <Icons.Material name="unfold-more" size={16} />, description: 'Swipe up to expand, down to shrink' },
];

export const recurrenceOptions = [
    { label: 'Daily', value: '1 day', icon: <Icons.Ion name="repeat-outline" size={16} />, description: 'Every 24 hours like clockwork' },
    { label: 'Weekly', value: '1 week', icon: <Icons.Ion name="calendar-outline" size={16} />, description: 'Same day each week, perfect for habits' },
    { label: 'Fortnightly', value: '2 weeks', icon: <Icons.Ion name="repeat-outline" size={16} />, description: 'Every two weeks, bi-weekly rhythm' },
    { label: 'Monthly', value: '1 month', icon: <Icons.Ion name="calendar-outline" size={16} />, description: 'Once a month on the dot' },
    { label: 'Quarterly', value: '3 months', icon: <Icons.Ion name="repeat-outline" size={16} />, description: 'Four times a year, seasonal ticks' },
    { label: 'Annually', value: '1 year', icon: <Icons.Ion name="calendar-outline" size={16} />, description: 'Once a year, birthday-style' },
];

export const borderOptions = [
    { label: 'None', value: 'none', icon: <Icons.Ion name="close-outline" size={16} />, description: 'Seamless edge-to-edge clean look' },
    { label: 'Thin', value: 'thin', icon: <Icons.Ion name="remove-outline" size={16} />, description: 'Hairline 1px whisper borders' },
    { label: 'Subtle', value: 'subtle', icon: <Icons.Ion name="checkmark-outline" size={16} />, description: 'Soft gray lines, barely there' },
    { label: 'Thick', value: 'thick', icon: <Icons.Ion name="square-outline" size={16} />, description: 'Bold 2px statement frames' },
];

export const layoutOptions = [
    {
        label: 'List',
        value: 'list',
        icon: <Icons.Ion name="list-outline" size={16} />,
        description: 'Full-width cards stacked vertically'
    },
    {
        label: 'Grid',
        value: 'grid',
        icon: <Icons.Ion name="grid-outline" size={16} />,
        description: 'Compact multi-column view'
    }
];

export const progressOptions = [
    {
        label: 'Linear',
        value: 'linear',
        icon: <Icons.Ion name="remove-outline" size={16} />,
        description: 'Classic solid progress bar'
    },
    {
        label: 'Half Wave',
        value: 'halfWave',
        icon: <Icons.Ion name="pulse-outline" size={16} />,
        description: 'Single-color wave showing only completed progress'
    },
    {
        label: 'Full Wave',
        value: 'fullWave',
        icon: <Icons.Ion name="water-outline" size={16} />,
        description: 'Dual-color wave with clear progress boundary'
    }
];

export const backgroundOptions = [
    {
        label: 'None',
        value: 'none',
        icon: <Icons.Ion name="close-outline" size={16} />,
        description: 'No background effect'
    },
    {
        label: 'Grid',
        value: 'grid',
        icon: <Icons.Ion name="grid-outline" size={16} />,
        description: 'Classic grid pattern background'
    },
    {
        label: 'Polka Dots',
        value: 'polka',
        icon: <Icons.Ion name="ellipsis-horizontal-circle-outline" size={16} />,
        description: 'Scattered polka dot effect'
    },
    {
        label: 'Cross Hatch',
        value: 'cross',
        icon: <Icons.Ion name="apps-outline" size={16} />,
        description: 'Fine criss-cross background lines'
    },
    {
        label: 'Blur Noise',
        value: 'noise',
        icon: <Icons.Ion name="cloudy-outline" size={16} />,
        description: 'Soft blur static effect for minimal texture'
    },
    /*
        {
        label: 'Diagonal Lines',
        value: 'diagonal',
        icon: <Icons.Ion name="trending-up-outline" size={16} />,
        description: 'Tilted stripe pattern across the screen'
    },
    */
];

export const unitOptions = [
    {
        label: 'Auto',
        value: 'auto',
        icon: <Icons.Material name="autorenew" size={16} />,
        description: 'Smartly chooses the best unit based on duration'
    },
    {
        label: 'Seconds',
        value: 'seconds',
        icon: <Icons.Material name="timer" size={16} />,
        description: 'Precision timing down to the second'
    },
    {
        label: 'Minutes',
        value: 'minutes',
        icon: <Icons.Material name="timer-3" size={16} />,
        description: 'Minute-level granularity'
    },
    {
        label: 'Hours',
        value: 'hours',
        icon: <Icons.Material name="access-time" size={16} />,
        description: 'Track time by the hour'
    },
    {
        label: 'Days',
        value: 'days',
        icon: <Icons.Material name="today" size={16} />,
        description: 'Daily progress tracking'
    },
    {
        label: 'Months',
        value: 'months',
        icon: <Icons.Material name="date-range" size={16} />,
        description: 'Month-by-month overview'
    },
    {
        label: 'Years',
        value: 'years',
        icon: <Icons.Material name="event" size={16} />,
        description: 'Long-term year tracking'
    },
];

export const linkOptions = [

    {
        label: 'Releases',
        value: 'release',
        icon: <Icons.Ion name="albums-outline" size={16} />,
        description: 'Check the latest versions and updates',
        url: 'https://github.com/FarhanZafarr-9/Timers/releases'
    },
    {
        label: 'Repository',
        value: 'repo',
        icon: <Icons.Ion name="code-slash-outline" size={16} />,
        description: 'View the complete source code on GitHub',
        url: 'https://github.com/FarhanZafarr-9/Timers'
    },
    {
        label: 'My Profile',
        value: 'profile',
        icon: <Icons.Ion name="person-circle-outline" size={16} />,
        description: 'Visit my developer profile on GitHub',
        url: 'https://github.com/FarhanZafarr-9'
    }
];

export const jumbleText = (str) => {
    // Replace each character with a random letter (except spaces)
    return str.split('').map(char =>
        char === ' ' ? ' ' : String.fromCharCode(97 + Math.floor(Math.random() * 26))
    ).join('');
};

export const emojiText = (str) => {
    const emojiChars = [
        // Neutral / Soft Faces
        '😶', '😐', '😑', '🙄', '😬', '😮‍💨',
        // Smile & Calm
        '🙂', '🙃', '😊', '😇', '😉', '😌',
        // Sleepy / Tired
        '😴', '🥱', '😪',
        // Shock / Confusion
        '😯', '😲', '😳', '🥺', '😕', '😟',
        // Sad / Cry
        '😢', '😭', '😞', '😔', '😓', '😥',
        // Emo / Blank
        '😶‍🌫️', '😵‍💫', '🫥',
        // Mysterious / Covered
        '🤫', '🤭', '🫢', '🫣',
        // Cool / Nerdy
        '😎', '🤓', '🧐', '🥸',
        // Calm Celestial
        '⭐', '✨', '🌟', '💫', '🌙', '🌚', '🌛', '🌜', '🌝', '🌌'
    ];
    const emojiChar = emojiChars[Math.floor(Math.random() * emojiChars.length)];
    return str.split('').map(char => (char === ' ' ? ' ' : emojiChar)).join('');
};

export const maskText = (str) => {
    const maskChars = [
        // bullet-style
        '•', '·', '◦', '‣', '⁃', '∙',
        // small geometric blocks
        '▪', '▫', '◾', '◽', '■', '□', '◆', '◇', '▰', '▱',
        // tiny arrows / carets
        '▸', '◂', '▴', '▾',
        // narrow bars
        '❘', '❙', '❚', '│', '┃', '┆', '┊',
        // underscore variants
        '_', '‗', '‾',
        // equals variants
        '=', '≡', '═'
    ];

    const maskChar = maskChars[new Date().getMinutes() % maskChars.length];
    return [...String(str)].map(ch => (ch === ' ' ? ' ' : maskChar)).join('');
};

export const maxCharsLimit = 10;

export const getPrivacyText = (maxCharsLimit, privacyMode, inputText) => {
    const text = String(inputText ?? '');
    const isLong = text.length > maxCharsLimit;
    const truncated = isLong ? text.slice(0, maxCharsLimit) : text;

    let result;

    switch (privacyMode) {
        case 'jumble':
            result = jumbleText(truncated);
            break;
        case 'emoji':
            result = emojiText(truncated);
            break;
        case 'invisible':
            result = truncated;
            break;
        case 'ghost':
            result = null;
            break;
        case 'mask':
            result = maskText(truncated);
            break;
        default:
            result = truncated;
    }

    return isLong && privacyMode !== 'ghost' && result !== null ? result + '...' : result;
};

export const showToast = (msg) => {
    if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
        Alert.alert('Error', msg);
    }
};

export const quotes = [
    "Time waits for no one.",
    "Moments are memories in the making.",
    "The best time to start was yesterday. The next best is now.",
    "Cherish each tick of the clock.",
    "Your time is your life.",
    "Time is the most valuable thing we have.",
    "Every moment is a fresh beginning.",
    "Time flies when you're having fun.",
    "Time is the thread of life.",
    "Seconds turn into stories.",
    "Don't count time, make time count.",
    "Tick tock, life moves on.",
    "Time is the silent teacher.",
    "The future depends on what you do now.",
    "Lost time is never found again.",
    "Punctuality is the thief of procrastination.",
    "Time is the canvas, actions are the paint.",
    "A minute saved is a moment earned.",
    "Yesterday is gone, tomorrow is uncertain—today is a gift.",
    "Time reveals all truths.",
    "Life is measured in moments, not minutes.",
    "The clock never stops, but you can start anytime.",
    "Waste time, and you waste life.",
    "Time is the one currency you can't earn back.",
    "Every second is a chance to change.",
    "The present is the only time you control.",
    "Time doesn't heal, but it teaches.",
    "Make time for what matters.",
    "A well-spent day brings happy sleep.",
    "The past is a lesson, not a home.",
    "Time is the fire in which we burn.",
    "Now is the only moment you own.",
    "An hour lost is a future delayed.",
    "Time is the wisest counselor.",
    "The clock is ticking—start living.",
    "Time is a river, not a reservoir.",
    "Moments pass, memories last.",
    "Time slips through careless hands.",
    "Tomorrow is a promise, not a plan.",
    "Count memories, not minutes.",
    "Time molds what patience builds.",
    "Let each second be a seed.",
    "Time tests all intentions.",
    "Don't chase time, walk with it.",
    "Moments fade, impacts remain.",
    "Time whispers what haste forgets.",
    "Life unfolds one tick at a time.",
    "Time waits for your courage.",
    "The clock moves, whether you do or not.",
    "Seconds lost are stories untold.",
    "Time's gift is perspective.",
    "Rush less, live more.",
    "Time dances to its own tune.",
    "Make memories, not excuses.",
    "Time enriches quiet hearts.",
    "Moments matter more than milestones.",
    "Don't borrow tomorrow's worries.",
    "Time tells what truth hides.",
    "Each sunrise resets the clock.",
    "Time polishes rough edges.",
    "Spend time like you spend money—wisely.",
    "One day you'll wish for today.",
    "Time's pace is yours to match.",
    "Pause often, time won't.",
    "Time builds what haste breaks.",
    "Clocks tick, hearts beat—both measure life.",
    "Time is the stage, you write the script.",
    "Late starts are better than never.",
    "Time unravels every secret.",
    "The moment you're in is all you own.",
    "Time flows; make sure you're swimming.",
    "Time's melody plays only once—listen closely.",
    "A second's decision can change a lifetime.",
    "The hourglass never pauses for regrets.",
    "Time is the architect of character.",
    "Moments are the brushstrokes of destiny.",
    "Watches measure time, but presence measures life.",
    "Time's river carries both the patient and rushed.",
    "The present is time's only guaranteed gift.",
    "Every ending is time's new beginning.",
    "Time heals wounds but scars remain as lessons.",
    "The clock's hands point forward for a reason.",
    "Time spent laughing is never wasted.",
    "Yesterday's lessons fuel tomorrow's victories.",
    "Time magnifies what we nurture.",
    "An idle moment is a stolen opportunity.",
    "Time's tapestry weaves choices into fate.",
    "The past is a museum, not a residence.",
    "Time's value is known only when it's gone.",
    "Morning dew fades as time teaches impermanence.",
    "Future memories are born in present moments.",
    "Time is the silent partner in all achievements.",
    "Hurry empties moments of their magic.",
    "The sundial measures light, not just hours.",
    "Time's echo carries further than we imagine.",
    "Patience is time's favorite currency.",
    "A watched clock slows for the impatient.",
    "Time's mirror reflects what we truly value.",
    "Sunrises are time's daily reset button.",
    "The hourglass reminds: what falls will rise again.",
    "Time is the gardener of all possibilities.",
    "Rushed decisions bloom into lasting consequences.",
    "Time's current favors those who paddle with purpose.",
    "The present moment is time's only true possession.",
    "Time's arithmetic: subtract distractions, add meaning.",
    "A lifetime is just minutes, wisely spent.",
    "Time's fingerprint is unique on every life.",
    "The pendulum swings but never repeats its arc.",
    "Time is the quiet editor of all stories.",
    "Moments are the seeds of legacy.",
    "Time's compass always points to now.",
    "The calendar pages turn whether we're ready or not.",
    "Time is the invisible thread connecting all lives.",
    "Procrastination is time's favorite disguise.",
    "Time's recipe: mix intention with action, serve warm.",
    "The clock's face smiles at those who use time well.",
    "Time's mosaic is made of a million nows.",
    "Future you will thank present you for starting today.",
    "Time's whisper becomes a roar when ignored.",
    "The hourglass never asks if you're ready.",
    "Time is the canvas, attention is the brush.",
    "Moments multiply when shared with meaning.",
    "Time's alchemy turns effort into achievement.",
    "The present is time's only delivery.",
    "Time's river carves canyons from consistent drops.",
    "Watches tell time, but consciousness tells meaning.",
    "Time is the silent shareholder in all endeavors."
];

export const appBuild = 'stable';
export const appVersion = '1.1.1';

export const changelog = [
    {
        "version": "1.1.1",
        "date": "2025-07-25",
        "title": "Refined Utility & Sharing Update",
        "major": true,
        "changes": [
            { "type": "new", "text": "Introduced a redesigned app icon for a more modern appearance" },
            { "type": "new", "text": "Added encrypted import/export functionality for better data security" },
            { "type": "new", "text": "Included QR code sharing feature for releasing and promoting Pro versions or app links" },
            { "type": "new", "text": "Preferences can now be exported and potentially shared between setups" },

            { "type": "improved", "text": "UI consistency improved across multiple areas with minor visual fixes" },
            { "type": "improved", "text": "Privacy mode now behaves more reliably and integrates with all views" },
            { "type": "improved", "text": "Faster performance on load and lighter resource usage in background tasks" },

            { "type": "fixed", "text": "Various minor bugs resolved and interface inconsistencies patched" },

            {
                "type": "summarized",
                "text": "This update brings encrypted import/export, a fresh app icon, preference export, QR sharing, UI and privacy improvements, and general performance tuning."
            }
        ]
    },
    {
        "version": "1.1.0",
        "date": "2025-07-21",
        "title": "Final update",
        "major": true,
        "changes": [
            { "type": "new", "text": "New app icon introduced for a refreshed identity" },
            { "type": "new", "text": "UI styled further in select areas for cleaner visuals" },
            { "type": "new", "text": "Advanced features now wrapped with curtains to reduce overwhelm" },

            { "type": "improved", "text": "Optimized initial loading and background performance" },
            { "type": "improved", "text": "Several under-the-hood tweaks for smoother app behavior" },

            { "type": "fixed", "text": "Minor bug fixes and interface consistency adjustments" },

            { "type": "wip", "text": "Project opened to patches but paused for production until feedback or notice" },

            {
                "type": "summarized",
                "text": "Final update includes a new icon, light styling upgrades, better loading, and wraps complex options behind cleaner UI. Development is paused but open to patches as needed."
            }
        ]
    },
    {
        "version": "1.0.31",
        "date": "2025-07-20",
        "title": "Immersive Mode & Pattern Backgrounds",
        "major": false,
        "changes": [
            { "type": "new", "text": "Immersive view introduced  auto-hides header/nav after 4s of inactivity for distraction-free experience" },
            { "type": "new", "text": "Patterned background support added for enhanced visual depth and customization" },
            { "type": "new", "text": "New UI polish across multiple screens, with refined paddings and spacing" },

            { "type": "improved", "text": "ThemeContext reworked for blazing-fast switching and minimal overhead" },
            { "type": "improved", "text": "Animated background performance optimized for smoother rendering" },
            { "type": "improved", "text": "Several layout fixes and minor component alignment improvements" },

            { "type": "wip", "text": "JS-based screen animations and transitions being tested for full rollout" },
            { "type": "wip", "text": "New icons and entry animations being finalized for key screens" },
            { "type": "wip", "text": "More animated backgrounds coming soon with improved GPU handling" },
            { "type": "wip", "text": "Additional new features in development and UI experiments underway" },

            {
                "type": "summarized",
                "text": "This update brings immersive viewing, patterned backgrounds, and a faster theme engine—plus fixes, layout improvements, and a sneak peek into new animations and transitions coming soon."
            }
        ]
    },
    {
        "version": "1.0.30",
        "date": "2025-07-19",
        "title": "Layout Polish, Dynamic Quotes & Under-the-Hood Gains",
        "major": false,
        "changes": [
            { "type": "new", "text": "BorderRadius mode added for fixed header/navigation: choose between flat or rounded UI feel" },
            { "type": "new", "text": "Grid mode now supports all time units (years, months, days, hrs, mins, secs) for better clarity" },
            { "type": "new", "text": "Splash screen quote list expanded with new dark-light duality messages for deeper experience" },

            { "type": "improved", "text": "Card layouts further optimized for faster rendering and better spacing" },
            { "type": "improved", "text": "Chips in grid layout better handle unit changes without default conversion glitches" },
            { "type": "improved", "text": "Quote system upgraded for smoother transitions and varied timing" },
            { "type": "improved", "text": "Rendering issues, minor visual bugs and lag points further ironed out" },
            { "type": "improved", "text": "Multiple layout consistency tweaks and refined component behaviors" },

            { "type": "wip", "text": "JS-based tab transitions and animations in early testing" },
            { "type": "wip", "text": "Frosted logo variant being designed for splash and headers" },
            { "type": "wip", "text": "New animations in development to enhance fluidity across screens" },
            { "type": "wip", "text": "Progress bar style variations and potential new layout being explored" },

            {
                "type": "summarized",
                "text": "Rounded headers, full time units, splash screen upgrades and deeper quote logic headline this update—plus more layout polish, component tuning, and a bunch of subtle bug fixes!"
            }
        ]
    },
    {
        "version": "1.0.29",
        "date": "2025-07-18",
        "title": "Massive Speed Boost, Major UI Cleanup & New features on way✨",
        "major": false,
        "changes": [
            { "type": "improved", "text": "App renders now up to 95% faster across key screens" },
            { "type": "improved", "text": "Heavy components 100% optimized to prevent extra renders" },
            { "type": "improved", "text": "Timer updates trigger zero unnecessary state updates" },
            { "type": "improved", "text": "Pomodoro layout now faster and lighter during cycles" },
            { "type": "improved", "text": "ProgressWave separated to avoid redraw bottlenecks" },
            { "type": "improved", "text": "PickerSheet opened with minimal animation cost" },
            { "type": "improved", "text": "Removed unused props to shrink render trees" },
            { "type": "improved", "text": "Disabled render triggers on unchanging elements" },
            { "type": "improved", "text": "Quotes changed from typewriter to smoother fade-in system" },
            { "type": "improved", "text": "Quote animations now elegant and subtle for less distraction" },
            { "type": "improved", "text": "NavBar component renders only once per tab switch" },
            { "type": "improved", "text": "Cleaner tab animation prep for future transitions" },
            { "type": "improved", "text": "Reworked styles for better visual alignment and balance" },
            { "type": "improved", "text": "Spacing and font adjustments to improve clarity" },
            { "type": "improved", "text": "Internal structure now more modular for future flexibility" },
            { "type": "improved", "text": "Memory footprint significantly reduced for mobile use" },

            { "type": "fixed", "text": "Pause/resume bug in timer logic fully resolved" },
            { "type": "fixed", "text": "Wave animation sync issues during fast updates fixed" },
            { "type": "fixed", "text": "Render flicker when changing states eliminated" },
            { "type": "fixed", "text": "NavBar layout glitch on screen switch removed" },

            { "type": "new", "text": "Animated fade-in quotes now cycle smoothly with time" },
            { "type": "new", "text": "Dynamic UI feedback for wave progress integrated" },

            { "type": "wip", "text": "JS-based tab transitions being prototyped for fluid effect" },
            { "type": "wip", "text": "Tab switch animations in testing for polished UX" },
            { "type": "wip", "text": "Emoji-based timer modes and playful UI options in progress" },
            { "type": "wip", "text": "More lightweight animation utilities in early development" },
            { "type": "wip", "text": "New icons and entry animations under design tweaks" },
            { "type": "wip", "text": "Additional privacy and progress bar modes being explored" }
        ]
    },
    {
        "version": "1.0.28",
        "date": "2025-07-16",
        "title": "Pomodoro, Ghost Mode & Performance Boosts",
        "major": false,
        "changes": [
            { "type": "new", "text": "Introduced new Ghost privacy mode with subtle display masking" },

            { "type": "improved", "text": "Pomodoro screen refined with better layout, interactions, and visual polish" },
            { "type": "improved", "text": "Wave component upgraded for smoother animation and improved responsiveness" },
            { "type": "improved", "text": "ProgressWave logic restructured for better performance and fluid transitions" },
            { "type": "improved", "text": "NavBar tweaked for better rendering and lower lag during tab switches" },
            { "type": "improved", "text": "Settings screen now renders faster with better layout consistency" },
            { "type": "improved", "text": "Invisible privacy mode enhanced for more stable layout and adaptive rendering" },
            { "type": "improved", "text": "Timer card rendering optimized for lower CPU usage and smoother updates" },
            { "type": "improved", "text": "Efficiency improvements in timer calculations and animations" },

            { "type": "fixed", "text": "Reduced jerkiness and lag across animations and layout transitions" },
            { "type": "fixed", "text": "Resolved minor layout glitches and inconsistent margins in various components" },

            { "type": "wip", "text": "Further improvements to Pomodoro screen UI/UX planned" },
            { "type": "wip", "text": "Upcoming customizations to enhance Pomodoro experience" },
            { "type": "wip", "text": "Wave and tab bar components under ongoing performance tuning" }
        ]
    },
    {
        "version": "1.0.27",
        "date": "2025-07-16",
        "title": "Pomodoro v1, Wave Fixes & Layout Polishing",
        "major": false,
        "changes": [
            { "type": "new", "text": "Initial version of new Pomodoro screen is now available (V1)" },
            { "type": "new", "text": "Added default seconds toggle for better grid mode visibility" },

            { "type": "improved", "text": "Optimized wave progress bar rendering to avoid width and percentage issues" },
            { "type": "improved", "text": "Simplified wave progress logic to reduce lag and improve app fluidity" },
            { "type": "improved", "text": "Improved pickers with better spacing and alignment" },
            { "type": "improved", "text": "Enhanced positioning and responsiveness for control elements in timer" },
            { "type": "improved", "text": "Reduced calculations to boost performance and smoothness" },
            { "type": "improved", "text": "Improved text sizing and spacing across privacy modes for consistency" },

            { "type": "fixed", "text": "Resolved minor UI bugs and alignment issues" },
            { "type": "fixed", "text": "Fixed title spacing and name overflow in compact privacy modes" },

            { "type": "wip", "text": "Moji privacy mode removed temporarily due to formatting conflicts, under redevelopment" },
            { "type": "wip", "text": "Wave progress still under polish; smoothing and rendering optimizations ongoing" },
            { "type": "wip", "text": "Pomodoro screen still in development; more testing and debugging required" }
        ]
    },
    {
        "version": "1.0.26",
        "date": "2025-07-16",
        "title": "Waves, Toasts & Grid Refinements",
        "major": false,
        "changes": [
            { "type": "new", "text": "Added wave progress animations (experimental)" },
            { "type": "new", "text": "Introduced toast message notifications for quick feedback" },
            { "type": "fixed", "text": "Resolved grid layout issues causing overflow and misalignment" },
            { "type": "fixed", "text": "Fixed missing import for Linking causing crash on update page open" },
            { "type": "fixed", "text": "Fixed icon clipping on small widths in timer cards and settings" },
            { "type": "fixed", "text": "Fixed icon and text alignment on minimized header mode" },
            { "type": "fixed", "text": "Minor internal optimizations and cleanup" },
            { "type": "improved", "text": "Polished grid card styling for better balance and visuals" },
            { "type": "improved", "text": "Enhanced timer card prop handling to support varied layouts" },
            { "type": "improved", "text": "Better font and size adaptation in privacy modes to fit width gracefully" },
            { "type": "wip", "text": "Wave progress might lag or feel jittery; optimizations in progress" },
            { "type": "wip", "text": "Some jerkiness and lag is anticipated and will be fixed soon!" },
            { "type": "wip", "text": "New Pomodoro Timer page coming soon!" }
        ]
    },
    {
        "version": "1.0.25",
        "date": "2025-07-16",
        "title": "Waves, Toasts & Grid Refinements",
        "major": true,
        "changes": [
            { "type": "new", "text": "Added wave progress animations (experimental)" },
            { "type": "new", "text": "Introduced toast message notifications for quick feedback" },
            { "type": "fixed", "text": "Resolved grid layout issues causing overflow and misalignment" },
            { "type": "fixed", "text": "Fixed missing import for Linking causing crash on update page open" },
            { "type": "fixed", "text": "Fixed icon clipping on small widths in timer cards and settings" },
            { "type": "fixed", "text": "Fixed icon and text alignment on minimized header mode" },
            { "type": "fixed", "text": "Minor internal optimizations and cleanup" },
            { "type": "improved", "text": "Polished grid card styling for better balance and visuals" },
            { "type": "improved", "text": "Enhanced timer card prop handling to support varied layouts" },
            { "type": "improved", "text": "Better font and size adaptation in privacy modes to fit width gracefully" },
            { "type": "wip", "text": "Wave progress might lag or feel jittery; optimizations in progress" },
            { "type": "wip", "text": "Some jerkiness and lag is anticipated and will be fixed soon!" },
            { "type": "wip", "text": "New Pomodoro Timer page coming soon!" }
        ]
    },
    {
        "version": "1.0.24",
        "date": "2025-07-16",
        "title": "Fresh Themes & UI Upgrades",
        "major": false,
        "changes": [
            { "type": "new", "text": "Added 7 new accent themes including Fuchsia" },
            { "type": "new", "text": "Introduced app updates card for changelogs & feedback" },
            { "type": "wip", "text": "Added grid mode for timer cards" },
            { "type": "improved", "text": "Enhanced bottom sheet pickers with smoother UX" },
            { "type": "improved", "text": "More privacy options for timer visibility" },
            { "type": "improved", "text": "UI tweaks for better consistency & flow" },
            { "type": "fixed", "text": "Minor optimizations and bug fixes" }
        ]
    },
    {
        "version": "1.0.23",
        "date": "2025-07-16",
        "title": "Fresh Themes & UI Upgrades",
        "major": false,
        "changes": [
            "Added 7 new accent themes including Fuchsia",
            "Introduced app updates card for changelogs & feedback",
            "Added grid mode for timer cards (WIP)",
            "Enhanced bottom sheet pickers with smoother UX",
            "More privacy options for timer visibility",
            "UI tweaks for better consistency & flow",
            "Minor optimizations and bug fixes"
        ]
    },
    {
        "version": "1.0.22",
        "date": "2025-07-15",
        "title": "Update Checker & UX Enhancements",
        "major": false,
        "changes": [
            "Added force update checker to instantly fetch new app updates",
            "Improved pickers for smoother and better selection",
            "Added descriptions for new settings adn all previous picker options",
            "Refined some privacy options for better control and visibility",
            "Fixed various minor bugs and adjusted UI styles for consistency"
        ]
    },
    {
        "version": "1.0.21",
        "date": "2025-07-15",
        "title": "About Me Modal & UI Tweaks",
        "major": false,
        "changes": [
            "Aligned header for immersive modal look",
            "Added stylish About Me modal with app intro",
            "Polished card and button visuals"
        ]
    },
    {
        "version": "1.0.20",
        "date": "2025-07-14",
        "title": "Side Navigation & Theming Polish",
        "major": false,
        "changes": [
            "Made side navigation more minimal and compact",
            "Removed 'Main' and 'More' section labels",
            "Removed 'Navigate your app' subtitle text",
            "Reduced side menu header font size for a tighter look",
            "Kept user profile footer toggle intact and tied to header clicks",
            "Added a Wisdom section if no lock is enabled",
            "Improved dark themes for better unique color vibes",
            "Smoothed spacing and padding for side nav items"
        ]
    },
    {
        "version": "1.0.19",
        "date": "2025-07-15",
        "title": "UI Theming Revamp",
        "major": false,
        "changes": [
            "Enhanced dark/light mode accents",
            "Added thin border option (none/thin/subtle/thick)",
            "Improved Favorites section UI",
            "Redesigned quotes with animations +50 new quotes",
            "Optimized theme performance",
            "Refined card/button visuals",
            "Fixed border radius consistency"
        ]
    },
    {
        "version": "1.0.18",
        "date": "2025-07-14",
        "title": "UI & Home Updates",
        "major": false,
        "changes": [
            "Fixed auth component bugs for smoother unlocking",
            "Added more theme customization options",
            "Added animated quotes section on home screen",
            "Added favourites section to home for quick access",
            "Fixed timer modal switch and min diplay issues",
            "Optimized UI performance and rendering",
            "Refined styles for cards, buttons, and switches"
        ]
    },
    {
        "version": "1.0.17",
        "date": "2025-07-13",
        "title": "Home and About Screen",
        "major": false,
        "changes": [
            "Added favourite feature for timers with toggle on cards",
            "Home screen updated to show favourites card",
            "Made cards more compact by hiding buttons on home screen",
            "Improved switch styles and positions",
            "Updated about screen with clearer app description",
            "Profile section hidden until login is available",
            "Fixed bugs in auth component",
            "Fixed issue with favourite status not persisting"
        ]
    },
    {
        "version": "1.0.16",
        "date": "2025-07-13",
        "title": "Auth Animations & UI",
        "major": false,
        "changes": [
            "Added animated top card slide and fade on focus",
            "Middle card now smoothly moves up on keyboard",
            "Bottom card transitions from offscreen with states",
            "Initial mount sets top, middle, bottom animations",
            "Handled app state to reset auth UI after background",
            "Tweaked password and fingerprint unlock flows",
            "Improved overlay and grid visuals on middle card",
            "Simplified layout for cleaner look and faster auth"
        ]
    },
    {
        version: "1.0.15",
        date: "2025-07-12",
        title: "Material Switch & UI tweaks",
        major: false,
        changes: [
            "Replaced switch with smooth Material You switch",
            "Improved thumb spacing and transitions",
            "Adjusted shadow for flatter Material look",
            "Minor UI consistency fixes across settings"
        ]
    },
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

export const toastConfig = (colors, variables, border) => ({
    success: (props) => (
        <BaseToast
            {...props}
            style={{
                backgroundColor: colors.modalBg,
                borderLeftWidth: 4,
                borderLeftColor: colors.highlight,
                borderWidth: border,
                borderColor: colors.border,
                borderRadius: variables.radius.lg,
                paddingVertical: 8,
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 6
            }}
            contentContainerStyle={{
                paddingHorizontal: 15
            }}
            text1Style={{
                color: colors.highlight,
                fontSize: 15,
                fontWeight: '700',
                height: 20
            }}
            text2Style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: '400',
                marginTop: 2,
                height: 20
            }}
        />
    ),
    error: (props) => (
        <ErrorToast
            {...props}
            style={{
                backgroundColor: colors.modalBg,
                borderLeftWidth: 4,
                borderLeftColor: '#ef4444',
                borderWidth: border,
                borderColor: colors.border,
                borderRadius: variables.radius.lg,
                paddingVertical: 8,
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 6
            }}
            contentContainerStyle={{
                paddingHorizontal: 15
            }}
            text1Style={{
                color: '#ef4444',
                fontSize: 15,
                fontWeight: '700'
            }}
            text2Style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: '400',
                marginTop: 2,
                height: 20
            }}
        />
    ),
    info: ({ text1, text2 }) => (
        <View style={{
            backgroundColor: colors.modalBg,
            borderLeftWidth: 4,
            borderLeftColor: colors.highlight,
            borderWidth: border,
            borderColor: colors.border,
            borderRadius: variables.radius.lg,
            paddingHorizontal: 15,
            paddingVertical: 10,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 6,
            width: '80%',
            alignSelf: 'center'
        }}>
            <Text style={{
                color: colors.highlight,
                fontSize: 15,
                fontWeight: '700',
                height: 20
            }}>
                {text1}
            </Text>
            {text2 ? (
                <Text style={{
                    color: colors.text,
                    fontSize: 14,
                    fontWeight: '400',
                    marginTop: 2,
                    height: 20
                }}>
                    {text2}
                </Text>
            ) : null}
        </View>
    )
});

export const renderGrid = ({ width: W, height: H }, color) => {
    if (!W || !H) return null;

    const SPACING = 20;
    const cols = Math.floor(W / SPACING);
    const rows = Math.floor(H / SPACING);

    const V = Array.from({ length: cols }, (_, i) => (
        <View
            key={`v-${i}`}
            style={{
                position: 'absolute',
                left: i * SPACING,
                width: 1,
                height: H,
                backgroundColor: color,
            }}
        />
    ));

    const HLines = Array.from({ length: rows }, (_, i) => (
        <View
            key={`h-${i}`}
            style={{
                position: 'absolute',
                top: i * SPACING,
                width: W,
                height: 1,
                backgroundColor: color,
            }}
        />
    ));

    return (
        <View pointerEvents="none" style={{ position: 'absolute', width: W, height: H }}>
            {[...V, ...HLines]}
        </View>
    );
};

export const renderPolkaDots = ({ width: W, height: H }, color) => {
    if (!W || !H) return null;

    const dotSpacing = 36;
    const dotSize = 6;

    const cols = Math.ceil(W / dotSpacing);
    const rows = Math.ceil(H / dotSpacing);

    const dots = [];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            dots.push(
                <View
                    key={`dot-${r}-${c}`}
                    style={{
                        position: 'absolute',
                        top: r * dotSpacing,
                        left: c * dotSpacing,
                        width: dotSize,
                        height: dotSize,
                        borderRadius: dotSize / 2,
                        backgroundColor: color,
                    }}
                />
            );
        }
    }

    return (
        <View pointerEvents="none" style={{ position: 'absolute', width: W, height: H }}>
            {dots}
        </View>
    );
};

export const renderDiagonalLines = ({ width: W, height: H }, color) => {
    if (!W || !H) return null;

    const SPACING = 30;
    const DIAG = Math.ceil((W + H) / SPACING) + 1;
    const LENGTH = Math.sqrt(W * W + H * H);

    const lines = Array.from({ length: DIAG }, (_, i) => {
        const offset = i * SPACING;
        return (
            <View
                key={`diag-${i}`}
                style={{
                    position: 'absolute',
                    left: offset - H,
                    top: 0,
                    width: 2,
                    height: LENGTH,
                    backgroundColor: color,
                    transform: [{ rotate: '45deg' }],
                }}
            />
        );
    });

    return (
        <View pointerEvents="none" style={{ position: 'absolute', width: W, height: H }}>
            {lines}
        </View>
    );
};

export const renderCrossHatch = ({ width: W, height: H }, color) => {
    if (!W || !H) return null;

    const SPACING = 25;
    const cols = Math.ceil(W / SPACING);
    const rows = Math.ceil(H / SPACING);
    const diag = Math.ceil((W + H) / SPACING) + 1;
    const LENGTH = Math.sqrt(W * W + H * H);

    const verticals = Array.from({ length: cols }, (_, i) => (
        <View key={`v-${i}`} style={{
            position: 'absolute',
            left: i * SPACING,
            top: 0,
            width: 1,
            height: H,
            backgroundColor: color,
        }} />
    ));

    const horizontals = Array.from({ length: rows }, (_, i) => (
        <View key={`h-${i}`} style={{
            position: 'absolute',
            top: i * SPACING,
            left: 0,
            height: 1,
            width: W,
            backgroundColor: color,
        }} />
    ));

    const diag45 = Array.from({ length: diag }, (_, i) => (
        <View key={`d1-${i}`} style={{
            position: 'absolute',
            left: -H + i * SPACING,
            top: 0,
            width: 2,
            height: LENGTH,
            backgroundColor: color,
            transform: [{ rotate: '45deg' }],
        }} />
    ));

    const diag135 = Array.from({ length: diag }, (_, i) => (
        <View key={`d2-${i}`} style={{
            position: 'absolute',
            left: -H + i * SPACING,
            top: 0,
            width: 2,
            height: LENGTH,
            backgroundColor: color,
            transform: [{ rotate: '-45deg' }],
        }} />
    ));

    return (
        <View pointerEvents="none" style={{ position: 'absolute', width: W, height: H }}>
            {verticals}
            {horizontals}
            {diag45}
            {diag135}
        </View>
    );
};

export const renderNoise = ({ width: W, height: H }, color, density = 'veryhigh') => {
    if (!W || !H) return null;

    const densityMap = {
        verylow: 100,
        low: 200,
        normal: 400,
        high: 600,
        veryhigh: 1000,
    };

    const DOTS = densityMap[density] ?? densityMap.normal;

    const dots = Array.from({ length: DOTS }, (_, i) => {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const size = Math.random() * 1.8 + 0.7;

        return (
            <View
                key={`n-${i}`}
                style={{
                    position: 'absolute',
                    left: x,
                    top: y,
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                }}
            />
        );
    });

    return (
        <View pointerEvents="none" style={{ position: 'absolute', width: W, height: H }}>
            {dots}
        </View>
    );
};

export const renderHexagons = ({ width: W, height: H }, color) => {
    if (!W || !H) return null;

    const size = 12;
    const h = size * Math.sqrt(3);
    const rows = Math.ceil(H / h);
    const cols = Math.ceil(W / (1.5 * size));

    const points = (cx, cy) => {
        let p = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = cx + size * Math.cos(angle);
            const y = cy + size * Math.sin(angle);
            p.push(`${x},${y}`);
        }
        return p.join(' ');
    };

    return (
        <Svg height={H} width={W} style={{ position: 'absolute' }}>
            {Array.from({ length: rows }, (_, row) =>
                Array.from({ length: cols }, (_, col) => {
                    const cx = size + col * 1.5 * size;
                    const cy = h / 2 + row * h + (col % 2 === 0 ? 0 : h / 2);
                    return (
                        <Path
                            key={`hx-${row}-${col}`}
                            d={`M${points(cx, cy)}Z`}
                            stroke={color}
                            strokeWidth={0.8}
                            fill="none"
                        />
                    );
                })
            )}
        </Svg>
    );
};

const generateSecureKey = async () => {
    const bytes = await Crypto.getRandomBytesAsync(32); // 256-bit key
    const wordArray = CryptoJS.lib.WordArray.create(bytes);
    return wordArray.toString(CryptoJS.enc.Hex); // hex string
};

const generateSecureIV = async () => {
    const bytes = await Crypto.getRandomBytesAsync(16); // 128-bit IV
    return CryptoJS.lib.WordArray.create(bytes);
};

export const getOrCreateEncryptionKey = async () => {
    let key = await AsyncStorage.getItem(ENCRYPTION_KEY_STORAGE);
    if (!key) {
        key = await generateSecureKey();
        await AsyncStorage.setItem(ENCRYPTION_KEY_STORAGE, key);
    }
    return key;
};

export const encryptData = async (data) => {
    try {
        const keyHex = await getOrCreateEncryptionKey();
        const keyWA = CryptoJS.enc.Hex.parse(keyHex);
        const iv = await generateSecureIV();

        const json = JSON.stringify(data);
        const encrypted = CryptoJS.AES.encrypt(json, keyWA, { iv });

        return JSON.stringify({
            iv: iv.toString(CryptoJS.enc.Hex),
            data: encrypted.toString(),
        });
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Encryption failed: ' + error.message);
    }
};

export const decryptData = async (encryptedStr) => {
    try {
        const keyHex = await getOrCreateEncryptionKey();
        const keyWA = CryptoJS.enc.Hex.parse(keyHex);

        const { iv, data } = JSON.parse(encryptedStr);
        const decrypted = CryptoJS.AES.decrypt(data, keyWA, {
            iv: CryptoJS.enc.Hex.parse(iv),
        });

        const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
        if (!jsonString) throw new Error('Invalid key or corrupted data');

        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Decryption failed: ' + error.message);
    }
};
