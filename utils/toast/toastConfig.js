import { View, Text, Platform, ToastAndroid, Alert } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';

export const showToast = (msg) => {
    if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
        Alert.alert('Error', msg);
    }
};

export const toastConfig = (colors, variables, border) => ({
    success: (props) => (
        <BaseToast
            {...props}
            style={{
                backgroundColor: colors.modalBg,
                borderLeftWidth: 4,
                borderLeftColor: colors.highlight,
                borderWidth: border,
                borderColor: colors.border,
                borderRadius: variables.radius.lg,
                paddingVertical: 8,
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 6
            }}
            contentContainerStyle={{
                paddingHorizontal: 15
            }}
            text1Style={{
                color: colors.highlight,
                fontSize: 15,
                fontWeight: '700',
                height: 20
            }}
            text2Style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: '400',
                marginTop: 2,
                height: 20
            }}
        />
    ),
    error: (props) => (
        <ErrorToast
            {...props}
            style={{
                backgroundColor: colors.modalBg,
                borderLeftWidth: 4,
                borderLeftColor: '#ef4444',
                borderWidth: border,
                borderColor: colors.border,
                borderRadius: variables.radius.lg,
                paddingVertical: 8,
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 6
            }}
            contentContainerStyle={{
                paddingHorizontal: 15
            }}
            text1Style={{
                color: '#ef4444',
                fontSize: 15,
                fontWeight: '700'
            }}
            text2Style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: '400',
                marginTop: 2,
                height: 20
            }}
        />
    ),
    info: ({ text1, text2 }) => (
        <View style={{
            backgroundColor: colors.modalBg,
            borderLeftWidth: 4,
            borderLeftColor: colors.highlight,
            borderWidth: border,
            borderColor: colors.border,
            borderRadius: variables.radius.lg,
            paddingHorizontal: 15,
            paddingVertical: 10,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 6,
            width: '80%',
            alignSelf: 'center'
        }}>
            <Text style={{
                color: colors.highlight,
                fontSize: 15,
                fontWeight: '700',
                height: 20
            }}>
                {text1}
            </Text>
            {text2 ? (
                <Text style={{
                    color: colors.text,
                    fontSize: 14,
                    fontWeight: '400',
                    marginTop: 2,
                    height: 20
                }}>
                    {text2}
                </Text>
            ) : null}
        </View>
    )
});
