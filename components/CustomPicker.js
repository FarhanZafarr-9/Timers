import React, { useState } from 'react';
import { Modal, TouchableOpacity, View, Text, FlatList, StyleSheet } from 'react-native';
import { Icons } from '../assets/icons'; // Optional: for dropdown icon
import { Dimensions } from 'react-native';

const CustomPicker = ({
    value,
    options,
    onChange,
    placeholder = 'Select...',
    style = {},
    optionStyle = {},
    modalStyle = {},
    textStyle = {},
    iconColor = '#888',
    colors,
}) => {
    const [visible, setVisible] = useState(false);

    // Get screen height for responsive modal
    const screenHeight = Dimensions.get('window').height;
    // Calculate maxHeight: 30% for <=5 options, 50% for more
    const maxHeight = options.length <= 5
        ? screenHeight * 0.2
        : screenHeight * 0.5;


    const styles = StyleSheet.create({
        trigger: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 14,
            paddingVertical: 8,
            paddingHorizontal: 16,
            backgroundColor: colors.highlight + '20',
            borderWidth: 0.75,
            borderColor: colors.border,
            minWidth: 70,
            justifyContent: 'space-between',
        },
        triggerText: {
            fontSize: 16,
            color: colors.text,
        },
        overlay: {
            flex: 1,
            backgroundColor: colors.background + 'd2',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modal: {
            backgroundColor: colors.settingBlock,
            borderRadius: 18,
            paddingVertical: 8,
            minWidth: 250,
            maxHeight,
            borderWidth: 0.75,
            borderColor: colors.border,
            overflow: 'hidden',
        },
        option: {
            paddingVertical: 10,
            paddingHorizontal: 20,
        },
        optionText: {
            fontSize: 16,
            color: colors.text,
        },
        selectedOption: {
            backgroundColor: colors.card,
        },
        selectedText: {
            color: colors.text,
            fontWeight: 'bold',
        },
    });

    // ...existing code...
    const selectedOption = options.find(opt => opt.value === value);
    const selectedLabel = selectedOption?.label || placeholder;
    const selectedIcon = selectedOption?.icon;

    return (
        <>
            <TouchableOpacity
                style={[styles.trigger, style]}
                onPress={() => setVisible(true)}
                activeOpacity={0.7}
            >
                {selectedIcon ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {selectedIcon}
                    </View>
                ) : (
                    <Text style={[styles.triggerText, textStyle]}>{selectedLabel}</Text>
                )}
                <Icons.Ion name="chevron-down" size={14} color={iconColor} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <TouchableOpacity style={styles.overlay} onPress={() => setVisible(false)} activeOpacity={1}>
                    <View style={[styles.modal, modalStyle]}>
                        <FlatList
                            data={options}
                            keyExtractor={item => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.option,
                                        optionStyle,
                                        value === item.value && styles.selectedOption
                                    ]}
                                    onPress={() => {
                                        onChange(item.value);
                                        setVisible(false);
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center',minHeight: 32 }}>
                                        {item.icon && (
                                            <View style={{ width: 26, alignItems: 'center', justifyContent: 'center' }}>
                                                {item.icon}
                                            </View>
                                        )}
                                        <Text
                                            style={[
                                                styles.optionText,
                                                value === item.value && styles.selectedText,
                                                { marginLeft: item.icon ? 18 : 0 }
                                            ]}
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                        >
                                            {item.label}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

export default CustomPicker;