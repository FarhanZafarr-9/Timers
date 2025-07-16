import React from 'react';
import { View, Dimensions } from 'react-native';
import Wave from './Wave'; // assuming your existing Wave component is here

export default function WaveProgress({
    progressPct = 50,
    amplitude = 3,
    frequency = 2,
    speed = 1.8,
    height = 20,
    width = Dimensions.get('window').width,
    colorCompleted = '#3b82f6',
    colorRemaining = '#3b82f680'
}) {
    return (
        <View style={{
            height,
            width,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 8
        }}>
            {/* Bottom wave - remaining */}
            <Wave
                amplitude={amplitude}
                frequency={frequency}
                speed={speed}
                height={height}
                width={width}
                color={colorRemaining}
            />

            {/* Top wave - completed, clipped to progress */}
            <View style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${progressPct}%`,
            overflow: 'hidden'
            }}>
            <Wave
                amplitude={amplitude}
                frequency={frequency}
                speed={speed}
                height={height}
                width={width}
                color={colorCompleted}
            />
        </View>
        </View >
    );
}