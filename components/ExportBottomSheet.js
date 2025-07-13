import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Animated,
    TouchableWithoutFeedback,
    StyleSheet,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { Icons } from '../assets/icons';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../utils/ThemeContext';

const { height: screenHeight } = Dimensions.get('window');
const DIRECTORY_KEY = 'download_directory_uri';

const ExportBottomSheet = ({
    visible,
    onClose,
    cardRef,
    sheetRef,
    colors,
    variables
}) => {
    const slideAnim = useRef(new Animated.Value(screenHeight)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [isExporting, setIsExporting] = useState(false);
    const [currentAction, setCurrentAction] = useState(null);
    const { isBorder } = useTheme();

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            slideAnim.setValue(screenHeight);
            fadeAnim.setValue(0);
            setCurrentAction(null);
        }
    }, [visible]);

    const closeSheet = () => {
        if (isExporting) return;
        onClose();
    };

    const getOrRequestDirectory = async () => {
        let uri = await AsyncStorage.getItem(DIRECTORY_KEY);
        if (uri) return uri;

        const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permission.granted) {
            throw new Error('Permission not granted');
        }

        uri = permission.directoryUri;
        await AsyncStorage.setItem(DIRECTORY_KEY, uri);
        return uri;
    };

    const handleExportAction = async (ref, viewType, action) => {
        if (isExporting) return;

        setIsExporting(true);
        setCurrentAction(action);

        try {
            if (!ref?.current) {
                throw new Error('View reference not available');
            }

            const uri = await ref.current.capture();
            if (!uri) {
                throw new Error('Failed to capture view');
            }

            const timestamp = new Date().getTime();
            const fileName = `timer-${viewType}-${timestamp}.png`;

            switch (action) {
                case 'save-files':
                    const directoryUri = await getOrRequestDirectory();

                    const base64 = await FileSystem.readAsStringAsync(uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });

                    const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
                        directoryUri,
                        fileName,
                        'image/png'
                    );

                    await FileSystem.writeAsStringAsync(fileUri, base64, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    break;

                case 'save-gallery':
                    const { status } = await MediaLibrary.requestPermissionsAsync();
                    if (status !== 'granted') {
                        throw new Error('Permission not granted');
                    }

                    const tempFileUri = FileSystem.cacheDirectory + fileName;
                    await FileSystem.copyAsync({ from: uri, to: tempFileUri });
                    await MediaLibrary.createAssetAsync(tempFileUri);
                    await FileSystem.deleteAsync(tempFileUri);
                    break;

                case 'share':
                    if (!(await Sharing.isAvailableAsync())) {
                        throw new Error('Sharing not available');
                    }
                    await Sharing.shareAsync(uri);
                    break;

                default:
                    throw new Error('Unknown action');
            }
        } catch (error) {
            console.error(`Export error (${action}):`, error);
        } finally {
            setIsExporting(false);
            setCurrentAction(null);
            closeSheet();
        }
    };

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: colors.background + 'dd',
            justifyContent: 'flex-end',
        },
        bottomSheet: {
            backgroundColor: colors.card,
            borderTopLeftRadius: variables.radius.lg + 4,
            borderTopRightRadius: variables.radius.lg + 4,
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 44,
            minHeight: 480,
            maxHeight: screenHeight * 0.85,
            borderWidth: isBorder ? 0.75 : 0,
            borderColor: colors.border,
            
        },
        handle: {
            width: 36,
            height: 4,
            backgroundColor: colors.border + '80',
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: 28,
        },
        headerContainer: {
            alignItems: 'center',
            marginBottom: 32,
        },
        title: {
            fontSize: 22,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 6,
            letterSpacing: -0.3,
        },
        subtitle: {
            fontSize: 15,
            color: colors.textDesc,
            textAlign: 'center',
            lineHeight: 20,
            opacity: 0.8,
        },
        optionCard: {
            backgroundColor: colors.settingBlock,
            borderRadius: variables.radius.md + 2,
            padding: 20,
            marginBottom: 20,
            borderWidth: isBorder ? 0.75 : 0,
            borderColor: colors.border,
           
        },
        optionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
        },
        optionIcon: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.highlight + '15',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        optionTitleContainer: {
            flex: 1,
        },
        optionTitle: {
            fontSize: 17,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 2,
            letterSpacing: -0.2,
        },
        optionDescription: {
            fontSize: 14,
            color: colors.textDesc,
            lineHeight: 18,
            opacity: 0.8,
            marginBottom: 18,
        },
        actionRow: {
            flexDirection: 'row',
            gap: 12,
            marginBottom: 12,
        },
        actionButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: variables.radius.sm + 2,
            borderWidth: isBorder ? 0.75 : 0,
            backgroundColor: colors.highlight + '08',
            borderColor: colors.border,
            minHeight: 48,
        },
        galleryButton: {
            marginBottom:22
        },
        actionButtonPressed: {
            backgroundColor: colors.highlight + '20',
            transform: [{ scale: 0.98 }],
        },
        actionButtonText: {
            fontSize: 14,
            fontWeight: '600',
            marginLeft: 8,
            letterSpacing: -0.1,
        },
        filesButtonText: {
            color: colors.highlight,
        },
        galleryButtonText: {
            color: colors.highlight,
        },
        shareButtonText: {
            color: colors.text,
        },
        cancelButton: {
            backgroundColor: colors.cardLighter,
            borderColor: colors.border,
            borderWidth: isBorder ? 0.75 : 0,
            borderRadius: variables.radius.sm + 2,
            paddingVertical: 16,
            alignItems: 'center',
            marginTop: 12,
        },
        cancelButtonText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '600',
            letterSpacing: -0.1,
        },
        loadingContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background + 'dd',
            borderRadius: variables.radius.lg + 4,
            zIndex: 10,
        },
        loadingContent: {
            alignItems: 'center',
            backgroundColor: colors.card,
            paddingHorizontal: 24,
            paddingVertical: 20,
            borderRadius: variables.radius.md,
            
        },
        loadingText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '500',
            marginTop: 12,
            letterSpacing: -0.1,
        },
    });

    const renderButtonContent = (action, iconName, text) => {
        const isActive = currentAction === action && isExporting;
        return (
            <>
                {isActive ? (
                    <ActivityIndicator size="small" color={colors.highlight} />
                ) : (
                    <>
                        <Icons.Ion name={iconName} size={18} color={
                            action === 'share' ? colors.text : colors.highlight
                        } />
                        <Text style={[
                            styles.actionButtonText,
                            action === 'save-files' && styles.filesButtonText,
                            action === 'save-gallery' && styles.galleryButtonText,
                            action === 'share' && styles.shareButtonText
                        ]}>
                            {text}
                        </Text>
                    </>
                )}
            </>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={closeSheet}
        >
            <TouchableWithoutFeedback onPress={closeSheet}>
                <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <Animated.View
                            style={[
                                styles.bottomSheet,
                                {
                                    transform: [{ translateY: slideAnim }],
                                },
                            ]}
                        >
                            {isExporting && (
                                <View style={styles.loadingContainer}>
                                    <View style={styles.loadingContent}>
                                        <ActivityIndicator size="large" color={colors.highlight} />
                                        <Text style={styles.loadingText}>Exporting...</Text>
                                    </View>
                                </View>
                            )}

                            <View style={styles.handle} />

                            <View style={styles.headerContainer}>
                                <Text style={styles.title}>Export Timer</Text>
                                <Text style={styles.subtitle}>Choose what to export and how to save it</Text>
                            </View>

                            {/* Card View Option */}
                            <View style={styles.optionCard}>
                                <View style={styles.optionHeader}>
                                    <View style={styles.optionIcon}>
                                        <Icons.Ion name="card-outline" size={16} color={colors.highlight} />
                                    </View>
                                    <View style={styles.optionTitleContainer}>
                                        <Text style={styles.optionTitle}>Card View</Text>
                                    </View>
                                </View>
                                <Text style={styles.optionDescription}>
                                    Export the compact timer card view with essential information
                                </Text>
                                <View style={styles.actionRow}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleExportAction(cardRef, 'card', 'save-files')}
                                        disabled={isExporting}
                                        activeOpacity={0.7}
                                    >
                                        {renderButtonContent('save-files', 'folder-outline', 'Files')}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleExportAction(cardRef, 'card', 'share')}
                                        disabled={isExporting}
                                        activeOpacity={0.7}
                                    >
                                        {renderButtonContent('share', 'share-outline', 'Share')}
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.galleryButton]}
                                    onPress={() => handleExportAction(cardRef, 'card', 'save-gallery')}
                                    disabled={isExporting}
                                    activeOpacity={0.7}
                                >
                                    {renderButtonContent('save-gallery', 'image-outline', 'Save to Gallery')}
                                </TouchableOpacity>
                            </View>

                            {/* Detail View Option */}
                            <View style={styles.optionCard}>
                                <View style={styles.optionHeader}>
                                    <View style={styles.optionIcon}>
                                        <Icons.Ion name="list-outline" size={16} color={colors.highlight} />
                                    </View>
                                    <View style={styles.optionTitleContainer}>
                                        <Text style={styles.optionTitle}>Detail View</Text>
                                    </View>
                                </View>
                                <Text style={styles.optionDescription}>
                                    Export the detailed timer information with comprehensive data
                                </Text>
                                <View style={styles.actionRow}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleExportAction(sheetRef, 'detail', 'save-files')}
                                        disabled={isExporting}
                                        activeOpacity={0.7}
                                    >
                                        {renderButtonContent('save-files', 'folder-outline', 'Files')}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleExportAction(sheetRef, 'detail', 'share')}
                                        disabled={isExporting}
                                        activeOpacity={0.7}
                                    >
                                        {renderButtonContent('share', 'share-outline', 'Share')}
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.galleryButton]}
                                    onPress={() => handleExportAction(sheetRef, 'detail', 'save-gallery')}
                                    disabled={isExporting}
                                    activeOpacity={0.7}
                                >
                                    {renderButtonContent('save-gallery', 'image-outline', 'Save to Gallery')}
                                </TouchableOpacity>
                            </View>

                            {/* Cancel Button */}
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={closeSheet}
                                disabled={isExporting}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default ExportBottomSheet;