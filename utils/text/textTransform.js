export const jumbleText = (str) => {
    return str.split('').map(char =>
        char === ' ' ? ' ' : String.fromCharCode(97 + Math.floor(Math.random() * 26))
    ).join('');
};

export const emojiText = (str) => {
    const emojiChars = ['😶', '😐', '😑', '🙄', '😬', '😮‍💨', '🙂', '🙃', '😊', '😇', '😉', '😌', '😴', '🥱', '😪', '😯', '😲', '😳', '🥺', '😕', '😟', '😢', '😭', '😞', '😔', '😓', '😥', '😶‍🌫️', '😵‍💫', '🫥', '🤫', '🤭', '🫢', '🫣', '😎', '🤓', '🧐', '🥸', '⭐', '✨', '🌟', '💫', '🌙', '🌚', '🌛', '🌜', '🌝', '🌌'];
    const emojiChar = emojiChars[Math.floor(Math.random() * emojiChars.length)];
    return str.split('').map(char => (char === ' ' ? ' ' : emojiChar)).join('');
};

export const maskText = (str) => {
    const maskChars = ['•', '·', '◦', '‣', '⁃', '∙', '▪', '▫', '◾', '◽', '■', '□', '◆', '◇', '▰', '▱', '▸', '◂', '▴', '▾', '❘', '❙', '❚', '│', '┃', '┆', '┊', '_', '‗', '‾', '=', '≡', '═'];
    const maskChar = maskChars[new Date().getMinutes() % maskChars.length];
    return [...String(str)].map(ch => (ch === ' ' ? ' ' : maskChar)).join('');
};

export const maxCharsLimit = 10;

export const getPrivacyText = (maxCharsLimit, privacyMode, inputText) => {
    const text = String(inputText ?? '');
    const isLong = text.length > maxCharsLimit;
    const truncated = isLong ? text.slice(0, maxCharsLimit) : text;

    let result;
    switch (privacyMode) {
        case 'jumble': result = jumbleText(truncated); break;
        case 'emoji': result = emojiText(truncated); break;
        case 'invisible': result = truncated; break;
        case 'ghost': result = null; break;
        case 'mask': result = maskText(truncated); break;
        default: result = truncated;
    }

    return isLong && privacyMode !== 'ghost' && result !== null ? result + '...' : result;
};
