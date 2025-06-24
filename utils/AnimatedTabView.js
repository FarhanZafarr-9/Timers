import { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';

const AnimatedTabView = ({ children, backgroundColor }) => {
    const isFocused = useIsFocused();
    const translateX = useSharedValue(isFocused ? 0 : 50);

    useEffect(() => {
        translateX.value = withTiming(isFocused ? 0 : 50, { duration: 250 });
    }, [isFocused]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        flex: 1,
        backgroundColor: backgroundColor || '#000',
    }));

    return (
        <Animated.View style={animatedStyle}>
            {children}
        </Animated.View>
    );
};

export default AnimatedTabView;