import { useState, useRef, useMemo } from 'react';
import {
    View,
    Animated,
    FlatList,
    TouchableWithoutFeedback
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import CollapsingHeader from './CollapsingHeader';
import ScreenWrapper from '../ui/ScreenWrapper';
import {
    shouldForceCollapsed,
    MAX_HEADER_HEIGHT,
    MIN_HEADER_HEIGHT,
    HEADER_MARGIN_TOP,
    renderGrid,
    renderPolkaDots,
    renderDiagonalLines,
    renderCrossHatch,
    renderNoise,
} from '../../utils/functions';
import { useNavBar } from '../../contexts/NavContext';

export default function HeaderScreen({
    headerIcon,
    headerTitle,
    borderRadius = 0,
    children,
    paddingMargin = 20,
    useFlatList = false,
    flatListProps = {},
    paddingX = 15
}) {
    const { colors, headerMode, backgroundPattern } = useTheme();
    const [contentHeight, setContentHeight] = useState(0);
    const scrollY = useRef(new Animated.Value(0)).current;
    const [LAYOUT, setLAYOUT] = useState({ width: 0, height: 0 });
    const { trigger } = useNavBar();

    const forceCollapsed = headerMode !== 'collapsible' || shouldForceCollapsed(contentHeight);
    const headerPaddingTop = headerMode !== 'collapsible'
        ? 0
        : (forceCollapsed ? MIN_HEADER_HEIGHT : MAX_HEADER_HEIGHT) + HEADER_MARGIN_TOP;

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: false,
            listener: () => {
                trigger();
            }
        }
    );
    const handleTouch = () => {
        trigger();
    };

    // Memoize the background pattern to prevent unnecessary re-renders
    const backgroundPatternLayer = useMemo(() => {
        if (LAYOUT.width <= 0 || LAYOUT.height <= 0) return null;

        const C = colors.highlight + '10';
        switch (backgroundPattern) {
            case 'grid': return renderGrid(LAYOUT, C);
            case 'polka': return renderPolkaDots(LAYOUT, C);
            case 'diagonal': return renderDiagonalLines(LAYOUT, C);
            case 'cross': return renderCrossHatch(LAYOUT, C);
            case 'noise': return renderNoise(LAYOUT, colors.highlight + '50');
            default: return null;
        }
    }, [LAYOUT, backgroundPattern, colors.highlight]);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <CollapsingHeader
                icon={headerIcon}
                title={headerTitle}
                scrollY={scrollY}
                colors={colors}
                pageLength={contentHeight}
                borderRadius={borderRadius}
                paddingX={paddingX}
            />

            {/* Grid Background Layer - Now memoized */}
            {backgroundPatternLayer && (
                <View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: LAYOUT.width,
                        height: LAYOUT.height,
                    }}
                >
                    {backgroundPatternLayer}
                </View>
            )}

            <TouchableWithoutFeedback onPressIn={handleTouch} onTouchStart={handleTouch}>
                <View style={{ flex: 1 }}>
                    {useFlatList ? (
                        <FlatList
                            {...flatListProps}
                            bounces={false}
                            contentInsetAdjustmentBehavior="never"
                            style={{ flex: 1 }}
                            contentContainerStyle={[
                                {
                                    flexGrow: 1,
                                    paddingTop: headerPaddingTop + paddingMargin,
                                    paddingHorizontal: paddingX,
                                    paddingBottom: 65,
                                },
                                flatListProps.contentContainerStyle
                            ]}
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                            onContentSizeChange={(w, h) => setContentHeight(h)}
                            keyboardShouldPersistTaps="handled"
                            onLayout={(e) => {
                                const { width, height } = e.nativeEvent.layout;
                                setLAYOUT({ width, height });
                            }}
                        />
                    ) : (
                        <ScreenWrapper
                            onScroll={handleScroll}
                            onContentSizeChange={(w, h) => setContentHeight(h)}
                            colors={colors}
                            paddingX={paddingX}
                            trigger={trigger}
                            onLayout={(e) => {
                                const { width, height } = e.nativeEvent.layout;
                                setLAYOUT({ width, height });
                            }}
                        >
                            <View style={{
                                paddingTop: headerPaddingTop + paddingMargin,
                                minHeight: '100%',
                            }}>
                                {children}
                            </View>
                        </ScreenWrapper>
                    )}
                </View>
            </TouchableWithoutFeedback>
        </View>
    );
}