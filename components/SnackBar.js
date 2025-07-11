import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../utils/ThemeContext';

const Snackbar = ({ text, onClose, style }) => {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const timeoutRef = useRef(null);
    const isMountedRef = useRef(true);
    const { variables, colors } = useTheme();

    const styles = StyleSheet.create({
        snackbarContainer: {
            position: 'absolute',
            bottom: '25%',
            left: 0,
            right: 0,
            alignItems: 'center',
            zIndex: 1000,
            pointerEvents: 'box-none',
        },
        snackbar: {
            width: '80%',
            backgroundColor: colors.settingBlock,
            borderRadius: variables.radius.circle,
            paddingHorizontal: 16,
            paddingVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            elevation: 6,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        snackbarText: {
            color: colors.snackbarText,
            fontSize: 14,
            fontWeight: '600',
            textAlign: 'center',
            height: 20
        },
    });

    const handleClose = useCallback(() => {
        if (isMountedRef.current && onClose) {
            onClose();
        }
    }, [onClose]);

    const startDismissAnimation = useCallback(() => {
        Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
        }).start((finished) => {
            if (finished && isMountedRef.current) {
                handleClose();
            }
        });
    }, [scaleAnim, handleClose]);

    useEffect(() => {
        isMountedRef.current = true;
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 5,
        }).start();

        timeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
                startDismissAnimation();
            }
        }, 1000);

        return () => {
            isMountedRef.current = false;
            clearTimeout(timeoutRef.current);
        };
    }, [text]);

    return (
        <View style={[styles.snackbarContainer, style]} pointerEvents="box-none">
            <Animated.View
                style={[
                    styles.snackbar,
                    { transform: [{ scale: scaleAnim }] },
                ]}
            >
                <Text style={styles.snackbarText}>{text}</Text>
            </Animated.View>
        </View>
    );
};

export default Snackbar;