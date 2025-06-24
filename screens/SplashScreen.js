import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

const SplashScreen = ({ colors }) => {
    
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            justifyContent: 'start',
            alignItems: 'center',
        },
        logoContainer: {
            top: '30%',
            alignItems: 'center',
            width: 220,
        },
        logo: {
            width: 160,
            height: 160,
            borderRadius: 32,
        },
        quote: {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: '30%',
            textAlign: 'center',
            marginTop: 16,
            width: '100%',
            fontStyle: 'italic',
            fontSize: 16,
            color: colors.text,
            height: 50,
        },
        credits: {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: '5%',
            textAlign: 'center',
            fontSize: 14,
            color: colors.textDesc,
            height: 30,
            fontWeight: 'bold',
        },
    });
    

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image
                    source={require('../assets/logo.png')} 
                    style={styles.logo}
                    resizeMode="contain"
                />
                
            </View>
            <Text style={styles.quote}>
                "Create what you wish existed"
            </Text>
            <Text style={styles.credits}>
                Made with ❤️ by Parzival.
            </Text>
        </View>
    );
};


export default SplashScreen;