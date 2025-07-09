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

            const timestamp = new Date().getTime(); // Use simple timestamp
            const fileName = `timer-${viewType}-${timestamp}.png`;

            switch (action) {
                case 'save-files':
                    const directoryUri = await getOrRequestDirectory();


                    // Read the captured image as base64
                    const base64 = await FileSystem.readAsStringAsync(uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });

                    // Create and write the file directly
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

                    // Save the captured image to a temporary file with the custom name
                    const tempFileUri = FileSystem.cacheDirectory + fileName;
                    await FileSystem.copyAsync({ from: uri, to: tempFileUri });

                    // Add the temporary file to the media library
                    await MediaLibrary.createAssetAsync(tempFileUri);

                    // Optionally, delete the temporary file after adding it to the media library
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
            // Errors are silently handled - you could add visual feedback here if needed
        } finally {
            setIsExporting(false);
            setCurrentAction(null);
            closeSheet();
        }
    };

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: colors.background + 'cc',
            justifyContent: 'flex-end',
        },
        bottomSheet: {
            backgroundColor: colors.card,
            borderTopLeftRadius: variables.radius.lg,
            borderTopRightRadius: variables.radius.lg,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 40,
            minHeight: 450,
            maxHeight: screenHeight * 0.8,
        },
        handle: {
            width: 40,
            height: 4,
            backgroundColor: colors.border,
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: 20,
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 8,
            textAlign: 'center',
            height: 30
        },
        subtitle: {
            fontSize: 14,
            color: colors.textDesc,
            marginBottom: 24,
            textAlign: 'center',
            height: 20
        },
        optionCard: {
            backgroundColor: colors.cardLighter,
            borderRadius: variables.radius.md,
            padding: 16,
            marginBottom: 16,
            borderWidth: 0.75,
            borderColor: colors.border,
        },
        optionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
        },
        optionDescription: {
            fontSize: 13,
            color: colors.textDesc,
            marginBottom: 12,
            height: 20
        },
        actionRow: {
            flexDirection: 'row',
            gap: 8,
            marginBottom: 8,
        },
        actionButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
            borderRadius: variables.radius.sm,
            borderWidth: 0.75,
            backgroundColor: colors.highlight + '10',
            borderColor: colors.border,
            minHeight: 40,
        },
        galleryButton: {
            marginBottom: 16,
        },
        actionButtonText: {
            fontSize: 14,
            fontWeight: '600',
            marginLeft: 6,
            height: 20
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
            borderWidth: 0.75,
            borderRadius: variables.radius.sm,
            paddingVertical: 12,
            alignItems: 'center',
            marginTop: 8,
        },
        cancelButtonText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '600',
        },
        loadingContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background + 'aa',
            borderRadius: variables.radius.lg,
        },
    });

    const renderButtonContent = (action, iconName, text) => {
        const isActive = currentAction === action && isExporting;
        return (
            <>
                {isActive ? (
                    <ActivityIndicator size="small" color={colors.text} />
                ) : (
                    <>
                        <Icons.Ion name={iconName} size={16} color={
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
                                    <ActivityIndicator size="large" color={colors.highlight} />
                                </View>
                            )}

                            <View style={styles.handle} />
                            <Text style={styles.title}>Export Timer</Text>
                            <Text style={styles.subtitle}>Choose what to export and how to save it</Text>

                            {/* Card View Option */}
                            <View style={styles.optionCard}>
                                <Text style={styles.optionTitle}>Card View</Text>
                                <Text style={styles.optionDescription}>
                                    Export the compact timer card view
                                </Text>
                                <View style={styles.actionRow}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleExportAction(cardRef, 'card', 'save-files')}
                                        disabled={isExporting}
                                        activeOpacity={0.7}
                                    >
                                        {renderButtonContent('save-files', 'folder-outline', 'Save to Files')}
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
                                <Text style={styles.optionTitle}>Detail View</Text>
                                <Text style={styles.optionDescription}>
                                    Export the detailed timer information
                                </Text>
                                <View style={styles.actionRow}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleExportAction(sheetRef, 'detail', 'save-files')}
                                        disabled={isExporting}
                                        activeOpacity={0.7}
                                    >
                                        {renderButtonContent('save-files', 'folder-outline', 'Save to Files')}
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