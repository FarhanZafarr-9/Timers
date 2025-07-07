import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Text,
    Animated,
    Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

    // Animation values
    const searchAnim = useRef(new Animated.Value(1)).current;
    const buttonsAnim = useRef(new Animated.Value(0)).current;
    const countAnim = useRef(new Animated.Value(0)).current;

    // Sort state
    const [sortIdx, setSortIdx] = useState(sortOptions.findIndex(opt => opt.value === sortMethod));

    // Toggle between search and buttons
    useEffect(() => {
        Animated.parallel([
            Animated.spring(searchAnim, {
                toValue: isExpanded ? 0 : 1,
                useNativeDriver: true,
            }),
            Animated.spring(buttonsAnim, {
                toValue: isExpanded ? 1 : 0,
                useNativeDriver: true,
            }),
        ]).start();

        if (isExpanded) {
            inputRef.current?.blur();
        }
    }, [isExpanded]);

    // Selection mode animation
    useEffect(() => {
        Animated.spring(countAnim, {
            toValue: isSelectable ? 1 : 0,
            useNativeDriver: true,
        }).start();
    }, [isSelectable]);

    // Sort method change
    useEffect(() => {
        setSortIdx(sortOptions.findIndex(opt => opt.value === sortMethod));
    }, [sortMethod]);

    const handleSearch = (query) => {
        setSearchQuery(query);
        onSearch(query);
    };

    const clearSearch = () => {
        setSearchQuery('');
        onSearch('');
    };

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const handleSortChange = () => {
        const idx = sortOptions.findIndex(opt => opt.value === sortMethod);
        const next = sortOptions[(idx + 1) % sortOptions.length].value;
        onSortChange(next);
    };

    const styles = StyleSheet.create({
        container: {
            paddingBottom: 12,
            paddingTop: 12,
            marginVertical: 12,
            marginHorizontal: 12,
            borderBottomWidth: 1,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            borderBottomColor: colors.border,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            height: 44,
        },
        searchContainer: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.cardLighter,
            borderRadius: variables.radius.md,
            borderWidth: 1,
            borderColor: isFocused ? colors.highlight + '40' : colors.border,
            height: 44,
            paddingHorizontal: 12,
        },
        searchInput: {
            flex: 1,
            color: colors.text,
            height: 42,
            fontSize: 16,
            paddingVertical: 0,
            paddingHorizontal: 8,
        },
        clearButton: {
            padding: 4,
            borderRadius: 12,
        },
        buttonsContainer: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        actionButton: {
            flex: 1,
            height: 40,
            backgroundColor: colors.cardLighter,
            borderRadius: variables.radius.md,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
        },
        buttonContent: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        buttonText: {
            marginLeft: 6,
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
        },
        countBadge: {
            display: isSelectable ? 'flex' : 'none',
            minWidth: 20,
            height: 20,
            borderRadius: 6,
            backgroundColor: '#ef4444',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 6,
        },
        countText: {
            color: '#fff',
            fontSize: 12,
            fontWeight: '700',
            lineHeight: 20,
        },
        toggleButton: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.cardLighter,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            marginLeft: 8,
        },
    });

    return (
        <View style={styles.container}>

            <View style={styles.row}>
                {/* Search Input (collapsed state) */}
                <Animated.View
                    style={[
                        {
                            flex: 1,
                            flexDirection: 'row',
                            opacity: searchAnim,
                            transform: [{
                                translateX: searchAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-SCREEN_WIDTH, 0],
                                })
                            }]
                        }
                    ]}
                    pointerEvents={isExpanded ? 'none' : 'auto'}
                >
                    <View style={[styles.searchContainer, { flex: 1 }]}>
                        <MaterialIcons
                            name="search"
                            size={20}
                            color={colors.textDesc}
                            style={{ marginRight: 4 }}
                        />
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
                            <TouchableOpacity
                                onPress={clearSearch}
                                style={styles.clearButton}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <MaterialIcons name="close" size={18} color={colors.textDesc} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={toggleExpanded}
                        style={styles.toggleButton}
                        activeOpacity={0.8}
                    >
                        <Animated.View
                            style={{
                                transform: [{
                                    rotate: buttonsAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0deg', '180deg'],
                                    })
                                }]
                            }}
                        >
                            <MaterialIcons
                                name="tune"
                                size={20}
                                color={colors.text}
                            />
                        </Animated.View>
                    </TouchableOpacity>
                </Animated.View>

                {/* Action Buttons (expanded state) */}
                <Animated.View
                    style={[
                        styles.buttonsContainer,
                        {
                            position: 'absolute',
                            width: '100%',
                            opacity: buttonsAnim,
                            transform: [{
                                translateX: buttonsAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [SCREEN_WIDTH, 0],
                                })
                            }]
                        }
                    ]}
                    pointerEvents={isExpanded ? 'auto' : 'none'}
                >
                    <TouchableOpacity
                        onPress={onAdd}
                        style={styles.actionButton}
                        activeOpacity={0.8}
                    >
                        <View style={styles.buttonContent}>
                            <MaterialIcons name="add" size={18} color={colors.text} />
                            <Text style={styles.buttonText}>Add</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onBatchDelete}
                        style={[
                            styles.actionButton,
                            isSelectable && { backgroundColor: '#fee2e2', borderColor: '#ef4444' }
                        ]}
                        activeOpacity={0.8}
                    >
                        <View style={styles.buttonContent}>
                            <MaterialIcons
                                name="delete"
                                size={18}
                                color={isSelectable ? '#ef4444' : colors.text}
                            />
                            <Text style={[styles.buttonText, isSelectable && { color: '#ef4444' }]}>
                                Delete
                            </Text>
                            <Animated.View style={[
                                styles.countBadge,
                                {
                                    transform: [{
                                        scale: countAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.5, 1],
                                        })
                                    }],
                                    opacity: countAnim
                                }
                            ]}>
                                {isSelectable && (
                                    <Text style={styles.countText}>{selectedCount}</Text>
                                )}
                            </Animated.View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSortChange}
                        style={styles.actionButton}
                        activeOpacity={0.8}
                    >
                        <View style={styles.buttonContent}>
                            <MaterialIcons name="sort" size={16} color={colors.text} />
                            <Text style={styles.buttonText}>Sort</Text>
                            {sortOptions[sortIdx]?.icon && (
                                React.cloneElement(sortOptions[sortIdx].icon, {
                                    color: colors.text,
                                    size: 16,
                                    marginLeft: 18,
                                })
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={toggleExpanded}
                        style={styles.toggleButton}
                        activeOpacity={0.8}
                    >
                        <Animated.View
                            style={{
                                transform: [{
                                    rotate: buttonsAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0deg', '180deg'],
                                    })
                                }]
                            }}
                        >
                            <MaterialIcons
                                name="tune"
                                size={20}
                                color={colors.text}
                            />
                        </Animated.View>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
};

export default HeaderControls;