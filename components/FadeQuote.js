// FadeQuote.js
import React, { useState, useEffect, memo } from 'react';
import { Animated, Text, View } from 'react-native';
import { quotes } from '../utils/functions';

const FadeQuote = memo(({
    quoteContainerOpacity,
    quoteTextOpacity,
    quoteScale,
    colors,
    styles
}) => {
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [displayedQuoteIndex, setDisplayedQuoteIndex] = useState(0);

    const animateQuote = React.useCallback((nextIndex) => {
        // Fade out current text with scale down
        Animated.parallel([
            Animated.timing(quoteTextOpacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(quoteScale, {
                toValue: 0.9,
                duration: 400,
                useNativeDriver: true,
            })
        ]).start(() => {
            // Update the displayed quote AFTER fade out completes
            setDisplayedQuoteIndex(nextIndex);

            // Then fade in new text with scale up
            Animated.parallel([
                Animated.timing(quoteTextOpacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.spring(quoteScale, {
                    toValue: 1,
                    tension: 120,
                    friction: 8,
                    useNativeDriver: true,
                })
            ]).start();
        });
    }, [quoteTextOpacity, quoteScale]);

    // Initial quote animation
    useEffect(() => {
        // Fade in the first quote
        Animated.parallel([
            Animated.timing(quoteTextOpacity, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(quoteScale, {
                toValue: 1,
                tension: 120,
                friction: 8,
                useNativeDriver: true,
            })
        ]).start();

        // Set up interval for quote changes
        const interval = setInterval(() => {
            setQuoteIndex(prev => (prev + 1) % quotes.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [quoteTextOpacity, quoteScale]);

    // Trigger animation when quote index changes (except for initial load)
    useEffect(() => {
        if (quoteIndex > 0) {
            animateQuote(quoteIndex);
        }
    }, [quoteIndex, animateQuote]);

    return (
        <Animated.View
            style={[
                styles.quoteCard,
                { opacity: quoteContainerOpacity }
            ]}
        >
            <Animated.View
                style={[
                    styles.quoteTextContainer,
                    {
                        opacity: quoteTextOpacity,
                        transform: [{ scale: quoteScale }]
                    }
                ]}
            >
                <Text style={styles.quoteText}>
                    {quotes[displayedQuoteIndex]}
                </Text>
            </Animated.View>
        </Animated.View>
    );
});

export default FadeQuote;