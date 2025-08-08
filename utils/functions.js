// utils/extras.js
// Temporary bridge for old imports — re-exports everything from new modular files

// Hooks
export { useRenderLogger } from './hooks/useRenderLogger';

// Updates
export { useCheckForUpdate, checkForUpdateAndReload } from './updates/updateUtils';

// Storage
export {
    getLastShownVersion,
    setLastShownVersion,
    getStoredItem,
    setStoredItem,
    ENCRYPTION_KEY_STORAGE
} from './storage/storageUtils';

// Constants
export { HEADER_MARGIN_TOP, MAX_HEADER_HEIGHT, MIN_HEADER_HEIGHT } from './constants/options';
export * from './constants/options';
export * from './constants/quotes';
export * from './constants/appInfo';

// Text utils
export {
    jumbleText,
    emojiText,
    maskText,
    getPrivacyText,
    maxCharsLimit
} from './text/textTransform';

// Toast
export { showToast, toastConfig } from './toast/toastConfig';

// Background renderers
export * from './backgrounds/backgroundRenderers';

// Encryption
export {
    encryptData,
    decryptData,
    getOrCreateEncryptionKey
} from './encryption/encryption';

// Timer / Time utilities
export * from './timer/timerUtils';
