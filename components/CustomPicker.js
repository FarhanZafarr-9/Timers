import React, { useState } from 'react';
import { Modal, TouchableOpacity, View, Text, FlatList, StyleSheet } from 'react-native';
import { Icons } from '../assets/icons';

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
    variables,
}) => {
    const [visible, setVisible] = useState(false);

    const maxHeight = options.length * 55;

    const styles = StyleSheet.create({
        trigger: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: variables.radius.sm,
            paddingVertical: 8,
            paddingHorizontal: 16,
            backgroundColor: colors.highlight + '0f',
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
            backgroundColor: colors.background + 'f0',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modal: {
            backgroundColor: colors.settingBlock,
            borderRadius: variables.radius.md,
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
                        {React.cloneElement(selectedIcon, { color: colors.text })}
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
                                    <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 32 }}>
                                        {item.icon && (
                                            <View style={{ width: 26, alignItems: 'center', justifyContent: 'center' }}>
                                                {React.cloneElement(item.icon, { color: colors.text })}
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