import CryptoJS from 'crypto-js';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENCRYPTION_KEY_STORAGE } from '../storage/storageUtils';

const generateSecureKey = async () => {
    const bytes = await Crypto.getRandomBytesAsync(32);
    const wordArray = CryptoJS.lib.WordArray.create(bytes);
    return wordArray.toString(CryptoJS.enc.Hex);
};

const generateSecureIV = async () => {
    const bytes = await Crypto.getRandomBytesAsync(16);
    return CryptoJS.lib.WordArray.create(bytes);
};

export const getOrCreateEncryptionKey = async () => {
    let key = await AsyncStorage.getItem(ENCRYPTION_KEY_STORAGE);
    if (!key) {
        key = await generateSecureKey();
        await AsyncStorage.setItem(ENCRYPTION_KEY_STORAGE, key);
    }
    return key;
};

export const encryptData = async (data) => {
    const keyHex = await getOrCreateEncryptionKey();
    const keyWA = CryptoJS.enc.Hex.parse(keyHex);
    const iv = await generateSecureIV();
    const json = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(json, keyWA, { iv });
    return JSON.stringify({ iv: iv.toString(CryptoJS.enc.Hex), data: encrypted.toString() });
};

export const decryptData = async (encryptedStr) => {
    const keyHex = await getOrCreateEncryptionKey();
    const keyWA = CryptoJS.enc.Hex.parse(keyHex);
    const { iv, data } = JSON.parse(encryptedStr);
    const decrypted = CryptoJS.AES.decrypt(data, keyWA, { iv: CryptoJS.enc.Hex.parse(iv) });
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
};
