import {
    View,
    StyleSheet,
    SafeAreaView,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';

const ScreenWrapper = ({ children, colors, onScroll, onContentSizeChange }) => {
    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: colors.background,
        },
        wrapper: {
            backgroundColor: colors.background,
            paddingHorizontal: 15,
            paddingBottom: 65,
        },
        scrollContent: {
            flexGrow: 1,
        },
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                        onContentSizeChange={onContentSizeChange}
                        bounces={true}
                        alwaysBounceVertical={false}
                    >
                        <View style={styles.wrapper}>
                            {children}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};

export default ScreenWrapper;