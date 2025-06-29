import React, { useRef, useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Text
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

    const borderColor = isFocused
        ? colors.Highlight
        : 'transparent';

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
                <TouchableOpacity onPress={onAdd} style={styles.actionButton}>
                    <MaterialIcons name="add-circle-outline" size={16} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onBatchDelete} style={[styles.actionButton, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
                    <MaterialIcons name="delete-sweep" size={16} color={isSelectable ? '#ef4444' : colors.text} />
                    {/* Vertical divider */}
                    {isSelectable && (
                        <>
                            <View style={{
                                width: 1,
                                height: 18,
                                backgroundColor: colors.highlight + '50',
                                marginHorizontal: 18,
                                opacity: 0.75,
                            }} />
                            <Text
                                style={{
                                    color: colors.text,
                                    marginLeft: 0,
                                    fontWeight: 'bold',
                                    fontSize: 14,
                                    opacity: isSelectable ? 1 : 0,
                                }}
                            >
                                {isSelectable ? selectedCount : ''}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        const idx = sortOptions.findIndex(opt => opt.value === sortMethod);
                        const next = sortOptions[(idx + 1) % sortOptions.length].value;
                        onSortChange(next);
                    }}
                    style={[styles.actionButton, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
                >
                    {/* Sort icon */}
                    <MaterialIcons name="sort" size={16} color={colors.text} />
                    {/* Vertical divider */}
                    <View style={{
                        width: 1,
                        height: 18,
                        backgroundColor: colors.highlight + '50',
                        marginHorizontal: 18,
                        opacity: 0.75,
                    }} />
                    {/* Current sort method icon */}
                    {sortOptions.find(opt => opt.value === sortMethod)?.icon &&
                        React.cloneElement(
                            sortOptions.find(opt => opt.value === sortMethod).icon,
                            { color: colors.text }
                        )
                    }
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default HeaderControls;