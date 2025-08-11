import React, { useEffect, useState } from 'react';
import {
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
    ScrollView,
    Linking
} from 'react-native';
import { appBuild, appVersion, changelog } from '../../utils/functions';
import { getLastShownVersion, setLastShownVersion } from '../../utils/storage/storageUtils';
import { Icons } from '../../assets/icons';
import { useTheme } from '../../contexts/ThemeContext';
import BottomSheet from './BottomSheet';

const ChangeLogSheet = ({ visible, onClose, forced = false }) => {
    const [lastShownVersion, setLastShownVersionState] = useState(null);
    const [selectedTags, setSelectedTags] = useState("all");

    const { colors, variables, border } = useTheme();

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
        if (visible && !forced) {
            setLastShownVersion(appVersion);
        }
    }, [visible, forced]);

    const getBulletColor = (type) => {
        switch (type) {
            case "new":          // new features, additions
                return "#10B981";  // Modern emerald green (Tailwind emerald-500)
            case "improved":     // improvements & enhancements
                return "#3B82F6";  // Modern bright blue (Tailwind blue-500)
            case "fixed":        // bug fixes
                return "#EF4444";  // Modern red (Tailwind red-500)
            case "wip":          // work in progress or experimental
                return "#F59E0B";  // Modern amber (Tailwind amber-500)
            case "removed":      // removed or deprecated features
                return "#8B5CF6";  // Modern violet (Tailwind violet-500)
            case "summarized":   // summary point
                return "#6B7280";  // Modern gray (Tailwind gray-500)
            default:
                return colors.text; // fallback color
        }
    };

    // flatten all types for tags - expand multi-type entries
    const expandedChanges = latest.changes.flatMap(change => {
        if (Array.isArray(change.type)) {
            // Create separate entries for each type
            return change.type.map(type => ({
                ...change,
                type: type
            }));
        }
        return [change];
    });

    const allTypes = [...new Set(expandedChanges.map(c => c.type))];
    const tags = ["all", ...allTypes];

    const toggleTag = (tag) => {
        setSelectedTags(tag);
    };

    // Filtering changes according to selected tag
    const filteredChanges = selectedTags === "all"
        ? expandedChanges.filter(c => c.type !== "summarized") // exclude summarized from "all"
        : expandedChanges.filter(c => c.type === selectedTags);


    const styles = StyleSheet.create({
        container: {
            flex: 1,
            height: '100%',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingBottom: 15,
            borderBottomWidth: 1.5,
            borderBottomColor: colors.border,
            marginBottom: 15,
        },
        titleText: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            height: 24
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
        scrollContainer: {
            flex: 1,
            height: '100%',
        },
        scrollContent: {
            paddingBottom: 40,
            flexGrow: 1,
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
            marginBottom: 20
        },
        updateButtonText: {
            color: colors.background,
            fontSize: 16,
            fontWeight: '600',
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 15,
            lineHeight: 20,
        }
    });

    const headline = latest.major && updateNeeded
        ? "Update Available!"
        : updateNeeded
            ? `Update to v${latest.version}`
            : "Current Version";

    const handleClose = () => {
        if (!(latest.major && updateNeeded)) {
            onClose();
        }
    };

    return (
        <BottomSheet
            visible={visible}
            onClose={handleClose}
            snapPoints={[0.6, 1]}
            initialSnapIndex={0}
            enableBackdropDismiss={!(latest.major && updateNeeded)}
            enablePanDownToClose={!(latest.major && updateNeeded)}
            allowSnapping={!(latest.major && updateNeeded)}
            fullFlex={true}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Icons.Ion name="sparkles" size={20} color={colors.text} />
                    <Text style={[styles.titleText, { marginLeft: 15 }]}>{headline}</Text>
                    <Text style={styles.versionDate}>
                        {`v${latest.version}-${appBuild} • ${latest.date}`}
                    </Text>
                </View>

                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                    scrollEventThrottle={16}
                    nestedScrollEnabled={true}
                >
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 }}>
                        {tags.map((tag, idx) => {
                            const isSelected = selectedTags === tag;
                            return (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => toggleTag(tag)}
                                    activeOpacity={0.8}
                                    style={[
                                        styles.pill,
                                        {
                                            backgroundColor: isSelected
                                                ? getBulletColor(tag)
                                                : (tag === "all" ? colors.modalBg : getBulletColor(tag) + '20'),
                                            borderColor: isSelected
                                                ? getBulletColor(tag)
                                                : (tag === "all" ? colors.border : getBulletColor(tag) + 'c0')
                                        }
                                    ]}
                                >
                                    <Text style={{
                                        color: isSelected
                                            ? colors.background
                                            : (tag === "all" ? colors.text : getBulletColor(tag)),
                                        fontSize: 14,
                                        fontWeight: '600'
                                    }}>
                                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <Text style={styles.sectionTitle}>
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

                    {filteredChanges.map((change, idx) => {
                        const bulletColor = getBulletColor(change.type);
                        return (
                            <View key={idx} style={styles.changeItem}>
                                <View style={[styles.bullet, { backgroundColor: bulletColor }]} />
                                <Text style={styles.changeText}>{change.text}</Text>
                            </View>
                        );
                    })}
                </ScrollView>
            </View>
        </BottomSheet>
    );
};

export default ChangeLogSheet;