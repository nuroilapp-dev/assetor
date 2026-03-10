import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BaseModal from './BaseModal';
import axios from 'axios';
import useAuthStore from '../../store/authStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5032/api';

const EmployeeListModal = ({ visible, onClose, companyId, companyName }) => {
    const { token } = useAuthStore();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && companyId) {
            fetchEmployees();
        }
    }, [visible, companyId]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API_URL}/employees?company_id=${companyId}`, config);
            if (res.data.success) {
                setEmployees(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching employees for company:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderEmployeeItem = ({ item }) => (
        <View style={styles.employeeRow}>
            <View style={styles.avatarMini}>
                <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() || 'E'}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.employeeName}>{item.name}</Text>
            </View>
        </View>
    );

    return (
        <BaseModal
            visible={visible}
            onClose={onClose}
            title={`${companyName || 'Company'} Staff List`}
            width={550}
        >
            <View style={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
                ) : employees.length > 0 ? (
                    <FlatList
                        data={employees}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderEmployeeItem}
                        contentContainerStyle={styles.listContent}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="account-search-outline" size={64} color="#e2e8f0" />
                        <Text style={styles.emptyText}>No employees found for this company.</Text>
                    </View>
                )}
            </View>
        </BaseModal>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 500,
        padding: 16,
    },
    listContent: {
        paddingBottom: 20,
    },
    employeeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    avatarMini: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#3b82f6',
        fontWeight: 'bold',
        fontSize: 14,
    },
    employeeName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    employeeEmail: {
        fontSize: 12,
        color: '#64748b',
    },
    roleBadge: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    roleText: {
        fontSize: 11,
        color: '#475569',
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 15,
        color: '#94a3b8',
    },
});

export default EmployeeListModal;
