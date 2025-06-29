import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../utils/ThemeContext';

const Snackbar = ({ text, onClose, style }) => {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const timeoutRef = useRef(null);
    const isMountedRef = useRef(true);
    const { variables, colors } = useTheme();

    // Add some debugging
    console.log('Snackbar rendered with text:', text);

    const styles = StyleSheet.create({
        snackbarContainer: {
            position: 'absolute',
            bottom: '25%',
            left: 0,
            right: 0,
            width: '100%',
            alignItems: 'center',
            zIndex: 10,
            pointerEvents: 'box-none',
        },
        snackbar: {
            width: '60%',
            backgroundColor: colors.snackbarBg,
            borderRadius: variables.radius.sm,
            paddingHorizontal: 16,
            paddingVertical: 10,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            elevation: 6,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        snackbarText: {
            color: colors.snackbarText,
            fontSize: 14,
            fontWeight: '600',
            fontStyle: 'italic',
            textAlign: 'center',
        },
    });

    const handleClose = useCallback(() => {

        if (isMountedRef.current && onClose) {
            onClose();
        }
    }, [onClose, text]);

    const startDismissAnimation = useCallback(() => {

        if (!isMountedRef.current) {

            return;
        }

        Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
        }).start((finished) => {

            if (finished && isMountedRef.current) {
                handleClose();
            }
        });
    }, [scaleAnim, handleClose, text]);

    useEffect(() => {


        // Reset mounted ref
        isMountedRef.current = true;

        // Show animation
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 5,
        }).start();
        // Auto dismiss timer
        timeoutRef.current = setTimeout(() => {

            if (isMountedRef.current) {
                startDismissAnimation();
            }
        }, 2000);

        return () => {

            isMountedRef.current = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [text]); // Changed dependency to just text instead of scaleAnim and startDismissAnimation

    return (
        <View style={[styles.snackbarContainer, style]} pointerEvents="box-none">
            <Animated.View
                style={[
                    styles.snackbar,
                    { transform: [{ scale: scaleAnim }] }
                ]}
                pointerEvents="none"
            >
                <Text style={styles.snackbarText}>{text}</Text>
            </Animated.View>
        </View>
    );
};

export default Snackbar;