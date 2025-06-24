import React, { useState, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useTheme } from '../utils/variables';
import CollapsibleHeader from './CollapsibleHeader';
import ScreenWrapper from './ScreenWrapper';
import { shouldForceCollapsed, MAX_HEADER_HEIGHT, MIN_HEADER_HEIGHT, HEADER_MARGIN_TOP } from '../utils/functions';
export default function ScreenWithHeader({
    headerIcon,
    headerTitle,
    borderRadius = 0,
    children,
    paddingMargin = 20
}) {
    const { colors } = useTheme();
    const [contentHeight, setContentHeight] = useState(0);
    const scrollY = useRef(new Animated.Value(0)).current;

    const forceCollapsed = shouldForceCollapsed(contentHeight);
    const headerPaddingTop = (forceCollapsed ? MIN_HEADER_HEIGHT : MAX_HEADER_HEIGHT) + HEADER_MARGIN_TOP;

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
    );

    return (
        <>
            <CollapsibleHeader
                icon={headerIcon}
                title={headerTitle}
                scrollY={scrollY}
                colors={colors}
                pageLength={contentHeight}
                borderRadius={borderRadius}
            />
            <ScreenWrapper
                onScroll={handleScroll}
                onContentSizeChange={(w, h) => setContentHeight(h)}
                colors={colors}
            >
                <View style={[{ paddingTop: headerPaddingTop + paddingMargin }]}>
                    {children}
                </View>
            </ScreenWrapper>
        </>
    );
}