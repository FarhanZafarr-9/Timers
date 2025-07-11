import React, { useRef, useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import HeaderControlsBottomSheet from './HeaderControlsBottomSheet';
import { useTheme } from '../utils/ThemeContext';

const HeaderControls = ({
    title,
    searchQuery,
    setSearchQuery,
    onSearch,
    onAdd,
    onBatchDelete, // keep your same prop name
    isSelectable,
    selectedCount = 0,
    sortMethod,
    onSortChange,
    sortOptions,
    colors,
    variables,
}) => {
    const inputRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);
    const [sheetVisible, setSheetVisible] = useState(false);
    const { isBorder } = useTheme();

    const handleSearch = (query) => {
        setSearchQuery(query);
        onSearch(query);
    };

    const clearSearch = () => {
        setSearchQuery('');
        onSearch('');
    };

    const styles = StyleSheet.create({
        container: {
            paddingBottom: 12,
            paddingTop: 12,
            marginVertical: 12,
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
            backgroundColor: colors.settingBlock,
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
        toggleButton: {
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: colors.cardLighter,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 8,
            borderWidth: isBorder ? 0.75 : 0,
            borderColor: colors.border,
        },

    });

    return (
        <>
            <View style={styles.container}>
                <View style={styles.row}>
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
                        onPress={() => setSheetVisible(true)}
                        style={styles.toggleButton}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons
                            name="tune"
                            size={20}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <HeaderControlsBottomSheet
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                onAdd={onAdd}
                onBatchToggle={onBatchDelete} // maps directly to your existing prop
                isSelectable={isSelectable}
                sortValue={sortMethod}
                onSortChange={onSortChange}
                sortOptions={sortOptions}
                colors={colors}
                variables={variables}
            />
        </>
    );
};

export default HeaderControls;
