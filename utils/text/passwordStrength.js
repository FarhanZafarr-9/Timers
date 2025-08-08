export const getStrength = (password, options = {}) => {
    // Default configuration (offline, NIST-inspired)
    const config = {
        minLength: options.minLength || 10, // Slightly stricter for security
        maxLength: options.maxLength || 64, // Prevent abuse
        requireSpecial: options.requireSpecial !== false,
        maxRepeatingChars: options.maxRepeatingChars || 3,
        minEntropyBits: options.minEntropyBits || 25, // Reasonable for offline
        commonPatterns: [
            /password/i, /1234/, /qwerty/i, /admin/i, /asdf/i
        ]
    };

    // Feedback messages (English, offline-friendly)
    const feedbackMessages = {
        invalid: 'Password cannot be empty.',
        tooShort: `Password must be at least ${config.minLength} characters long.`,
        tooLong: `Password must not exceed ${config.maxLength} characters.`,
        addSpecial: 'Add at least one special character (e.g., !@#$).',
        avoidRepeats: `Avoid repeating characters ${config.maxRepeatingChars} + times.`,
        avoidPatterns: 'Avoid common patterns (e.g., "password", "1234").',
        lowEntropy: 'Use a more random mix of characters.',
        strong: 'Great password!'
    };

    // Initial validation
    if (!password || typeof password !== 'string') {
        return {
            label: 'Invalid',
            color: 'gray',
            score: 0,
            entropy: 0,
            feedback: [feedbackMessages.invalid]
        };
    }

    if (password.length < config.minLength) {
        return {
            label: 'Too short',
            color: '#ef4444',
            score: 0,
            entropy: 0,
            feedback: [feedbackMessages.tooShort]
        };
    }

    if (password.length > config.maxLength) {
        return {
            label: 'Too long',
            color: '#ef4444',
            score: 0,
            entropy: 0,
            feedback: [feedbackMessages.tooLong]
        };
    }

    // Initialize variables
    let score = 0;
    const feedback = [];
    const charCount = password.length;

    // Character type checks (simplified)
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (config.requireSpecial && !/[^A-Za-z0-9]/.test(password)) {
        feedback.push(feedbackMessages.addSpecial);
    } else if (/[^A-Za-z0-9]/.test(password)) {
        score += 1;
    }

    // Length bonus
    if (charCount >= 12) score += 1;
    if (charCount >= 16) score += 1;

    // Check repeating characters
    const repeatingCharMatch = password.match(/(.)\1+/g);
    if (repeatingCharMatch && Math.max(...repeatingCharMatch.map(seq => seq.length)) >= config.maxRepeatingChars) {
        score -= 1;
        feedback.push(feedbackMessages.avoidRepeats);
    }

    // Check common patterns
    if (config.commonPatterns.some(pattern => pattern.test(password))) {
        score -= 1;
        feedback.push(feedbackMessages.avoidPatterns);
    }

    // Simplified entropy calculation (log2 of charset size * length)
    const charsetSize = (function () {
        let size = 0;
        if (/[a-z]/.test(password)) size += 26;
        if (/[A-Z]/.test(password)) size += 26;
        if (/[0-9]/.test(password)) size += 10;
        if (/[^A-Za-z0-9]/.test(password)) size += 32;
        return size;
    })();

    const entropy = charCount * (charsetSize > 0 ? Math.log2(charsetSize) : 0);

    if (entropy < config.minEntropyBits) {
        score -= 1;
        feedback.push(feedbackMessages.lowEntropy);
    } else if (entropy > config.minEntropyBits * 1.5) {
        score += 1;
    }

    // Normalize score (0-100 scale)
    const normalizedScore = Math.max(0, Math.min(Math.round(score * 15), 100));
    let label, color;

    if (normalizedScore <= 10) {
        label = 'Very Weak';
        color = '#ef4444';
    } else if (normalizedScore <= 20) {
        label = 'Weak';
        color = '#f87171';
    } else if (normalizedScore <= 30) {
        label = 'Below Average';
        color = '#faa81a';
    } else if (normalizedScore <= 40) {
        label = 'Average';
        color = '#eab308';
    } else if (normalizedScore <= 50) {
        label = 'Above Average';
        color = '#a3a300';
    } else if (normalizedScore <= 60) {
        label = 'Moderate';
        color = '#86efac';
    } else if (normalizedScore <= 70) {
        label = 'Strong';
        color = '#4ade80';
    } else if (normalizedScore <= 80) {
        label = 'Very Strong';
        color = '#22c55e';
    } else if (normalizedScore <= 90) {
        label = 'Excellent';
        color = '#16a34a';
    } else {
        label = 'Outstanding';
        color = '#104a2a';
    }
    
    // Enforce required special characters
    if (config.requireSpecial && !/[^A-Za-z0-9]/.test(password)) {
        label = 'Weak';
        color = '#ef4444';
    }

    return {
        label,
        color,
        score: normalizedScore,
        entropy: Math.round(entropy * 10) / 10,
        feedback: feedback.length ? feedback : [feedbackMessages.strong]
    };
};