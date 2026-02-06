import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BaseModal from './BaseModal';

const EmployeeFormModal = ({ visible, onClose, onSave, companyId, companyName, employee = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        employee_id_card: '',
        position: '',
        phone: '',
        department_id: null,
        password: '',
        auto_generate_password: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (employee) {
            setFormData({
                name: employee.name || '',
                email: employee.email || '',
                employee_id_card: employee.employee_id_card || '',
                position: employee.position || '',
                phone: employee.phone || '',
                department_id: employee.department_id || null,
                password: '',
                auto_generate_password: false // Don't auto-generate when editing
            });
        } else {
            setFormData({
                name: '',
                email: '',
                employee_id_card: '',
                position: '',
                phone: '',
                department_id: null,
                password: '',
                auto_generate_password: true
            });
        }
    }, [employee, visible]);

    const handleSave = async () => {
        if (!formData.name) {
            setError('Employee name is required');
            return;
        }

        setError(null);
        setLoading(true);
        try {
            await onSave({ ...formData, company_id: companyId });
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseModal visible={visible} onClose={onClose} title={employee ? `Edit ${employee.name}` : `Add Employee to ${companyName}`} width={500}>
            <View style={styles.container}>
                {error && (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>
                            {error === 'PRIVILEGE_DENIED' ? 'This company does not have the privilege to add employees.' : error}
                        </Text>
                    </View>
                )}

                <View style={styles.row}>
                    <View style={[styles.section, { flex: 1 }]}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="John Doe"
                        />
                    </View>
                    <View style={[styles.section, { flex: 1, marginLeft: 16 }]}>
                        <Text style={styles.label}>Employee ID Card</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.employee_id_card}
                            onChangeText={(text) => setFormData({ ...formData, employee_id_card: text })}
                            placeholder="ID-12345"
                        />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={[styles.section, { flex: 1 }]}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            placeholder="john@example.com"
                            keyboardType="email-address"
                        />
                    </View>
                    <View style={[styles.section, { flex: 1, marginLeft: 16 }]}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.phone}
                            onChangeText={(text) => setFormData({ ...formData, phone: text })}
                            placeholder="+971 ..."
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Position / Job Title</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.position}
                        onChangeText={(text) => setFormData({ ...formData, position: text })}
                        placeholder="Operations Manager"
                    />
                </View>

                {/* Login Credentials Section */}
                {!employee && (
                    <View style={styles.credentialsSection}>
                        <View style={styles.credentialsHeader}>
                            <MaterialCommunityIcons name="lock-outline" size={18} color="#3b82f6" />
                            <Text style={styles.credentialsTitle}>Login Credentials</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.checkboxRow}
                            onPress={() => setFormData({ ...formData, auto_generate_password: !formData.auto_generate_password })}
                        >
                            <View style={[styles.checkbox, formData.auto_generate_password && styles.checkboxChecked]}>
                                {formData.auto_generate_password && (
                                    <MaterialCommunityIcons name="check" size={16} color="white" />
                                )}
                            </View>
                            <Text style={styles.checkboxLabel}>Auto-generate password and send via email</Text>
                        </TouchableOpacity>

                        {!formData.auto_generate_password && (
                            <View style={styles.section}>
                                <Text style={styles.label}>Password</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        value={formData.password}
                                        onChangeText={(text) => setFormData({ ...formData, password: text })}
                                        placeholder="Enter password"
                                        secureTextEntry={true}
                                    />
                                </View>
                                <Text style={styles.helperText}>Password will be sent to the employee's email</Text>
                            </View>
                        )}
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>{employee ? 'Update Employee' : 'Add Employee'}</Text>}
                </TouchableOpacity>
            </View>
        </BaseModal>
    );
};

const styles = StyleSheet.create({
    container: { padding: 24 },
    row: { flexDirection: 'row', marginBottom: 20 },
    section: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 8, textTransform: 'uppercase' },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        color: '#1e293b',
    },
    saveButton: {
        backgroundColor: '#3b82f6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: { backgroundColor: '#94a3b8' },
    saveButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
    errorBox: {
        backgroundColor: '#fee2e2',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    errorText: { color: '#dc2626', fontSize: 13, fontWeight: '600' },
    credentialsSection: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    credentialsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    credentialsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
        marginLeft: 8,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#cbd5e1',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkboxChecked: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    checkboxLabel: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    helperText: {
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 6,
        fontStyle: 'italic',
    },
});

export default EmployeeFormModal;
