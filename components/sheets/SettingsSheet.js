import React, { useState, useEffect } from 'react';
import { Modal, Animated, View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons'; // Ensure you have react-native-vector-icons installed

const { height: screenHeight } = Dimensions.get('window');

const BottomSheet = ({ children, visible, setVisible, title }) => {
    const [translateY] = useState(new Animated.Value(screenHeight));
    const [overlayOpacity] = useState(new Animated.Value(0)); // New Animated.Value for overlay opacity
    const { colors, border, headerMode, variables } = useTheme();

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: screenHeight,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start(() => setVisible(false));
        }
    }, [visible, translateY, overlayOpacity, setVisible]);

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: (headerMode === 'fixed' ? colors.cardLighter : colors.background) + '90', // for modals
            justifyContent: 'flex-end',
        },
        bottomSheet: {
            backgroundColor: colors.modalBg,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderWidth: border,
            borderColor: colors.border,
            padding: 20,
            maxHeight: screenHeight * 0.6,
        },
        titleContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 25,
            borderBottomWidth: border,
            borderBottomColor: colors.border,
            paddingBottom: 10,
        },
        titleText: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            height: 20
        },
        closeIcon: {
            padding: 10,
        },
        handle: {
            width: 30,
            height: 4,
            backgroundColor: colors.border,
            borderRadius: 2,
            alignSelf: 'center',
            marginTop: -10,
            marginBottom: 10,
        },
        style: {
            backgroundColor: 'transparent',
            marginBottom: 15,
            borderRadius: variables.radius.lg,
            overflow: 'hidden',
            gap: 5
        },
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={() => setVisible(false)}
        >
            <Animated.View
                style={[styles.overlay, { opacity: overlayOpacity }]}
            >
                <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => setVisible(false)}
                    activeOpacity={1}
                />
                <Animated.View
                    style={[styles.bottomSheet, { transform: [{ translateY }] }]}
                >
                    <View style={styles.handle} />
                    {title && (
                        <View style={styles.titleContainer}>
                            <Text style={styles.titleText}>{title}</Text>
                            <TouchableOpacity
                                style={styles.closeIcon}
                                onPress={() => setVisible(false)}
                            >
                                <Icon name="close" size={20} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={styles.style}>
                        {children}
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

export default BottomSheet;