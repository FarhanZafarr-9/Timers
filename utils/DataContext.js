import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Image } from 'react-native';

// Storage keys
const USER_DATA_KEY = 'userData';

// Initial data structure
const initialUserData = {
    name: 'Farhan Zafar',
    profession: 'Data Scientist',
    hobbies: ['Coding', 'Reading', 'Gaming'],
    profilePic: null, // This will store the URI of the profile picture
};

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
    const [userData, setUserData] = useState(initialUserData);
    const [isLoading, setIsLoading] = useState(true);

    // Load data from AsyncStorage on initial render
    useEffect(() => {
        const loadData = async () => {
            try {
                const storedData = await AsyncStorage.getItem(USER_DATA_KEY);
                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    setUserData({
                        ...initialUserData,
                        ...parsedData,
                        // Ensure hobbies is an array even if corrupted data was stored
                        hobbies: Array.isArray(parsedData.hobbies) ? parsedData.hobbies : [],
                        // Ensure profilePic is either a string or null
                        profilePic: parsedData.profilePic || null,
                    });
                }
                setIsLoading(false);
            } catch (e) {
                console.warn('Failed to load user data from storage:', e);
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Save data to AsyncStorage whenever it changes
    useEffect(() => {
        if (!isLoading) {
            const saveData = async () => {
                try {
                    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
                } catch (e) {
                    console.warn('Failed to save user data to storage:', e);
                }
            };
            saveData();
        }
    }, [userData, isLoading]);

    // Update entire data object
    const updateUserData = useCallback((newData) => {
        setUserData(prev => ({
            ...prev,
            ...newData,
            // Ensure hobbies remains an array
            hobbies: Array.isArray(newData.hobbies) ? newData.hobbies : prev.hobbies,
            // Ensure profilePic is either a string or null
            profilePic: newData.profilePic || prev.profilePic,
        }));
    }, []);

    // Update specific fields
    const setName = useCallback((name) => {
        setUserData(prev => ({ ...prev, name }));
    }, []);

    const setProfession = useCallback((profession) => {
        setUserData(prev => ({ ...prev, profession }));
    }, []);

    // Profile picture functions
    const pickProfilePicture = useCallback(async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'We need access to your photos to set a profile picture.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'Images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets?.length > 0) {
                const selectedImage = result.assets[0];
                setUserData(prev => ({
                    ...prev,
                    profilePic: selectedImage.uri,
                }));
                return selectedImage.uri; // Return the URI for immediate use
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to select an image. Please try again.');
            throw error;
        }
    }, []);

    const removeProfilePicture = useCallback(() => {
        setUserData(prev => ({
            ...prev,
            profilePic: null,
        }));
    }, []);

    // Hobby helper functions
    const addHobby = useCallback((hobby) => {
        if (!hobby) return;
        setUserData(prev => ({
            ...prev,
            hobbies: [...prev.hobbies, hobby],
        }));
    }, []);

    const removeHobby = useCallback((hobbyToRemove) => {
        setUserData(prev => ({
            ...prev,
            hobbies: prev.hobbies.filter(hobby => hobby !== hobbyToRemove),
        }));
    }, []);

    const updateHobby = useCallback((oldHobby, newHobby) => {
        if (!newHobby) return;
        setUserData(prev => ({
            ...prev,
            hobbies: prev.hobbies.map(hobby =>
                hobby === oldHobby ? newHobby : hobby,
            ),
        }));
    }, []);

    const clearHobbies = useCallback(() => {
        setUserData(prev => ({ ...prev, hobbies: [] }));
    }, []);

    const hasHobby = useCallback((hobby) => {
        return userData.hobbies.includes(hobby);
    }, [userData.hobbies]);

    const contextValue = {
        userData,
        isLoading,
        updateUserData,
        setName,
        setProfession,
        // Profile picture functions
        pickProfilePicture,
        removeProfilePicture,
        // Hobby helpers
        addHobby,
        removeHobby,
        updateHobby,
        clearHobbies,
        hasHobby,
        hobbies: userData.hobbies,
    };

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};