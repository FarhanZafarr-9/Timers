import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function Wave({
    width = 300,
    height = 60,
    amplitude = 20,
    frequency = 2,
    speed = 2000,
    color = '#4CAF50'
}) {
    const animatedPhase = useRef(new Animated.Value(0)).current;
    const phaseValueRef = useRef(0);
    const [tick, setTick] = useState(0);
    const animationFrameRef = useRef();

    useEffect(() => {
        Animated.loop(
            Animated.timing(animatedPhase, {
                toValue: 2 * Math.PI,
                duration: speed,
                useNativeDriver: false
            })
        ).start();

        const id = animatedPhase.addListener(({ value }) => {
            phaseValueRef.current = value;
        });

        // Throttled re-render using requestAnimationFrame
        const updateTick = () => {
            setTick(prev => prev + 1);
            animationFrameRef.current = requestAnimationFrame(updateTick);
        };
        animationFrameRef.current = requestAnimationFrame(updateTick);

        return () => {
            animatedPhase.removeListener(id);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [speed]);

    // Memoize path calculation with reduced points for better performance
    const path = useMemo(() => {
        const points = 180; // Reduced from 300 to 100 for better performance
        const dx = width / points;
        let pathString = '';

        for (let i = 0; i <= points; i++) {
            const x = i * dx;
            const y = height / 2 + amplitude * Math.sin(2 * Math.PI * frequency * i / points + phaseValueRef.current);
            pathString += `${i === 0 ? 'M' : 'L'}${x},${y} `;
        }

        return pathString;
    }, [width, height, amplitude, frequency, tick]); // tick forces recalculation

    return (
        <Svg width={width} height={height}>
            <Path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth="3"
            />
        </Svg>
    );
}
