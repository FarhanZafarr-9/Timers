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
            borderRadius: variables.radius.circle ,
            marginVertical: 12,
            backgroundColor: colors.settingBlock,
            borderWidth: isBorder ? 1 : 0,
            borderColor: isFocused ? colors.highlight + '40' : colors.border,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            height: 48,
        },
        searchContainer: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            height: 48,
            paddingHorizontal: 12,
        },
        searchInput: {
            flex: 1,
            color: colors.text,
            height: 48,
            fontSize: 16,
            paddingVertical: 0,
            paddingHorizontal: 8,
        },
        clearButton: {
            padding: 4,
            borderRadius: 12,
        },
        toggleButton: {
            width: 48,
            height: 48,
            borderTopRightRadius: variables.radius.xl,
            borderBottomRightRadius: variables.radius.xl,
            backgroundColor: colors.highlight + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 8,
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
                            color={colors.textDesc}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <HeaderControlsBottomSheet
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                onAdd={onAdd}
                onBatchToggle={onBatchDelete}
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
