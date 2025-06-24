import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '../utils/variables';
import { Icons } from '../assets/icons';

import ScreenWithHeader from '../components/ScreenWithHeder';

export default function AboutScreen() {

    const { colors } = useTheme();

    const styles = StyleSheet.create({
        card: {
            backgroundColor: colors.settingBlock,
            borderRadius: 20,
            padding: 20,
            marginBottom: 16,
            alignItems: 'center',
            borderWidth: 0.75,
            borderColor: colors.cardBorder,

        },
        appIcon: {
            width: 72,
            height: 72,
            borderRadius: 16,
            marginRight: 16,
            resizeMode: 'cover',
        },
        appName: {
            fontSize: 22,
            color: colors.textTitle,
            fontWeight: 'bold',
        },
        versionText: {
            marginTop: 14,
            fontSize: 14,
            color: colors.textDesc,
            backgroundColor: colors.card,
            justifyContent: 'center',
            textAlign: 'center',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 4,
            alignSelf: 'flex-start',
        },
        description: {
            flex: 1,
            color: colors.text,
            fontSize: 14,
            lineHeight: 22,
        },
        quote: {
            color: colors.textSecondary,
            fontSize: 16,
            fontStyle: 'italic',
            alignSelf: 'flex-start',
            borderLeftColor: colors.highlight,
            left: 0,
            borderLeftWidth: 3,
            paddingLeft: 8,
            margin: 8,
            marginVertical: 24,
            paddingBottom: 4,
        },
        credits: {
            flex: 1,
            textAlign: 'center',
            color: colors.textSecondary,
            fontSize: 14,
        },
        pageTitle: {
            fontSize: 18,
            textTransform: 'uppercase',
            fontWeight: 'bold',
            color: colors.text,
            letterSpacing: 1.5,
        },
        pageHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            marginBottom: 26,
            borderBottomColor: colors.border,
            paddingBottom: 12,
            borderBottomWidth: 0.75,
        },
    });

    return (
        <ScreenWithHeader
            headerIcon={<Icons.Ion name="information-circle" color={colors.highlight} />}
            headerTitle="About"
            borderRadius={20}
            style={styles}
            paddingMargin={20}
        >
            <View style={styles.content}>
                {/* Top Card */}
                <View style={styles.card} flexDirection="row" alignItems="center">
                    <Image
                        source={require('../assets/logo.png')}
                        style={styles.appIcon}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.appName}>Timers</Text>
                        <Text style={styles.versionText}>v1.0</Text>
                    </View>
                </View>

                {/* Description Card */}
                <View style={styles.card} flexDirection="column">
                    <Text style={[styles.description, { textAlign: 'justify' }]}>
                        Designed for remembering important moments. Whether you're timing an event or counting down to a special occasion, Timers has you covered.
                        {'\n'}
                        {'\n'}
                        As a wise man once said:
                    </Text>

                    <Text style={[styles.quote, { fontStyle: 'italic', left: 0 }]}>
                        “Create what you wish existed.”
                    </Text>
                </View>

                {/* Credits Card */}
                <View style={styles.card}>
                    <Text style={styles.credits}>Made with ❤️ by Parzival</Text>
                </View>

            </View>
        </ScreenWithHeader>
    );
}