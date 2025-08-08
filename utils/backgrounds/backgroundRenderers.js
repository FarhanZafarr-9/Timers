import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

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
