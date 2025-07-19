import {
    View,
    StyleSheet,
    SafeAreaView,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from 'react-native';
import { useState } from 'react';

const ScreenWrapper = ({
    children,
    colors,
    onScroll,
    onContentSizeChange,
    paddingX = 15
}) => {

    const [LAYOUT, setLAYOUT] = useState({ width: 0, height: 0 });

    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: colors.background,
        },
        wrapper: {
            backgroundColor: colors.background,
            paddingHorizontal: paddingX,
            paddingBottom: 65,
            flex: 1,
            position: 'relative', // Needed to anchor grid overlay
        },
        scrollContent: {
            flexGrow: 1,
        },
        line: {
            position: 'absolute',
            backgroundColor: colors.highlight + '05',
        },
        gridOverlay: {
            ...StyleSheet.absoluteFillObject,
            zIndex: 0, // show behind children, but must not be -1
        },
        childrenWrapper: {
            zIndex: 1,
        }
    });

    const renderGrid = ({ width: W, height: H }) => {
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
                    backgroundColor: colors.highlight + '10',
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
                    backgroundColor: colors.highlight + '10',
                }}
            />
        ));

        return (
            <View pointerEvents="none" style={{ position: 'absolute', width: W, height: H }}>
                {[...V, ...HLines]}
            </View>
        );
    };

    const renderPolkaDots = ({ width: W, height: H }) => {
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
                            backgroundColor: colors.highlight + '10',
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



    return (
        <SafeAreaView style={styles.safeArea}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
                            style={[styles.wrapper, { flex: 1 }]}
                            onLayout={(e) => {
                                const { width, height } = e.nativeEvent.layout;
                                setLAYOUT({ width, height });
                            }}
                        >

                            <View style={styles.childrenWrapper}>{children}</View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};

export default ScreenWrapper;
//{renderGrid(LAYOUT)}
//{ renderPolkaDots(LAYOUT) }