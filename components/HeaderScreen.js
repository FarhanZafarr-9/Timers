import React, { useState, useRef } from 'react';
import { View, Animated, FlatList } from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import CollapsingHeader from './CollapsingHeader';
import ScreenWrapper from './ScreenWrapper';
import {
    shouldForceCollapsed,
    MAX_HEADER_HEIGHT,
    MIN_HEADER_HEIGHT,
    HEADER_MARGIN_TOP
} from '../utils/functions';

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
    const { colors, headerMode } = useTheme();
    const [contentHeight, setContentHeight] = useState(0);
    const scrollY = useRef(new Animated.Value(0)).current;

    const forceCollapsed = headerMode !== 'collapsible' || shouldForceCollapsed(contentHeight);
    const headerPaddingTop = headerMode !== 'collapsible' ? 0 : (forceCollapsed ? MIN_HEADER_HEIGHT : MAX_HEADER_HEIGHT) + HEADER_MARGIN_TOP;

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
    );

    return (
        <>
            <CollapsingHeader
                icon={headerIcon}
                title={headerTitle}
                scrollY={scrollY}
                colors={colors}
                pageLength={contentHeight}
                borderRadius={borderRadius}
                paddingX={paddingX}
            />

            {useFlatList ? (
                <FlatList
                    {...flatListProps}
                    bounces={false}
                    contentInsetAdjustmentBehavior="never"
                    style={{ flex: 1, backgroundColor: colors.background }}
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingTop: headerPaddingTop + paddingMargin,
                        paddingHorizontal: 15,
                        paddingBottom: 65,
                        backgroundColor: colors.background,
                    }}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    onContentSizeChange={(w, h) => setContentHeight(h)}
                    keyboardShouldPersistTaps="handled"
                    ListFooterComponent={<View style={{ height: 20 }} />}
                />

            ) : (
                <ScreenWrapper
                    onScroll={handleScroll}
                    onContentSizeChange={(w, h) => setContentHeight(h)}
                    colors={colors}
                    paddingX={paddingX}
                >
                    <View style={{
                        paddingTop: headerPaddingTop + paddingMargin,
                        minHeight: '100%',
                    }}>
                        {children}
                    </View>
                </ScreenWrapper>
            )}
        </>
    );
}
/*
contentContainerStyle={{ paddingBottom: 95 }} // important for scroll spacing
            useFlatList={false} 
           ==> for scrollability
*/