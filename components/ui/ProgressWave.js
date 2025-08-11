import React, { useMemo, useRef, useEffect } from 'react';
import { View, Dimensions, Animated, Easing } from 'react-native';
import Wave from './Wave';

const screenWidth = Dimensions.get('window').width;

export default React.memo(function ProgressWave({
    progressPct = 50,
    amplitude = 3,
    frequency = 2,
    speed = 1.8,
    height = 20,
    width = screenWidth,
    colorCompleted = '#3b82f6',
    colorRemaining = '#3b82f680'
}) {
    // Styles memoized for performance
    const containerStyle = useMemo(
        () => ({
            height,
            width,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 8
        }),
        [height, width]
    );

    const clippingMaskStyle = useMemo(
        () => ({
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${progressPct}%`,
            overflow: 'hidden'
        }),
        [progressPct]
    );

    // Shared animated value for phase sync
    const phase = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.timing(phase, {
                toValue: 1,
                duration: (1 / speed) * 4000, // synced with speed
                easing: Easing.linear,
                useNativeDriver: true
            })
        );
        loop.start();
        return () => loop.stop();
    }, [phase, speed]);

    const waveProps = useMemo(
        () => ({
            amplitude,
            frequency,
            height,
            width,
            phase // pass same phase to both waves
        }),
        [amplitude, frequency, height, width, phase]
    );

    return (
        <View style={containerStyle}>
            {/* Remaining wave */}
            <Wave {...waveProps} color={colorRemaining} />

            {/* Completed wave */}
            <View style={clippingMaskStyle}>
                <Wave {...waveProps} color={colorCompleted} />
            </View>
        </View>
    );
});
