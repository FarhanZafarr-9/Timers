import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    Modal,
    Animated,
    Dimensions,
    Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useData } from '../utils/DataContext';
import { useTheme } from '../utils/ThemeContext';

const { height: screenHeight } = Dimensions.get('window');

const BottomProfileSheet = ({ visible, onClose, colors, variables }) => {
    const {
        userData,
        setName,
        setProfession,
        pickProfilePicture,
        removeProfilePicture,
        updateUserData
    } = useData();

    const [localName, setLocalName] = useState(userData.name || '');
    const [localProfession, setLocalProfession] = useState(userData.profession || '');
    const [localProfilePic, setLocalProfilePic] = useState(userData.profilePic || null);
    const [errorMsg, setErrorMsg] = useState('');
    const { isBorder, headerMode, border } = useTheme();
    const translateY = useRef(new Animated.Value(screenHeight)).current;
    const opacity = useRef(new Animated.Value(0)).current;


    useEffect(() => {
        if (visible) {
            showBottomSheet();
            // Reset local state when modal opens
            setLocalName(userData.name || '');
            setLocalProfession(userData.profession || '');
            setLocalProfilePic(userData.profilePic || null);
        } else {
            hideBottomSheet();
        }
    }, [visible, userData]);

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
        ]).start();
    };

    const handleRemoveImage = () => {
        setLocalProfilePic(null);
    };



    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('We need access to your photos to set a profile picture.');
                return;
            }
            console.log("ImagePicker.MediaType:", ImagePicker.MediaType);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'Images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets?.length > 0) {
                setLocalProfilePic(result.assets[0].uri);
                setErrorMsg('');
            }
        } catch (error) {
            console.error('Error picking image:', error);
            setErrorMsg('Failed to select an image. Please try again.');
        }
    };

    const handleSave = () => {
        try {
            setName(localName);
            setProfession(localProfession);

            if (localProfilePic !== userData.profilePic) {
                if (localProfilePic) {
                    updateUserData({ profilePic: localProfilePic });
                } else {
                    removeProfilePicture();
                }
            }

            onClose();
        } catch (error) {
            console.error('Error saving profile:', error);
            setErrorMsg('Failed to save profile. Please try again.');
        }
    };


    // Clear error when user types
    const handleNameChange = (text) => {
        setLocalName(text);
        setErrorMsg('');
    };
    const handleProfessionChange = (text) => {
        setLocalProfession(text);
        setErrorMsg('');
    };


    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: (headerMode === 'fixed' ? colors.settingBlock : colors.background) + '90', // for modals
            justifyContent: 'flex-end',
        },
        bottomSheet: {
            backgroundColor: colors.settingBlock,
            borderTopLeftRadius: variables.radius.lg || 20,
            borderTopRightRadius: variables.radius.lg || 20,
            paddingBottom: Platform.OS === 'ios' ? 30 : 20,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: -2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10,
            borderWidth: border,
            borderColor: colors.border,
        },
        handle: {
            width: 40,
            height: 4,
            backgroundColor: colors.border,
            borderRadius: 2,
            alignSelf: 'center',
            marginTop: 12,
            marginBottom: 20,
        },
        content: {
            paddingHorizontal: 20,
            paddingBottom: 10,
        },
        title: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
            textAlign: 'center',
            marginBottom: 24,
            borderBottomColor: colors.border,
            borderBottomWidth: border,
            paddingBottom: 18,
        },
        avatarContainer: {
            alignSelf: 'center',
            marginBottom: 24,
            position: 'relative',
        },
        avatar: {
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: colors.card,
        },
        removeButton: {
            position: 'absolute',
            top: -2,
            right: -2,
            backgroundColor: colors.cancelButtonBorder + 'a5',
            width: 28,
            height: 28,
            borderRadius: 14,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: colors.settingBlock,
        },
        placeholder: {
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: colors.card,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: isBorder ? 0 : 1,
            borderColor: colors.border,
        },
        placeholderText: {
            fontSize: 36,
            color: colors.text + '80',
        },
        input: {
            backgroundColor: colors.cardLighter,
            borderRadius: variables.radius.md || 12,
            padding: 14,
            marginBottom: 16,
            fontSize: 16,
            color: colors.text,
            borderWidth: border,
            borderColor: colors.border,
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: 8,
            gap: '4%',
            borderTopWidth: border,
            paddingTop: 18,
            borderColor: colors.border
        },
        cancelButton: {
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: variables.radius.sm || 12,
            backgroundColor: colors.card,
            borderWidth: border,
            borderColor: colors.border,
            width: '48%',
            justifyContent: 'center',
            alignItems: 'center'
        },
        saveButton: {
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: variables.radius.sm || 12,
            backgroundColor: colors.highlight,
            borderWidth: border,
            borderColor: colors.border,
            width: '48%',
            justifyContent: 'center',
            alignItems: 'center'
        },
        cancelText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '500',
        },
        saveText: {
            color: colors.background,
            fontSize: 16,
            fontWeight: '500',
        },
    });

    if (!visible) return null;

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
                    style={[
                        styles.bottomSheet,
                        {
                            transform: [{ translateY }],
                        }
                    ]}
                >
                    <View style={styles.handle} />
                    <View style={styles.content}>
                        <Text style={styles.title}>Edit Profile</Text>

                        <View style={styles.avatarContainer}>
                            <TouchableOpacity onPress={handlePickImage}>
                                {localProfilePic ? (
                                    <Image
                                        source={{ uri: localProfilePic }}
                                        style={styles.avatar}
                                    />
                                ) : (
                                    <View style={styles.placeholder}>
                                        <Text style={styles.placeholderText}>+</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                            {localProfilePic && (
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={handleRemoveImage}
                                >
                                    <Text style={{ color: '#fff', fontSize: 16 }}>×</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Name"
                            placeholderTextColor={colors.text + '80'}
                            value={localName}
                            onChangeText={handleNameChange}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Profession"
                            placeholderTextColor={colors.text + '80'}
                            value={localProfession}
                            onChangeText={handleProfessionChange}
                        />

                        {errorMsg ? (
                            <Text style={{ color: colors.danger, marginBottom: 8, textAlign: 'center' }}>
                                {errorMsg}
                            </Text>
                        ) : null}


                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onClose}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSave}
                            >
                                <Text style={styles.saveText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

export default BottomProfileSheet;