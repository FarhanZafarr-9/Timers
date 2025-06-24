import React from 'react';
import { Text } from 'react-native';

const jumbleText = (str) => {
    // Replace each character with a random letter (except spaces)
    return str.split('').map(char =>
        char === ' ' ? ' ' : String.fromCharCode(97 + Math.floor(Math.random() * 26))
    ).join('');
};

const maskText = (str) => {
    // Replace each character with an asterisk (except spaces)
    return str.split('').map(char => (char === ' ' ? ' ' : '*')).join('');
};

const HighlightMatchText = ({ text, textStyle, search, privacyMode, colors }) => {
    if (privacyMode !== 'off') {
        return <Text style={textStyle}>{privacyMode === 'jumble' ? jumbleText(text) : maskText(text)}</Text>;
    }

    if (!search) return <Text style={textStyle}>{text}</Text>;

    const regex = new RegExp(`(${search})`, 'gi');
    const parts = text.split(regex);

    const highlightStyle = {
        backgroundColor: colors?.highlight || '#fff59d',
        fontWeight: 'bold',
        color: colors?.highlightText || '#222',
        borderRadius: 4,
        paddingHorizontal: 2,
    };

    return (
        <Text style={textStyle}>
            {parts.map((part, idx) =>
                part.toLowerCase() === search.toLowerCase() ? (
                    <Text
                        key={idx}
                        style={[textStyle, highlightStyle]}
                    >
                        {part}
                    </Text>
                ) : (
                    <Text key={idx} style={textStyle}>
                        {part}
                    </Text>
                )
            )}
        </Text>
    );
};

export default HighlightMatchText;