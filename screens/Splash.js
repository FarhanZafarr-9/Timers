import { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { quotes } from '../utils/functions';

const Splash = ({ variables, colors, visible = true, onHide }) => {

    // Animated values for sliding
    const logoSlide = useRef(new Animated.Value(-550)).current;
    const textSlide = useRef(new Animated.Value(350)).current;

    useEffect(() => {
        if (visible) {
            // Slide in
            Animated.parallel([
                Animated.spring(logoSlide, {
                    toValue: 0,
                    useNativeDriver: true,
                    friction: 7,
                }),
                Animated.spring(textSlide, {
                    toValue: 0,
                    useNativeDriver: true,
                    friction: 7,
                }),
            ]).start();
        } else {
            // Slide out
            Animated.parallel([
                Animated.timing(logoSlide, {
                    toValue: -200,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(textSlide, {
                    toValue: 100,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                if (onHide) onHide();
            });
        }
    }, [visible, logoSlide, textSlide, onHide]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            justifyContent: 'flex-start',
            alignItems: 'center',
        },
        logoContainer: {
            marginTop: '30%',
            alignItems: 'center',
            width: 220,
        },
        logo: {
            width: 160,
            height: 160,
            borderRadius: variables.radius.xl,
        },
        quote: {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: '30%',
            textAlign: 'center',
            fontStyle: 'italic',
            fontSize: 16,
            color: colors.highlight + 'f0',
            fontWeight: '600',
            height: 25
        },
        credits: {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: '5%',
            textAlign: 'center',
            fontSize: 14,
            color: colors.textDesc,
            fontWeight: 'bold',
            height: 20
        },
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[
                styles.logoContainer,
                { transform: [{ translateY: logoSlide }] }
            ]}>
                <Image
                    source={require('../assets/icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>
            <Animated.Text style={[
                styles.quote,
                { transform: [{ translateY: textSlide }] }
            ]}>
                {quotes[Math.floor(Math.random() * quotes.length)]}
            </Animated.Text>
            <Animated.Text style={[
                styles.credits,
                { transform: [{ translateY: textSlide }] }
            ]}>
                Made with ❤️ by Parzival.
            </Animated.Text>
        </View>
    );
};

export default Splash;