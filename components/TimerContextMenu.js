// 🌐 React & React Native
import {
    useEffect,
    useRef,
    useCallback,
    memo
} from 'react';
import {
    View,
    Text,
    Modal,
    Animated,
    TouchableOpacity,
    TouchableWithoutFeedback,
    StyleSheet,
    Dimensions
} from 'react-native';
import { Icons } from '../assets/icons';
import { useTheme } from '../utils/ThemeContext';

const { height: screenHeight } = Dimensions.get('window');

const TimerContextMenu = ({
    visible,
    onClose,
    onEdit,
    onDelete,
    onDuplicate,
    onFavourite,
    onShare,
    timer,
}) => {
    const slideAnim = useRef(new Animated.Value(screenHeight)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const { border, colors, } = useTheme();


    /* ---------- Animations ---------- */
    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 280,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, slideAnim, fadeAnim]);

    /* ---------- Handlers ---------- */
    const handleAction = useCallback((action) => {
        onClose(); // always close the menu first
        action();
    }, [onClose]);
    /* ---------- Styles ---------- */
    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            justifyContent: 'flex-end',
        },
        sheet: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 30,
            paddingTop: 12,
            paddingBottom: 40,
            minHeight: 200,
            maxHeight: screenHeight * 0.5,
            borderWidth: border,
        },
        handle: {
            width: 40,
            height: 4,
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: 36,
        },
        actions: {
            gap: 10,
        },
        btn: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 10,
            borderWidth: border * 0.75,
            justifyContent: 'space-between',
            backgroundColor: colors.highlight + '08'
        },
        btnText: {
            fontSize: 16,
            fontWeight: '600',
        },
    });
    /* ---------- Render ---------- */
    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View
                    style={[
                        styles.overlay,
                        { opacity: fadeAnim, backgroundColor: colors.background + '90' }
                    ]}
                >
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.sheet,
                                {
                                    transform: [{ translateY: slideAnim }],
                                    backgroundColor: colors.modalBg,
                                    borderColor: colors.border,
                                },
                            ]}
                        >

                            <View style={[styles.handle, { backgroundColor: colors.border }]} />

                            {/* Buttons */}
                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={[styles.btn, { borderColor: colors.border }]}
                                    onPress={() => handleAction(onEdit)}
                                >

                                    <Text style={[styles.btnText, { color: colors.text }]}>
                                        Edit
                                    </Text>
                                    <Icons.Material name="edit" size={22} color={colors.highlight} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.btn, { borderColor: colors.border }]}
                                    onPress={() => handleAction(onDuplicate)}
                                >

                                    <Text style={[styles.btnText, { color: colors.text }]}>
                                        Duplicate
                                    </Text>
                                    <Icons.Material
                                        name="control-point-duplicate"
                                        size={22}
                                        color={colors.highlight}
                                    />

                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.btn, { borderColor: colors.border }]}
                                    onPress={() => handleAction(onFavourite)}
                                >

                                    <Text style={[styles.btnText, { color: colors.text }]}>
                                        {timer.isFavourite ? 'Un-Favourite' : 'Favourite'}
                                    </Text>
                                    <Icons.Material
                                        name={timer.isFavourite ? 'favorite' : 'favorite-border'}
                                        size={22}
                                        color={colors.highlight}
                                    />

                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.btn, { borderColor: colors.border }]}
                                    onPress={() => handleAction(onShare)}
                                >
                                    <Text style={[styles.btnText, { color: colors.text }]}>
                                        Share
                                    </Text>
                                    <Icons.Material name="share" size={22} color={colors.highlight} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.btn, { borderColor: colors.border }]}
                                    onPress={() => handleAction(onDelete)}
                                >

                                    <Text style={[styles.btnText, { color: '#ef4444' }]}>
                                        Delete
                                    </Text>
                                    <Icons.Material name="delete" size={22} color="#ef4444" />

                                </TouchableOpacity>
                            </View>

                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default memo(TimerContextMenu);

