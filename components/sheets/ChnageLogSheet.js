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
import { appBuild, appVersion, changelog } from '../../utils/functions';
import { getLastShownVersion, setLastShownVersion } from '../../utils/storage/storageUtils';
import { Icons } from '../../assets/icons';
import { useTheme } from '../../contexts/ThemeContext';

const { height: screenHeight } = Dimensions.get('window');

const ChnageLogSheet = ({ visible, onClose, forced = false }) => {
    const [translateY] = useState(new Animated.Value(screenHeight));
    const [opacity] = useState(new Animated.Value(0));
    const [lastShownVersion, setLastShownVersionState] = useState(null);
    const [isReallyVisible, setIsReallyVisible] = useState(false);
    const [selectedTag, setSelectedTag] = useState("all");

    const { colors, variables, isBorder, headerMode, border } = useTheme();

    const latest = changelog[0];
    const updateNeeded = (lastShownVersion !== latest.version && latest.version !== appVersion);

    useEffect(() => {
        const fetchVersion = async () => {
            const last = await getLastShownVersion();
            setLastShownVersionState(last);
        };
        fetchVersion();
    }, []);

    useEffect(() => {
        if (visible) {
            setIsReallyVisible(true);
            showBottomSheet();
            if (!forced) setLastShownVersion(appVersion);
        } else {
            hideBottomSheet();
        }
    }, [visible]);

    const showBottomSheet = () => {
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
    };

    const hideBottomSheet = () => {
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
        ]).start(() => {
            setIsReallyVisible(false);
            onClose();
        });
    };

    const getBulletColor = (type) => {
        switch (type) {
            case "new": return "#4CAF50";
            case "improved": return "#2196F3";
            case "fixed": return "#F44336";
            case "wip": return "#FF9800";
            case "removed": return "#9C27B0";
            case "security": return "#009688";
            case "summarized": return "#FF6B35";
            default: return colors.text;
        }
    };
    const tags = ["all", ...new Set(latest.changes.map(c => c.type))];

    const filteredChanges = selectedTag === "all"
        ? latest.changes.filter(change => change.type !== "summarized")
        : latest.changes.filter(change => change.type === selectedTag);

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: (headerMode === 'fixed' ? colors.cardLighter : colors.background) + '90',
            justifyContent: 'flex-end',
        },
        bottomSheet: {
            backgroundColor: colors.modalBg,
            borderTopLeftRadius: variables.radius.lg,
            borderTopRightRadius: variables.radius.lg,
            paddingBottom: 20,
            borderWidth: border,
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
            height: 30,
        },
        versionDate: {
            fontSize: 12,
            color: colors.textDesc,
            marginLeft: 'auto',
            backgroundColor: colors.highlight + '12',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: variables.radius.circle,
            borderWidth: 0.75,
            borderColor: colors.border
        },
        pill: {
            borderWidth: 1,
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 6,
            marginRight: 8,
            marginBottom: 8
        },
        changeItem: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 12,
            paddingRight: 15,
            paddingLeft: 10,
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
            borderRadius: 3,
            marginTop: 7,
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
            marginBottom: 30
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
            ? `Update to v${latest.version}`
            : "Current Version";

    return (
        <Modal
            visible={isReallyVisible}
            transparent
            animationType="none"
            onRequestClose={() => { if (!(latest.major && updateNeeded)) onClose(); }}
            statusBarTranslucent
        >
            <Animated.View style={[styles.overlay, { opacity }]}>
                <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => {
                        if (!(latest.major && updateNeeded)) onClose();
                    }}
                    activeOpacity={1}
                />
                <Animated.View style={[styles.bottomSheet, { transform: [{ translateY }] }]}>
                    <View style={styles.handle} />
                    <View style={styles.header}>
                        <Icons.Ion name="sparkles" size={20} color={colors.text} />
                        <Text style={[styles.titleText, { marginLeft: 15 }]}>{headline}</Text>
                        <Text style={styles.versionDate}>
                            {`v${latest.version}-${appBuild} • ${latest.date}`}
                        </Text>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10, marginHorizontal: 20 }}>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 }}>
                            {tags.map((tag, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => setSelectedTag(tag)}
                                    activeOpacity={0.8}
                                    style={[
                                        styles.pill,
                                        {
                                            backgroundColor: selectedTag === tag
                                                ? getBulletColor(tag)
                                                : (tag === "all" ? colors.modalBg : getBulletColor(tag) + '20'),
                                            borderColor: selectedTag === tag
                                                ? getBulletColor(tag)
                                                : (tag === "all" ? colors.border : getBulletColor(tag) + 'c0')
                                        }
                                    ]}
                                >
                                    <Text style={{
                                        color: selectedTag === tag
                                            ? colors.background
                                            : (tag === "all" ? colors.text : getBulletColor(tag)),
                                        fontSize: 14,
                                        fontWeight: '600'
                                    }}>
                                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.titleText, { fontSize: 16, marginBottom: 20 }]}>
                            {latest.title}
                        </Text>

                        {latest.major && updateNeeded && (
                            <Text style={styles.majorNotice}>
                                Major update! Please consider downloading the latest APK for full features.
                            </Text>
                        )}

                        {latest.major && updateNeeded && (
                            <TouchableOpacity
                                style={styles.updateButton}
                                onPress={() => Linking.openURL("https://github.com/FarhanZafarr-9/Timers/releases")}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.updateButtonText}>Go to Update Page</Text>
                            </TouchableOpacity>
                        )}

                        {filteredChanges.map((change, idx) => (
                            <View key={idx} style={styles.changeItem}>
                                <View style={[styles.bullet, { backgroundColor: getBulletColor(change.type) }]} />
                                <Text style={styles.changeText}>{change.text}</Text>
                            </View>
                        ))}

                    </ScrollView>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

export default ChnageLogSheet;
