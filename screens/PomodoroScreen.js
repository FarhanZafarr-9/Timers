import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import ScreenWithHeader from '../components/ScreenWithHeder';
import Wave from '../components/Wave';
import { Icons } from '../assets/icons';

export default function PomodoroScreen() {
    const { variables, colors } = useTheme();

    return (
        <ScreenWithHeader
            headerIcon={<Icons.Ion name="hourglass-outline" size={18} color={colors.highlight} />}
            headerTitle="Pomodoro"
            borderRadius={variables.radius.md}
            paddingMargin={15}
            paddingX={15}
        >
            <View style={styles.centerContainer}>
                <Text style={[styles.comingSoonText, { color: colors.text }]}>
                    Coming Soon...
                </Text>
                <View style={{ width: '100%', marginTop: 20, justifyContent: 'center', alignItems: 'center' }}>
                    <Wave
                        height={40}
                        amplitude={10}
                        frequency={10}
                        speed={1000}
                        width={300}
                        color={colors.highlight}
                    />
                </View>
            </View>
        </ScreenWithHeader>
    );
}

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    comingSoonText: {
        fontSize: 20,
        fontWeight: '700',
        height: 30
    }
});
