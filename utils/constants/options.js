import { Icons } from '../../assets/icons';
import { MaterialIcons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';

export const HEADER_MARGIN_TOP = 50;
export const MAX_HEADER_HEIGHT = 66;
export const MIN_HEADER_HEIGHT = 60;

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
    { label: 'Subtle', value: 'subtle', icon: <Icons.Ion name="ellipse-outline" size={16} color="#9ca3af" />, description: 'Neutral tones for a soft, balanced look' },
    { label: 'Ash', value: 'ash', icon: <Icons.Ion name="cloudy-outline" size={16} color="#6b7280" />, description: 'Muted greys with a cool, minimal touch' }
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