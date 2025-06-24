// FloatingLabelInput component for reuse
import { useEffect, useRef } from 'react';
import { TextInput, View, Animated } from 'react-native';

const FloatingLabelInput = ({
    label,
    value,
    onChangeText,
    onFocus,
    onBlur,
    keyboardType = 'default',
    style,
    maxLength,
    colors,
    focus,
    setFocus,
    focusKey,
    placeholder,
    ...rest
}) => {
    const anim = useRef(new Animated.Value((focus[focusKey] || value) ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: (focus[focusKey] || value) ? 1 : 0,
            duration: 180,
            useNativeDriver: false,
        }).start();
    }, [focus[focusKey], value]);

    const labelTop = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [14, 2], // from center to top inside input
    });
    const labelRight = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [12, 4], // stays at 12px from right
    });

    const labelStyle = {
        position: 'absolute',
        right: focus[focusKey] || value ? labelRight : undefined,
        left: focus[focusKey] || value ? undefined : 12,
        top: labelTop,
        fontSize: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [14, 12],
        }),
        color: colors.textDesc,
        backgroundColor: 'transparent',
        paddingHorizontal: 2,
        zIndex: 1,
        fontWeight: 'bold',
        textAlign: 'right',
    };

    return (
        <View style={{ width: '100%', marginBottom: 12, justifyContent: 'flex-end' }}>
            <Animated.Text style={labelStyle}>{label}</Animated.Text>
            <TextInput
                style={[
                    style,
                    {
                        borderColor: focus[focusKey] ? colors.text : 'transparent',
                        fontWeight: '600',
                        paddingTop: 18,
                    },
                ]}
                value={value}
                onChangeText={onChangeText}
                onFocus={() => setFocus(f => ({ ...f, [focusKey]: true }))}
                onBlur={() => setFocus(f => ({ ...f, [focusKey]: false }))}
                keyboardType={keyboardType}
                maxLength={maxLength}
                placeholder={''}
                {...rest}
            />
        </View>
    );
};

export default FloatingLabelInput;