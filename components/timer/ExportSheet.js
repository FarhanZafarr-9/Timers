import { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import { Icons } from '../../assets/icons';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';
import BottomSheet from '../sheets/BottomSheet';

const DIRECTORY_KEY = 'download_directory_uri';

export default function ExportSheet({
    visible,
    onClose,
    cardRef,
    sheetRef,
}) {
    const { border, colors, variables } = useTheme();
    const [isExporting, setIsExporting] = useState(false);
    const [currentAction, setCurrentAction] = useState(null);
    const [viewType, setViewType] = useState('card');

    const getOrRequestDirectory = async () => {
        let uri = await AsyncStorage.getItem(DIRECTORY_KEY);
        if (uri) return uri;

        const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permission.granted) throw new Error('Permission not granted');

        uri = permission.directoryUri;
        await AsyncStorage.setItem(DIRECTORY_KEY, uri);
        return uri;
    };

    const handleExportAction = async (action) => {
        if (isExporting) return;
        const ref = viewType === 'card' ? cardRef : sheetRef;

        setIsExporting(true);
        setCurrentAction(action);

        try {
            if (!ref?.current) throw new Error('View reference not available');

            const uri = await ref.current.capture();
            if (!uri) throw new Error('Failed to capture view');

            const timestamp = new Date().getTime();
            const fileName = `timer-${viewType}-${timestamp}.png`;

            switch (action) {
                case 'save-files': {
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
                }
                case 'save-gallery': {
                    const { status } = await MediaLibrary.requestPermissionsAsync();
                    if (status !== 'granted') throw new Error('Permission not granted');

                    const tempFileUri = FileSystem.cacheDirectory + fileName;
                    await FileSystem.copyAsync({ from: uri, to: tempFileUri });
                    await MediaLibrary.createAssetAsync(tempFileUri);
                    await FileSystem.deleteAsync(tempFileUri);
                    break;
                }
                case 'share': {
                    if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing not available');
                    await Sharing.shareAsync(uri);
                    break;
                }
                default:
                    throw new Error('Unknown action');
            }
        } catch (error) {
            console.error(`Export error (${action}):`, error);
        } finally {
            setIsExporting(false);
            setCurrentAction(null);
            onClose();
        }
    };

    const styles = StyleSheet.create({
        container: {
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 30,
        },
        header: {
            alignItems: 'center',
            marginBottom: 20,
        },
        title: {
            fontSize: 20,
            fontWeight: '700',
            color: colors.text,
        },
        subtitle: {
            fontSize: 14,
            color: colors.textDesc,
            marginTop: 4,
            textAlign: 'center',
            height: 18
        },
        toggleRow: {
            flexDirection: 'row',
            borderWidth: border,
            borderColor: colors.border,
            borderRadius: variables.radius.sm,
            overflow: 'hidden',
            marginBottom: 20,
        },
        toggleBtn: {
            flex: 1,
            paddingVertical: 10,
            alignItems: 'center',
        },
        toggleActive: {
            backgroundColor: colors.highlight + '12',
        },
        toggleText: {
            fontSize: 15,
            fontWeight: '600',
            color: colors.text,
        },
        actionsRow: {
            flexDirection: 'row',
            gap: 12,
            marginBottom: 12,
        },
        actionBtn: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
            borderRadius: variables.radius.sm,
            borderWidth: border,
            borderColor: colors.border,
            backgroundColor: colors.settingBlock,
        },
        actionText: {
            marginLeft: 8,
            fontSize: 14,
            fontWeight: '600',
            color: colors.highlight,
        },
        galleryBtnWrapper: {
            flexDirection: 'row',
            marginBottom: 12,
        },
        cancelBtn: {
            backgroundColor: colors.cardLighter,
            borderColor: colors.border,
            borderWidth: border,
            borderRadius: variables.radius.sm,
            paddingVertical: 14,
            alignItems: 'center',
            marginTop: 10,
        },
        cancelText: {
            color: colors.text,
            fontSize: 15,
            fontWeight: '600',
        },
        loadingOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: colors.background + 'cc',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: variables.radius.lg,
            zIndex: 10,
        },
    });

    const renderAction = (action, icon, label) => {
        const active = currentAction === action && isExporting;
        return (
            <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleExportAction(action)}
                disabled={isExporting}
                activeOpacity={0.7}
            >
                {active ? (
                    <ActivityIndicator size="small" color={colors.highlight} />
                ) : (
                    <>
                        <Icons.Ion name={icon} size={18} color={colors.highlight} />
                        <Text style={styles.actionText}>{label}</Text>
                    </>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            snapPoints={[0.4]}
            initialSnapIndex={0}
            backdropOpacity={1}
            enableBackdropDismiss
            enablePanDownToClose
            closeThreshold={80}
        >

            {isExporting && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={colors.highlight} />
                    <Text style={{ color: colors.text, marginTop: 12 }}>Exporting...</Text>
                </View>
            )}

            <View style={styles.header}>
                <Text style={styles.title}>Export Timer</Text>
                <Text style={styles.subtitle}>Choose the view type and export method</Text>
            </View>

            <View style={styles.toggleRow}>
                <TouchableOpacity
                    style={[styles.toggleBtn, viewType === 'card' && styles.toggleActive]}
                    onPress={() => setViewType('card')}
                >
                    <Text style={styles.toggleText}>Card View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleBtn, viewType === 'detail' && styles.toggleActive]}
                    onPress={() => setViewType('detail')}
                >
                    <Text style={styles.toggleText}>Detail View</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.actionsRow}>
                {renderAction('save-files', 'folder-outline', 'Files')}
                {renderAction('share', 'share-outline', 'Share')}
            </View>

            <View style={styles.galleryBtnWrapper}>
                {renderAction('save-gallery', 'image-outline', 'Save to Gallery')}
            </View>

            <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                disabled={isExporting}
            >
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

        </BottomSheet>
    );
}
