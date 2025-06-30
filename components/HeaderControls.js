import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Text,
    Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const HeaderControls = ({
    title,
    searchQuery,
    setSearchQuery,
    onSearch,
    onAdd,
    onBatchDelete,
    isSelectable,
    selectedCount = 0,
    colors,
    variables,
    sortMethod,
    onSortChange,
    sortOptions
}) => {
    const inputRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);

    // --- Enhanced Animation for count indicator & divider ---
    const countAnim = useRef(new Animated.Value(0)).current;
    const dividerAnim = useRef(new Animated.Value(0)).current;
    const iconPositionAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isSelectable) {
            // Slide in animations
            Animated.parallel([
                Animated.timing(iconPositionAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(dividerAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: false, // Using scaleX which affects layout
                }),
                Animated.timing(countAnim, {
                    toValue: 1,
                    duration: 250,
                    delay: 100, // Slight delay for staggered effect
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Slide out animations
            Animated.parallel([
                Animated.timing(countAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(dividerAnim, {
                    toValue: 0,
                    duration: 200,
                    delay: 50, // Slight delay for staggered effect
                    useNativeDriver: false,
                }),
                Animated.timing(iconPositionAnim, {
                    toValue: 0,
                    duration: 200,
                    delay: 100, // Animate back to center after other elements hide
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isSelectable]);

    // --- Enhanced Animation for sort mode change ---
    const [sortIdx, setSortIdx] = useState(sortOptions.findIndex(opt => opt.value === sortMethod));
    const [isTransitioning, setIsTransitioning] = useState(false);
    const sortAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const newIdx = sortOptions.findIndex(opt => opt.value === sortMethod);
        if (newIdx !== sortIdx && !isTransitioning) {
            setIsTransitioning(true);

            // Animate out current icon
            Animated.timing(sortAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }).start(() => {
                // Update index
                setSortIdx(newIdx);

                // Animate in new icon
                Animated.timing(sortAnim, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }).start(() => {
                    setIsTransitioning(false);
                });
            });
        }
    }, [sortMethod, sortIdx, isTransitioning]);

    const styles = StyleSheet.create({
        controlsContainer: {
            flexDirection: 'column',
            paddingVertical: 20,
            marginVertical: 20,
            borderBottomColor: colors.border,
            borderBottomWidth: 1.75,
            borderTopColor: colors.border,
            borderTopWidth: 1.75,
        },
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.highlight + '20',
            borderRadius: variables.radius.sm,
            borderWidth: 1.5,
            borderColor: isFocused ? colors.border : 'transparent',
            marginBottom: 12,
            height: 40,
        },
        searchInput: {
            flex: 1,
            color: colors.text,
            height: 36,
            paddingVertical: 0,
            textAlignVertical: 'center',
            paddingHorizontal: 15,
        },
        clearButton: {
            paddingHorizontal: 10,
            justifyContent: 'center',
            alignItems: 'center',
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
        },
        actionButton: {
            width: '32%',
            height: 40,
            backgroundColor: colors.highlight + '20',
            borderWidth: 0,
            borderColor: colors.border,
            borderRadius: variables.radius.sm,
            justifyContent: 'center',
            alignItems: 'center',
        },
        deleteButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
        },
        sortButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
        },
        sortIconContainer: {
            width: 24,
            height: 24,
            alignItems: 'center',
            justifyContent: 'center',
        },
        sortDivider: {
            width: 1,
            height: 16,
            backgroundColor: colors.highlight + '50',
            marginHorizontal: 12, // Increased from 8 to 12
        },
    });

    const handleSearch = (query) => {
        setSearchQuery(query);
        onSearch(query);
    };

    const clearSearch = () => {
        setSearchQuery('');
        onSearch('');
        inputRef.current?.blur();
    };

    return (
        <View style={styles.controlsContainer}>
            {/* Search input */}
            <View style={styles.searchContainer}>
                <TextInput
                    ref={inputRef}
                    style={styles.searchInput}
                    placeholder="Search timers..."
                    placeholderTextColor={colors.textDesc}
                    value={searchQuery}
                    onChangeText={handleSearch}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                        <MaterialIcons name="close" size={20} color={colors.textDesc} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Button row */}
            <View style={styles.buttonRow}>
                {/* Add button */}
                <TouchableOpacity onPress={onAdd} style={styles.actionButton} activeOpacity={0.75}>
                    <MaterialIcons name="add-circle-outline" size={16} color={colors.text} />
                </TouchableOpacity>

                {/* Enhanced Delete button */}
                <TouchableOpacity
                    onPress={onBatchDelete}
                    style={[styles.actionButton, styles.deleteButton]}
                    activeOpacity={0.75}
                >
                    {/* Fixed delete icon positioning */}
                    <Animated.View
                        style={{
                            width: 16,
                            height: 16,
                            alignItems: 'center',
                            justifyContent: 'center',
                            transform: [
                                {
                                    translateX: iconPositionAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [10, -5], // Move left when other elements appear
                                    }),
                                },
                            ],
                        }}
                    >
                        <MaterialIcons
                            name="delete-sweep"
                            size={16}
                            color={isSelectable ? '#ef4444' : colors.text}
                        />
                    </Animated.View>

                    {/* Animated divider */}
                    <Animated.View
                        style={{
                            width: 1,
                            height: 16,
                            backgroundColor: colors.highlight + '50',
                            marginHorizontal: dividerAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 10],
                            }),
                            opacity: dividerAnim,
                            alignSelf: 'center', // Center the divider vertically
                            transform: [
                                {
                                    scaleX: dividerAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 1],
                                    }),
                                },
                            ],
                        }}
                    />

                    {/* Animated count with better alignment */}
                    <Animated.View
                        style={{
                            minWidth: 20, // Minimum width to prevent layout shifts
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: countAnim,
                            transform: [
                                {
                                    translateX: countAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-20, 0],
                                    }),
                                },
                                {
                                    scale: countAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.8, 1],
                                    }),
                                },
                            ],
                        }}
                    >
                        <Text
                            style={{
                                color: colors.text,
                                fontWeight: 'bold',
                                fontSize: 14,
                                lineHeight: 16, // Match icon height for perfect alignment
                                textAlign: 'center',
                                includeFontPadding: false, // Remove extra padding on Android
                                textAlignVertical: 'center', // Center vertically on Android
                            }}
                        >
                            {selectedCount}
                        </Text>
                    </Animated.View>
                </TouchableOpacity>

                {/* Enhanced Sort button */}
                <TouchableOpacity
                    onPress={() => {
                        const idx = sortOptions.findIndex(opt => opt.value === sortMethod);
                        const next = sortOptions[(idx + 1) % sortOptions.length].value;
                        onSortChange(next);
                    }}
                    style={[styles.actionButton, styles.sortButton]}
                    activeOpacity={0.75}
                >
                    {/* Sort icon */}
                    <MaterialIcons name="sort" size={16} color={colors.text} />

                    {/* Static divider with increased margin */}
                    <View style={styles.sortDivider} />

                    {/* Animated sort mode icon container */}
                    <Animated.View
                        style={[
                            styles.sortIconContainer,
                            {
                                opacity: sortAnim,
                                transform: [
                                    {
                                        scale: sortAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.7, 1],
                                        }),
                                    },
                                    {
                                        rotateY: sortAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['90deg', '0deg'],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        {sortOptions[sortIdx]?.icon &&
                            React.cloneElement(
                                sortOptions[sortIdx].icon,
                                {
                                    color: colors.text,
                                    size: 14,
                                }
                            )
                        }
                    </Animated.View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default HeaderControls;