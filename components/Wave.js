import React, { useEffect, useRef, useState } from 'react';
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
    const [phaseValue, setPhaseValue] = useState(0);

    useEffect(() => {
        Animated.loop(
            Animated.timing(animatedPhase, {
                toValue: 2 * Math.PI,
                duration: speed,
                useNativeDriver: false
            })
        ).start();

        const id = animatedPhase.addListener(({ value }) => {
            setPhaseValue(value);
        });

        return () => {
            animatedPhase.removeListener(id);
        };
    }, [speed]);

    const points = 300;
    const dx = width / points;
    let path = '';

    for (let i = 0; i <= points; i++) {
        let x = i * dx;
        let y = height / 2 + amplitude * Math.sin(2 * Math.PI * frequency * i / points + phaseValue);
        path += `${i === 0 ? 'M' : 'L'}${x},${y} `;
    }

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