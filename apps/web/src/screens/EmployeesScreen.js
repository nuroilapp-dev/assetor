import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppLayout from '../components/AppLayout';
import EmployeeFormModal from '../components/modals/EmployeeFormModal';
import useAuthStore from '../store/authStore';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5032/api';

const EmployeesScreen = ({ navigation }) => {
    const { user } = useAuthStore();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`${API_URL}/employees`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setEmployees(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEmployee = async (data) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (editingEmployee) {
                await axios.put(`${API_URL}/employees/${editingEmployee.id}`, data, config);
            } else {
                await axios.post(`${API_URL}/employees`, data, config);
            }

            await fetchEmployees();
            setModalVisible(false);
            setEditingEmployee(null);
        } catch (error) {
            console.error('Error saving employee:', error);
            throw error;
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.row}>
            <View style={styles.nameCell}>
                <View style={styles.avatarMini}>
                    <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() || 'E'}</Text>
                </View>
                <View>
                    <Text style={styles.employeeName}>{item.name}</Text>
                    <Text style={styles.employeeEmail}>{item.email}</Text>
                </View>
            </View>
            <View style={styles.cell}>
                <Text style={styles.cellText}>{item.position || 'N/A'}</Text>
            </View>
            <View style={styles.cell}>
                <View style={styles.companyBadge}>
                    <Text style={styles.companyBadgeText}>{item.company_name}</Text>
                </View>
            </View>
            <View style={styles.cell}>
                <Text style={styles.cellText}>{item.phone || 'N/A'}</Text>
            </View>
            <View style={styles.actionCell}>
                <TouchableOpacity style={styles.actionButton}>
                    <MaterialCommunityIcons name="pencil-outline" size={18} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <AppLayout navigation={navigation}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Staff Members</Text>
                    <Text style={styles.subtitle}>Manage employees across your group</Text>
                </View>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => {
                        setEditingEmployee(null);
                        setModalVisible(true);
                    }}
                >
                    <MaterialCommunityIcons name="plus" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.addBtnText}>Add Employee</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tableCard}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.headerText, { flex: 2 }]}>EMPLOYEE</Text>
                    <Text style={[styles.headerText, { flex: 1 }]}>POSITION</Text>
                    <Text style={[styles.headerText, { flex: 1 }]}>COMPANY</Text>
                    <Text style={[styles.headerText, { flex: 1 }]}>PHONE</Text>
                    <Text style={[styles.headerText, { width: 80, textAlign: 'right' }]}>ACTIONS</Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3b82f6" />
                    </View>
                ) : (
                    <FlatList
                        data={employees}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons name="account-search-outline" size={48} color="#e2e8f0" />
                                <Text style={styles.emptyText}>No employees found</Text>
                            </View>
                        )}
                    />
                )}
            </View>

            <EmployeeFormModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setEditingEmployee(null);
                }}
                onSave={handleSaveEmployee}
                employee={editingEmployee}
                companyId={user?.company_id}
                companyName={user?.company_name || 'Your Company'}
            />
        </AppLayout>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    addBtn: {
        backgroundColor: '#3b82f6',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    addBtnText: {
        color: 'white',
        fontWeight: '600',
    },
    tableCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        flex: 1,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        ...(Platform.OS === 'web' ? {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        } : {}),
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748b',
        letterSpacing: 0.5,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    nameCell: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
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
    cell: {
        flex: 1,
    },
    cellText: {
        fontSize: 14,
        color: '#475569',
    },
    companyBadge: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    companyBadgeText: {
        fontSize: 11,
        color: '#475569',
        fontWeight: '600',
    },
    actionCell: {
        width: 80,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    actionButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        padding: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#94a3b8',
    },
});

export default EmployeesScreen;
