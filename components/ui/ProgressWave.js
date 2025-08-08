import React, { useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import Wave from './Wave'; // assuming your existing Wave component is here

// Get screen width once at module level to avoid repeated calls
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
    // Memoize container styles to prevent recalculation
    const containerStyle = useMemo(() => ({
        height,
        width,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 8
    }), [height, width]);

    // Memoize clipping mask styles to prevent recalculation
    const clippingMaskStyle = useMemo(() => ({
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: `${progressPct}%`,
        overflow: 'hidden'
    }), [progressPct]);

    // Memoize wave props to prevent unnecessary re-renders
    const waveProps = useMemo(() => ({
        amplitude,
        frequency,
        speed,
        height,
        width
    }), [amplitude, frequency, speed, height, width]);

    return (
        <View style={containerStyle}>
            {/* Bottom wave - remaining */}
            <Wave
                {...waveProps}
                color={colorRemaining}
            />

            {/* Top wave - completed, clipped to progress */}
            <View style={clippingMaskStyle}>
                <Wave
                    {...waveProps}
                    color={colorCompleted}
                />
            </View>
        </View>
    );
});
