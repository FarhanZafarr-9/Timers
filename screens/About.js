import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Icons } from '../assets/icons';
import HeaderScreen from '../components/navigation/HeaderScreen';
import { appVersion, appBuild } from '../utils/functions';
import AboutModal from '../components/sheets/AboutModal';
import Toast from 'react-native-toast-message';

export default function About() {
    const { variables, colors, border } = useTheme();

    const animRefs = {
        top: useRef(new Animated.Value(-50)).current,
        desc: useRef(new Animated.Value(-50)).current,
        credits: useRef(new Animated.Value(-50)).current,
        buttons: useRef(new Animated.Value(-50)).current
    };
    const opacityRefs = {
        top: useRef(new Animated.Value(0)).current,
        desc: useRef(new Animated.Value(0)).current,
        credits: useRef(new Animated.Value(0)).current,
        buttons: useRef(new Animated.Value(0)).current
    };

    const [showAboutMe, setShowAboutMe] = useState(false);

    useEffect(() => {
        Animated.stagger(120, [
            ['top', 'desc', 'buttons', 'credits'].map(key =>
                Animated.parallel([
                    Animated.spring(animRefs[key], { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
                    Animated.timing(opacityRefs[key], { toValue: 1, duration: 400, useNativeDriver: true })
                ])
            )
        ].flat()).start();
    }, []);

    const showToast = () => {
        Toast.show({
            type: 'info',
            text1: 'ChronoX',
            text2: 'This version is optimized and mostly debugged.',
        });
    };

    const s = StyleSheet.create({
        content: { gap: 10 },
        borderBase: { borderWidth: border, borderColor: colors.border },
        cardBase: {
            backgroundColor: colors.settingBlock,
            borderRadius: variables.radius.md,
            paddingVertical: 15,
            paddingHorizontal: 20
        },
        rowCenter: { flexDirection: 'row', alignItems: 'center' },
        appIcon: {
            width: 72, height: 72, borderRadius: variables.radius.md, marginRight: 16,
            resizeMode: 'cover', borderWidth: border, borderColor: colors.cardBorder, transform: [{ scale: 1.15 }]
        },
        appName: { fontSize: 22, color: colors.textTitle, fontWeight: 'bold' },
        versionText: {
            marginTop: 14, fontSize: 12, color: colors.textDesc, backgroundColor: colors.card,
            textAlign: 'center', paddingHorizontal: 14, paddingVertical: 6,
            borderRadius: variables.radius.lg, alignSelf: 'flex-start', ...{ borderWidth: border, borderColor: colors.border }
        },
        description: { color: colors.text, fontSize: 14, lineHeight: 22 },
        quote: {
            color: colors.textSecondary, fontSize: 16, fontStyle: 'italic',
            borderLeftColor: colors.highlight, borderLeftWidth: 3, paddingLeft: 8, marginVertical: 24
        },
        credits: { textAlign: 'center', color: colors.textSecondary, fontSize: 14, height: 20 },
        buttonsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
        actionButton: {
            backgroundColor: colors.settingBlock,
            borderRadius: variables.radius.md,
            paddingVertical: 12, paddingHorizontal: 14,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            borderWidth: border, borderColor: colors.border
        },
        buttonText: { fontSize: 14, fontWeight: '600', color: colors.text, lineHeight: 20 },
    });

    return (
        <HeaderScreen
            headerIcon={<Icons.Ion name="information-circle" color={colors.highlight} />}
            headerTitle="About"
            borderRadius={variables.radius.md}
            paddingMargin={15}
            colors={colors}
            paddingX={15}
        >
            {showAboutMe && <AboutModal onClose={() => setShowAboutMe(false)} />}
            <View style={s.content}>

                <Animated.View style={[s.cardBase, s.borderBase, s.rowCenter, { transform: [{ translateY: animRefs.top }], opacity: opacityRefs.top }]}>
                    <Image source={require('../assets/icon.png')} style={s.appIcon} />
                    <View style={{ flex: 1 }}>
                        <Text style={s.appName}>ChronoX</Text>
                        <TouchableOpacity onPress={showToast}>
                            <Text style={s.versionText}>v{appVersion} - {appBuild}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <Animated.View style={[s.cardBase, s.borderBase, { transform: [{ translateY: animRefs.desc }], opacity: opacityRefs.desc }]}>
                    <Text style={[s.description, { textAlign: 'justify' }]}>
                        Some moments are worth remembering, others worth anticipating. Whether you're marking memories or counting down to what's next, ChronoX keeps time with what matters most.
                        {'\n\n'}
                        A thought that sparked this journey:
                    </Text>
                    <Text style={s.quote}>"Create what you wish existed."</Text>
                </Animated.View>

                <Animated.View style={{ transform: [{ translateY: animRefs.buttons }], opacity: opacityRefs.buttons }}>
                    <TouchableOpacity style={[s.actionButton, { flexBasis: '100%' }]} onPress={() => setShowAboutMe(true)}>
                        <Icons.Ion name="person-circle-outline" size={18} color={colors.text} style={{ marginRight: 8 }} />
                        <Text style={s.buttonText}>About Me</Text>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View
                    style={[
                        s.cardBase,
                        s.borderBase,
                        {
                            transform: [{ translateY: animRefs.credits }],
                            opacity: opacityRefs.credits,
                            paddingVertical: 12,
                            width: '100%',
                        }
                    ]}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={s.credits}>Made with </Text>
                        <Image
                            source={require('../assets/heart.png')}
                            style={{ width: 16, height: 16 }}
                        />
                        <Text style={s.credits}> by Parzival</Text>
                    </View>
                </Animated.View>


            </View>
        </HeaderScreen>
    );
}
