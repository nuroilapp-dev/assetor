import React, { useState } from 'react';
import { View, StyleSheet, Modal, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Text } from 'react-native-paper';

const AssetFormModal = ({ visible, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        brand: ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onSave(formData);
        // Reset form or handle in parent
        setFormData({ name: '', code: '', brand: '' });
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Add New Asset</Text>

                    <View style={styles.formGroup}>
                        <TextInput
                            style={styles.input}
                            placeholder="Asset Name"
                            value={formData.name}
                            onChangeText={(text) => handleChange('name', text)}
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <TextInput
                            style={styles.input}
                            placeholder="Asset Code"
                            value={formData.code}
                            onChangeText={(text) => handleChange('code', text)}
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <TextInput
                            style={styles.input}
                            placeholder="Brand"
                            value={formData.brand}
                            onChangeText={(text) => handleChange('brand', text)}
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent grey background
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#f3f4f6', // Light greyish background matching the image
        width: '100%',
        maxWidth: 700,
        borderRadius: 24,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 24,
    },
    formGroup: {
        marginBottom: 16,
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        color: '#111827',
        outlineStyle: 'none', // Remove default web outline
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 16,
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    cancelButtonText: {
        color: '#6b7280',
        fontWeight: '500',
        fontSize: 14,
    },
    saveButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 20,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default AssetFormModal;
