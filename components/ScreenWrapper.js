import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import {
    renderGrid,
    renderPolkaDots,
    renderDiagonalLines,
    renderCrossHatch,
    renderNoise,
} from '../utils/functions';
import { useTheme } from '../utils/ThemeContext';

const ScreenWrapper = React.memo(({
    children,
    colors,
    onScroll,
    onContentSizeChange,
    paddingX = 15,
    trigger
}) => {
    const [LAYOUT, setLAYOUT] = useState({ width: 0, height: 0 });
    const { backgroundPattern } = useTheme();

    // Memoize styles to prevent recreation on every render
    const styles = useMemo(() => StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: colors.background,
        },
        wrapper: {
            backgroundColor: colors.background,
            paddingHorizontal: paddingX,
            paddingBottom: 65,
            flex: 1,
            position: 'relative',
        },
        scrollContent: {
            flexGrow: 1,
        },
        gridOverlay: {
            ...StyleSheet.absoluteFillObject,
            zIndex: 0,
        },
        childrenWrapper: {
            zIndex: 1,
        }
    }), [colors.background, paddingX]);

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

    // Memoize layout handler
    const handleLayout = useCallback((e) => {
        const { width, height } = e.nativeEvent.layout;
        setLAYOUT({ width, height });
    }, []);

    // Memoize keyboard dismiss handler
    const handleDismissKeyboard = useCallback(() => {
        Keyboard.dismiss();
        trigger();
    }, []);

    return (
        <SafeAreaView style={styles.safeArea}>
            <TouchableWithoutFeedback
                onPress={handleDismissKeyboard}
                accessible={false}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                        onContentSizeChange={onContentSizeChange}
                        bounces
                        alwaysBounceVertical={false}
                    >
                        <View
                            style={styles.wrapper}
                            onLayout={handleLayout}
                        >
                            {backgroundPatternLayer && (
                                <View style={styles.gridOverlay}>
                                    {backgroundPatternLayer}
                                </View>
                            )}
                            <View style={styles.childrenWrapper}>
                                {children}
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
});

export default ScreenWrapper;