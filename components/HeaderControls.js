import { useRef, useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../utils/variables';
import Icons from '@expo/vector-icons/MaterialIcons';

const HeaderControls = ({
    title,
    searchQuery,
    setSearchQuery,
    onSearch,
    onAdd,
    onBatchDelete,
    isSelectable
}) => {

    const { colors } = useTheme();

    const inputRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);

    const styles = StyleSheet.create({
        controlsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            height: 60,
            paddingVertical: 12,

        },
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            flex: 1,
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
        addButtonContainer: {
            backgroundColor: colors.card,
            borderWidth: 0.75,
            borderColor: colors.border,
            borderRadius: 20,
            width: '10%',
            height: '100%',
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
        ? colors.highlight
        : colors.border;

    return (

        <View style={styles.controlsContainer}>
            

            {/* Search input */}
            <View style={[styles.searchContainer, { borderColor }]}>
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
            {/* Add button */}
            <TouchableOpacity onPress={onAdd} style={{ ...styles.addButtonContainer, marginHorizontal: 5 }}>
                <Icons name="add-circle-outline" size={16} color="#fefefe" />
            </TouchableOpacity>

            {/* Minus button for batch delete */}
            <TouchableOpacity onPress={onBatchDelete} style={styles.addButtonContainer}>
                <Icons name="delete-sweep" size={16} color={`${isSelectable ? '#ef4444' : '#fefefe'}`} />
            </TouchableOpacity>

        </View>
    );
};

export default HeaderControls;