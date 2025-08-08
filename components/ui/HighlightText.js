import { Text } from 'react-native';

const HighlightText = ({ text, textStyle, search, colors }) => {

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

export default HighlightText;