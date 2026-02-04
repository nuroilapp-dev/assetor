import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Portal, Modal, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AlertDialog = ({
    visible,
    onDismiss,
    title = 'Alert',
    message,
    confirmText = 'OK',
    type = 'info' // 'info', 'success', 'error', 'warning'
}) => {
    const getIconConfig = () => {
        switch (type) {
            case 'success':
                return { name: 'check-circle-outline', color: '#10b981' };
            case 'error':
                return { name: 'alert-circle-outline', color: '#ef4444' };
            case 'warning':
                return { name: 'alert-outline', color: '#f59e0b' };
            default:
                return { name: 'information-outline', color: '#3b82f6' };
        }
    };

    const icon = getIconConfig();

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
                <View style={styles.content}>
                    {/* Icon */}
                    <View style={[styles.iconCircle, { backgroundColor: `${icon.color}15` }]}>
                        <MaterialCommunityIcons
                            name={icon.name}
                            size={40}
                            color={icon.color}
                        />
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{title}</Text>

                    {/* Message */}
                    <Text style={styles.message}>{message}</Text>

                    {/* Button */}
                    <View style={styles.buttonContainer}>
                        <Button
                            mode="contained"
                            onPress={onDismiss}
                            style={[styles.confirmButton, { backgroundColor: icon.color }]}
                            labelStyle={styles.confirmButtonText}
                        >
                            {confirmText}
                        </Button>
                    </View>
                </View>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'white',
        padding: 24,
        marginHorizontal: 20,
        borderRadius: 16,
        alignSelf: 'center',
        minWidth: 320,
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    content: {
        alignItems: 'center',
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    buttonContainer: {
        width: '100%',
    },
    confirmButton: {
        borderRadius: 8,
        paddingVertical: 4,
    },
    confirmButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
    },
});

export default AlertDialog;
