import React, { useEffect, useState } from 'react';
import {
    Modal,
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    ScrollView,
    Linking
} from 'react-native';
import { appVersion, changelog } from '../utils/functions';
import { getLastShownVersion, setLastShownVersion } from '../utils/updateStorage';
import { Icons } from '../assets/icons';
import { useTheme } from '../utils/ThemeContext';

const { height: screenHeight } = Dimensions.get('window');

const BottomSheetChangelog = ({ visible, onClose, forced = false }) => {
    const [translateY] = useState(new Animated.Value(screenHeight));
    const [opacity] = useState(new Animated.Value(0));
    const [lastShownVersion, setLastShownVersionState] = useState(null);

    const { colors, variables, isBorder, headerMode } = useTheme();

    const latest = changelog[0];
    const updateNeeded = (!forced && lastShownVersion !== latest.version && latest.version === appVersion) ;

    useEffect(() => {
        const fetchVersion = async () => {
            const last = await getLastShownVersion();
            setLastShownVersionState(last);
        };
        fetchVersion();
    }, []);

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
            if (!forced) setLastShownVersion(latest.version);
        } else {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: screenHeight,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: (headerMode === 'fixed' ? colors.settingBlock : colors.background) + '90',
            justifyContent: 'flex-end',
        },
        bottomSheet: {
            backgroundColor: colors.modalBg,
            borderTopLeftRadius: variables.radius.lg,
            borderTopRightRadius: variables.radius.lg,
            paddingBottom: 20,
            borderWidth: isBorder ? 0.75 : 0,
            borderColor: colors.border,
            maxHeight: screenHeight * 0.7,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10,
        },
        handle: {
            width: 40,
            height: 4,
            backgroundColor: colors.border,
            borderRadius: 2,
            alignSelf: 'center',
            marginTop: 12,
            marginBottom: 8,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingBottom: 10,
            borderBottomWidth: 1.5,
            borderBottomColor: colors.border,
        },
        titleText: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            height: 30
        },
        versionDate: {
            fontSize: 12,
            color: colors.textDesc,
            marginLeft: 'auto',
            backgroundColor: colors.highlight + '10',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: variables.radius.circle
        },
        changeItem: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 12,
            paddingHorizontal: 20,
        },
        changeTextContainer: {
            flex: 1,
        },
        changeText: {
            fontSize: 15,
            color: colors.text,
            lineHeight: 22,
        },
        bullet: {
            width: 6,
            height: 6,
            backgroundColor: colors.text,
            borderRadius: 3,
            marginTop: 6,
            marginRight: 10,
        },
        majorNotice: {
            marginTop: 10,
            marginBottom: 15,
            fontSize: 15,
            fontWeight: '600',
            color: colors.highlight
        },
        updateButton: {
            backgroundColor: colors.highlight,
            paddingVertical: 10,
            borderRadius: 10,
            alignItems: 'center',
            marginTop: 10,
        },
        updateButtonText: {
            color: colors.background,
            fontSize: 16,
            fontWeight: '600',
            height: 25
        }
    });

    const headline = latest.major && updateNeeded
        ? "Update Available!"
        : updateNeeded
            ? `Updated to v${latest.version}`
            : "Current Version";

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <Animated.View style={[styles.overlay, { opacity }]}>
                <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={onClose}
                    activeOpacity={1}
                />
                <Animated.View
                    style={[styles.bottomSheet, { transform: [{ translateY }] }]}
                >
                    <View style={styles.handle} />
                    <View style={styles.header}>
                        <Icons.Ion name="sparkles" size={20} color={colors.text} />
                        <Text style={[styles.titleText,{marginLeft: 15}]}>{headline}</Text>
                        <Text style={styles.versionDate}>
                            {`v${latest.version} • ${latest.date}`}
                        </Text>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10, marginHorizontal: 20 }}>
                        <Text style={[styles.titleText, { fontSize: 16, marginBottom: 20 }]}>
                            {latest.title}
                        </Text>

                        {latest.major && updateNeeded && (
                            <Text style={styles.majorNotice}>
                                Major update! Please consider downloading the latest APK for full features.
                            </Text>
                        )}

                        {latest.changes.map((change, idx) => (
                            <View style={styles.changeItem}>
                                <View style={styles.bullet} />
                                <View style={styles.changeTextContainer}>
                                    <Text style={styles.changeText}>{change}</Text>
                                </View>
                            </View>
                        ))}

                        {latest.major && updateNeeded && (
                            <TouchableOpacity
                                style={styles.updateButton}
                                onPress={() => Linking.openURL("https://github.com/YourRepo/releases")}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.updateButtonText}>Go to Update Page</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

export default BottomSheetChangelog;