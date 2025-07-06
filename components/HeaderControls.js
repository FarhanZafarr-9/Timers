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
    const [isExpanded, setIsExpanded] = useState(false);

    // Animation for button row expansion/collapse
    const expandAnim = useRef(new Animated.Value(0)).current;
    const buttonRowHeight = useRef(new Animated.Value(0)).current;

    // Animation for count indicator & divider in delete button
    const countAnim = useRef(new Animated.Value(0)).current;
    const dividerAnim = useRef(new Animated.Value(0)).current;
    const iconPositionAnim = useRef(new Animated.Value(0)).current;

    // Animation for sort mode change
    const [sortIdx, setSortIdx] = useState(sortOptions.findIndex(opt => opt.value === sortMethod));
    const [isTransitioning, setIsTransitioning] = useState(false);
    const sortAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isExpanded) {
            Animated.parallel([
                Animated.timing(buttonRowHeight, {
                    toValue: 52,
                    duration: 300,
                    useNativeDriver: false,
                }),
                Animated.timing(expandAnim, {
                    toValue: 1,
                    duration: 300,
                    delay: 100,
                    useNativeDriver: false,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(expandAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: false,
                }),
                Animated.timing(buttonRowHeight, {
                    toValue: 0,
                    duration: 250,
                    delay: 50,
                    useNativeDriver: false,
                }),
            ]).start();
        }
    }, [isExpanded]);

    // Handle selection mode animations
    useEffect(() => {
        if (isSelectable) {
            Animated.parallel([
                Animated.timing(iconPositionAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(dividerAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: false,
                }),
                Animated.timing(countAnim, {
                    toValue: 1,
                    duration: 250,
                    delay: 100,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(countAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(dividerAnim, {
                    toValue: 0,
                    duration: 200,
                    delay: 50,
                    useNativeDriver: false,
                }),
                Animated.timing(iconPositionAnim, {
                    toValue: 0,
                    duration: 200,
                    delay: 100,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isSelectable]);

    useEffect(() => {
        const newIdx = sortOptions.findIndex(opt => opt.value === sortMethod);
        if (newIdx !== sortIdx && !isTransitioning) {
            setIsTransitioning(true);

            Animated.timing(sortAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }).start(() => {
                setSortIdx(newIdx);
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
        searchRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        searchContainer: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.highlight + '20',
            borderRadius: variables.radius.sm,
            borderWidth: 1.5,
            borderColor: isFocused ? colors.border : 'transparent',
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
            height: 40,
        },
        toggleButton: {
            width: 40,
            height: 40,
            backgroundColor: colors.highlight + '25',
            borderRadius: variables.radius.sm,
            justifyContent: 'center',
            alignItems: 'center',
        },
        buttonRowContainer: {
            overflow: 'hidden',
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            marginTop: 12,
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
            marginHorizontal: 12,
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

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const handleAddFromExpanded = () => {
        onAdd();
        setIsExpanded(false);
    };

    return (
        <View style={styles.controlsContainer}>
            {/* Search input with toggle button */}
            <View style={styles.searchRow}>
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

                <TouchableOpacity
                    onPress={toggleExpanded}
                    style={styles.toggleButton}
                    activeOpacity={0.75}
                >
                    <Animated.View
                        style={{
                            transform: [
                                {
                                    rotate: expandAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0deg', '180deg'],
                                    }),
                                },
                            ],
                        }}
                    >
                        <MaterialIcons
                            name="keyboard-arrow-down"
                            size={20}
                            color={colors.text}
                        />
                    </Animated.View>
                </TouchableOpacity>
            </View>

            {/* Animated button row with improved collapse behavior */}
            <Animated.View
                style={[
                    styles.buttonRowContainer,
                    {
                        height: buttonRowHeight,
                        opacity: expandAnim,
                        transform: [
                            {
                                translateY: expandAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-10, 0],
                                }),
                            },
                            {
                                scale: expandAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.95, 1],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <View style={styles.buttonRow}>
                    {/* Add button */}
                    <TouchableOpacity
                        onPress={handleAddFromExpanded}
                        style={styles.actionButton}
                        activeOpacity={0.75}
                    >
                        <MaterialIcons name="add-circle-outline" size={16} color={colors.text} />
                    </TouchableOpacity>

                    {/* Delete button with enhanced animations */}
                    <TouchableOpacity
                        onPress={onBatchDelete}
                        style={[styles.actionButton, styles.deleteButton]}
                        activeOpacity={0.75}
                    >
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
                                            outputRange: [10, -5],
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
                                alignSelf: 'center',
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

                        <Animated.View
                            style={{
                                minWidth: 20,
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
                                    lineHeight: 16,
                                    textAlign: 'center',
                                    includeFontPadding: false,
                                    textAlignVertical: 'center',
                                }}
                            >
                                {selectedCount}
                            </Text>
                        </Animated.View>
                    </TouchableOpacity>

                    {/* Sort button with enhanced animations */}
                    <TouchableOpacity
                        onPress={() => {
                            const idx = sortOptions.findIndex(opt => opt.value === sortMethod);
                            const next = sortOptions[(idx + 1) % sortOptions.length].value;
                            onSortChange(next);
                        }}
                        style={[styles.actionButton, styles.sortButton]}
                        activeOpacity={0.75}
                    >
                        <MaterialIcons name="sort" size={16} color={colors.text} />
                        <View style={styles.sortDivider} />
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
            </Animated.View>
        </View>
    );
};

export default HeaderControls;