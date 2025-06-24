import { Dimensions, Platform } from 'react-native';

export const HEADER_MARGIN_TOP = 50;
export const MAX_HEADER_HEIGHT = Platform.OS === 'ios' ? 130 : 66;
export const MIN_HEADER_HEIGHT = 60;

export function shouldForceCollapsed(pageLength) {
    const screenHeight = Dimensions.get('window').height;
    return pageLength !== null && (pageLength / 1.1) < screenHeight;
}