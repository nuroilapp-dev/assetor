import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TableActionMenu = ({ visible, onClose, anchorPosition, actions }) => {
    if (!visible || !anchorPosition) return null;

    // Adjust position to keep within screen bounds (basic logic)
    // anchorPosition is { x, y } (usually top-right of the trigger icon)
    // We want the menu to appear below and to the left of the anchor if possible, or just below-left.

    // Default: Top-Right of Menu is at Anchor X, Y.
    // So left = x - menuWidth. top = y.

    const menuWidth = 160;
    const top = anchorPosition.y + 10;
    const left = anchorPosition.x - menuWidth + 20; // +20 to align roughly with center of icon

    return (
        <Modal
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            animationType="fade"
        >
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={[styles.menu, { top, left, width: menuWidth }]}>
                    {actions.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.menuItem, index !== actions.length - 1 && styles.borderBottom]}
                            onPress={() => {
                                onClose();
                                action.onPress();
                            }}
                        >
                            <MaterialCommunityIcons
                                name={action.icon}
                                size={18}
                                color={action.danger ? '#ef4444' : '#475569'}
                            />
                            <Text style={[styles.menuText, action.danger && styles.dangerText]}>
                                {action.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        // backgroundColor: 'rgba(0,0,0,0.05)', // Optional dim
    },
    menu: {
        position: 'absolute',
        backgroundColor: 'white',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingVertical: 4,
        zIndex: 9999
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        gap: 10,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9'
    },
    menuText: {
        fontSize: 14,
        color: '#334155',
        fontWeight: '500'
    },
    dangerText: {
        color: '#ef4444'
    }
});

export default TableActionMenu;
