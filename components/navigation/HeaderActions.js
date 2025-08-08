import { useRef, useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const HeaderActions = ({
    title,
    searchQuery,
    setSearchQuery,
    onSearch,
    onAdd,
    onBatchDelete,
    isSelectable,
    selectedCount = 0,
    sortMethod,
    onSortChange,
    sortOptions,
    colors,
    variables,
    showActionNav,
    onToggleActionNav,
}) => {
    const inputRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);
    const { isBorder, border } = useTheme();

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
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 12,
            backgroundColor: 'transparent', // Container is now transparent
            gap: 8, // Space between elements
        },
        searchContainer: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            height: 38,
            paddingHorizontal: 12,
            borderRadius: variables.radius.circle,
            backgroundColor: colors.settingBlock,
            borderWidth: isBorder ? 1 : 0,
            borderColor: isFocused ? colors.highlight + '40' : colors.border,
        },
        searchInput: {
            flex: 1,
            color: colors.text,
            height: 38,
            fontSize: 16,
            paddingVertical: 0,
            paddingHorizontal: 8,
        },
        clearButton: {
            padding: 4,
            borderRadius: 12,
        },
        toggleButton: {
            width: 38,
            height: 38,
            borderRadius: variables.radius.circle,
            backgroundColor: showActionNav ? colors.highlight : colors.settingBlock,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: isBorder ? 1 : 0,
            borderColor: colors.border,
        },
    });

    return (
        <View style={styles.container}>
            {/* Search Input */}
            <View style={styles.searchContainer}>
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

            {/* Toggle Button */}
            <TouchableOpacity
                onPress={onToggleActionNav}
                style={styles.toggleButton}
                activeOpacity={0.8}
            >
                <MaterialIcons
                    name="tune"
                    size={20}
                    color={!showActionNav ? colors.highlight : colors.card}
                />
            </TouchableOpacity>
        </View>
    );
};

export default HeaderActions;