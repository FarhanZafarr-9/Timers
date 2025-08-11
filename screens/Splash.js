import { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Dimensions, Text } from 'react-native';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const Splash = ({ variables, colors, visible = true, onHide }) => {
    const logoSlide = useRef(new Animated.Value(-300)).current;
    const creditSlide = useRef(new Animated.Value(200)).current;

    useEffect(() => {
        if (visible) {
            Animated.stagger(150, [
                Animated.spring(logoSlide, {
                    toValue: 0,
                    useNativeDriver: true,
                    friction: 7,
                }),
                Animated.spring(creditSlide, {
                    toValue: 0,
                    useNativeDriver: true,
                    friction: 8,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(logoSlide, {
                    toValue: -300,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(creditSlide, {
                    toValue: 200,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                onHide?.();
            });
        }
    }, [visible, logoSlide, creditSlide, onHide]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
        },
        logoContainer: {
            alignItems: 'center',
            marginBottom: screenHeight * 0.15,
        },
        logo: {
            width: screenWidth * 0.4,
            height: screenWidth * 0.4,
            borderRadius: variables.radius.xl,
        },
        credits: {
            textAlign: 'center',
            fontSize: 14,
            color: colors.textDesc,
            fontWeight: 'bold',
            height: 20,
        },
    });

    return (
        <View style={styles.container}>
            {/* Logo */}
            <Animated.View
                style={[styles.logoContainer, { transform: [{ translateY: logoSlide }] }]}
            >
                <Image
                    source={require('../assets/icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>

            {/* Credits */}
            <Animated.View
                style={{
                    position: 'absolute',
                    bottom: '6%',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transform: [{ translateY: creditSlide }],
                }}
            >
                <Text style={styles.credits}>Made with </Text>
                <Image
                    source={require('../assets/heart.png')}
                    style={{ width: 16, height: 16 }}
                />
                <Text style={styles.credits}> by Parzival.</Text>
            </Animated.View>


        </View>
    );
};

export default Splash;
