import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppLayout from '../components/AppLayout';
import KpiCard from '../components/KpiCard';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import ClientFormModal from '../components/modals/ClientFormModal';
import CompanyFormModal from '../components/modals/CompanyFormModal';
import EmployeeFormModal from '../components/modals/EmployeeFormModal';
import AlertDialog from '../components/AlertDialog';
import ConfirmDialog from '../components/ConfirmDialog';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5032/api';

const SuperadminDashboardScreen = ({ navigation }) => {
    const { token } = useAuthStore();
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [globalKpis, setGlobalKpis] = useState({
        totalClients: 0,
        totalCompanies: 0,
        totalEmployees: 0,
        totalAssets: 0
    });

    const [clientModalVisible, setClientModalVisible] = useState(false);
    const [companyModalVisible, setCompanyModalVisible] = useState(false);
    const [employeeModalVisible, setEmployeeModalVisible] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [editingCompany, setEditingCompany] = useState(null);
    const [editingEmployee, setEditingEmployee] = useState(null);

    // Dialog States
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'info' });
    const [confirmConfig, setConfirmConfig] = useState({ visible: false, title: '', message: '', onConfirm: () => { }, danger: false });

    const showAlert = (title, message, type = 'info') => {
        setAlertConfig({ visible: true, title, message, type });
    };

    const showConfirm = (title, message, onConfirm, danger = false) => {
        setConfirmConfig({ visible: true, title, message, onConfirm, danger });
    };

    // Initial load
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [clientsRes, kpisRes] = await Promise.all([
                axios.get(`${API_URL}/clients`, config),
                axios.get(`${API_URL}/clients/kpis`, config)
            ]);
            setClients(clientsRes.data.data);
            setGlobalKpis(kpisRes.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleSaveClient = async (data) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (editingClient) {
                await axios.put(`${API_URL}/clients/${editingClient.id}`, data, config);
                showAlert('Success', 'Client settings updated successfully.', 'success');
            } else {
                await axios.post(`${API_URL}/clients`, data, config);
                showAlert('Success', 'New client created successfully.', 'success');
            }
            fetchData();
        } catch (error) {
            console.error('Error saving client:', error);
            showAlert('Error', 'Failed to save client settings: ' + (error.response?.data?.message || error.message), 'error');
        }
    };

    const handleDeleteClient = async (clientId) => {
        showConfirm(
            'Delete Client',
            'Are you sure you want to delete this client? This will remove all associated data and cannot be undone.',
            async () => {
                try {
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    await axios.delete(`${API_URL}/clients/${clientId}`, config);
                    if (selectedClient?.id === clientId) setSelectedClient(null);
                    fetchData();
                    showAlert('Deleted', 'Client has been removed.', 'success');
                } catch (error) {
                    console.error('Error deleting client:', error);
                    showAlert('Error', 'Failed to delete client.', 'error');
                }
            },
            true
        );
    };

    const handleSaveCompany = async (data) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            let result;
            if (editingCompany) {
                result = await axios.put(`${API_URL}/companies/${editingCompany.id}`, data, config);
                showAlert('Success', 'Company updated successfully.', 'success');
            } else {
                result = await axios.post(`${API_URL}/companies`, data, config);
                showAlert('Success', 'Company created successfully.', 'success');
            }
            if (selectedClient) handleSelectClient(selectedClient);
            fetchData();
            return result.data.data;
        } catch (error) {
            console.error('Error saving company:', error);
            showAlert('Error', 'Failed to save company: ' + (error.response?.data?.message || error.message), 'error');
        }
    };

    const handleDeleteCompany = async (companyId) => {
        showConfirm(
            'Delete Company',
            'Are you sure you want to delete this company?',
            async () => {
                try {
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    await axios.delete(`${API_URL}/companies/${companyId}`, config);
                    if (selectedCompany?.id === companyId) setSelectedCompany(null);
                    if (selectedClient) handleSelectClient(selectedClient);
                    fetchData();
                    showAlert('Deleted', 'Company has been removed.', 'success');
                } catch (error) {
                    console.error('Error deleting company:', error);
                    showAlert('Error', 'Failed to delete company.', 'error');
                }
            },
            true
        );
    };

    const handleSaveEmployee = async (data) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/employees`, data, config);
            if (selectedClient) handleSelectClient(selectedClient);
            fetchData();
            showAlert('Success', 'Employee added successfully!', 'success');
        } catch (error) {
            console.error('Error saving employee:', error);
            if (error.response?.data?.message === 'PRIVILEGE_DENIED') {
                showAlert('Access Denied', 'This company does not have permission to add employees.', 'error');
            } else if (error.response?.data?.message === 'LIMIT_EXCEEDED') {
                showAlert('Limit Exceeded', error.response.data.detail, 'warning');
            } else {
                showAlert('Error', 'Failed to add employee: ' + (error.response?.data?.message || error.message), 'error');
            }
            throw error; // Re-throw to keep modal open and show error
        }
    };

    const handleSelectClient = async (client) => {
        setSelectedClient(client);
        setSelectedCompany(null);
        setDetailsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_URL}/clients/${client.id}`, config);
            setSelectedClient(response.data.data);
            setDetailsLoading(false);
        } catch (error) {
            console.error('Error fetching client details:', error);
            setDetailsLoading(false);
        }
    };

    const handleSelectCompany = async (company) => {
        setSelectedCompany(company);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_URL}/companies/${company.id}/documents`, config);
            if (response.data.success) {
                setSelectedCompany(prev => ({ ...prev, documents: response.data.data }));
            }
        } catch (error) {
            console.error('Error fetching company documents:', error);
        }
    };

    if (loading) {
        return (
            <AppLayout title="Superadmin Control Center">
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Clients & Tenant Control">
            {/* KPI Header */}
            <View style={styles.kpiContainer}>
                <KpiCard title="Total Clients" value={globalKpis.totalClients.toString()} icon="domain" color="#3b82f6" />
                <KpiCard title="Total Companies" value={globalKpis.totalCompanies.toString()} icon="office-building" color="#10b981" />
                <KpiCard title="Total Employees" value={globalKpis.totalEmployees.toString()} icon="account-group" color="#6366f1" />
                <KpiCard title="Total Assets" value={globalKpis.totalAssets.toString()} icon="cube-outline" color="#f59e0b" />
            </View>

            {/* 3-Pane Control Center */}
            <View style={styles.paneContainer}>

                {/* Pane 1: Clients List */}
                <View style={[styles.pane, styles.paneLeft]}>
                    <View style={styles.paneHeader}>
                        <Text style={styles.paneTitle}>Clients</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => { setEditingClient(null); setClientModalVisible(true); }}
                        >
                            <MaterialCommunityIcons name="plus" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {clients.map(client => (
                            <TouchableOpacity
                                key={client.id}
                                style={[styles.clientCard, selectedClient?.id === client.id && styles.activeCard]}
                                onPress={() => handleSelectClient(client)}
                            >
                                <View style={styles.cardTop}>
                                    <Text style={styles.clientName}>{client.name}</Text>
                                    <View style={styles.actions}>
                                        <TouchableOpacity
                                            style={styles.actionIcon}
                                            onPress={() => { setEditingClient(client); setClientModalVisible(true); }}
                                        >
                                            <MaterialCommunityIcons name="pencil" size={16} color="#3b82f6" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.actionIcon}
                                            onPress={() => handleDeleteClient(client.id)}
                                        >
                                            <MaterialCommunityIcons name="trash-can-outline" size={16} color="#ef4444" />
                                        </TouchableOpacity>
                                        <View style={[styles.statusBadge, client.status === 'ACTIVE' ? styles.statusActive : styles.statusSuspended, { marginLeft: 4 }]}>
                                            <Text style={styles.statusText}>{client.status}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.usageRow}>
                                    <Text style={styles.usageLabel}>Limits: {client.max_companies} Companies</Text>
                                </View>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: `${(client.companies_count || 0) / client.max_companies * 100}%`, backgroundColor: '#3b82f6' }]} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Pane 2: Companies List */}
                <View style={[styles.pane, styles.paneMiddle]}>
                    {selectedClient ? (
                        <>
                            <View style={styles.paneHeader}>
                                <Text style={styles.paneTitle}>{selectedClient.name} — Companies</Text>
                                <TouchableOpacity
                                    style={[styles.addButton, (selectedClient.companies?.length >= selectedClient.max_companies) && styles.disabledButton]}
                                    disabled={selectedClient.companies?.length >= selectedClient.max_companies}
                                    onPress={() => setCompanyModalVisible(true)}
                                >
                                    <MaterialCommunityIcons name="plus" size={20} color="white" />
                                </TouchableOpacity>
                            </View>

                            {selectedClient.companies?.length >= selectedClient.max_companies && (
                                <View style={styles.limitWarning}>
                                    <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#b45309" />
                                    <Text style={styles.limitWarningText}>Limit reached ({selectedClient.companies?.length}/{selectedClient.max_companies})</Text>
                                </View>
                            )}

                            {detailsLoading ? (
                                <View style={styles.centered}><ActivityIndicator color="#3b82f6" /></View>
                            ) : (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {selectedClient.companies?.map(company => (
                                        <TouchableOpacity
                                            key={company.id}
                                            style={[styles.companyCard, selectedCompany?.id === company.id && styles.activeCard]}
                                            onPress={() => handleSelectCompany(company)}
                                        >
                                            <View style={styles.cardTop}>
                                                <Text style={styles.companyName}>{company.name}</Text>
                                                <View style={styles.actions}>
                                                    <TouchableOpacity
                                                        style={styles.actionIcon}
                                                        onPress={() => { setEditingCompany(company); setCompanyModalVisible(true); }}
                                                    >
                                                        <MaterialCommunityIcons name="pencil" size={16} color="#3b82f6" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={styles.actionIcon}
                                                        onPress={() => handleDeleteCompany(company.id)}
                                                    >
                                                        <MaterialCommunityIcons name="trash-can-outline" size={16} color="#ef4444" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                            <View style={styles.tagContainer}>
                                                <View style={styles.tag}><Text style={styles.tagText}>{company.status || 'ACTIVE'}</Text></View>
                                                <View style={styles.tag}>
                                                    <Text style={styles.tagText}>
                                                        {company.employee_count}/{company.max_employees || 10} EMP
                                                    </Text>
                                                </View>
                                                <View style={styles.tag}>
                                                    <Text style={styles.tagText}>
                                                        {company.asset_count}/{company.max_assets || 20} AST
                                                    </Text>
                                                </View>
                                                {company.can_add_employee === false && (
                                                    <View style={[styles.tag, { backgroundColor: '#fee2e2' }]}>
                                                        <Text style={[styles.tagText, { color: '#ef4444' }]}>NO EMP ADD</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}
                        </>
                    ) : (
                        <View style={styles.emptyPane}>
                            <MaterialCommunityIcons name="domain" size={48} color="#e2e8f0" />
                            <Text style={styles.emptyText}>Select a client to manage companies</Text>
                        </View>
                    )}
                </View>

                {/* Pane 3: Details */}
                <View style={[styles.pane, styles.paneRight]}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {selectedCompany ? (
                            <View>
                                <View style={styles.paneHeader}>
                                    <Text style={styles.paneTitle}>{selectedCompany.name} Details</Text>
                                </View>
                                <View style={styles.detailsCard}>
                                    <Text style={styles.detailsLabel}>Identity & Tenancy</Text>
                                    <View style={styles.detailsRow}>
                                        <Text style={styles.detailsKey}>Code</Text>
                                        <Text style={styles.detailsValue}>{selectedCompany.company_code || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.detailsRow}>
                                        <Text style={styles.detailsKey}>Industry</Text>
                                        <Text style={styles.detailsValue}>{selectedCompany.industry || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.detailsRow}>
                                        <Text style={styles.detailsKey}>Tenancy</Text>
                                        <Text style={[styles.detailsValue, { color: selectedCompany.tenancy_type === 'OWNED' ? '#10b981' : '#3b82f6' }]}>
                                            {selectedCompany.tenancy_type || 'OWNED'}
                                        </Text>
                                    </View>
                                    {selectedCompany.tenancy_type === 'RENTED' && (
                                        <View style={styles.detailsRow}>
                                            <Text style={styles.detailsKey}>Landlord</Text>
                                            <Text style={styles.detailsValue}>{selectedCompany.landlord_name}</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.detailsCard}>
                                    <Text style={styles.detailsLabel}>Location & Contact</Text>
                                    <Text style={styles.detailsAddressText}>{selectedCompany.address || 'No address'}</Text>
                                    <Text style={styles.detailsSubText}>
                                        {[selectedCompany.city, selectedCompany.state, selectedCompany.country].filter(Boolean).join(', ') || 'No location set'}
                                    </Text>
                                    {selectedCompany.telephone && (
                                        <View style={[styles.detailsRow, { marginTop: 12 }]}>
                                            <Text style={styles.detailsKey}>Phone</Text>
                                            <Text style={styles.detailsValue}>{selectedCompany.telephone}</Text>
                                        </View>
                                    )}
                                    {selectedCompany.email && (
                                        <View style={styles.detailsRow}>
                                            <Text style={styles.detailsKey}>Email</Text>
                                            <Text style={styles.detailsValue}>{selectedCompany.email}</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.detailsCard}>
                                    <Text style={styles.detailsLabel}>Usage Limits</Text>
                                    <View style={styles.detailsRow}>
                                        <Text style={styles.detailsKey}>Employees</Text>
                                        <Text style={styles.detailsValue}>{selectedCompany.employee_count} / {selectedCompany.max_employees || 10}</Text>
                                    </View>
                                    <View style={styles.detailsRow}>
                                        <Text style={styles.detailsKey}>Assets</Text>
                                        <Text style={styles.detailsValue}>{selectedCompany.asset_count} / {selectedCompany.max_assets || 20}</Text>
                                    </View>
                                    <View style={styles.detailsRow}>
                                        <Text style={styles.detailsKey}>Can Add Employees</Text>
                                        <Text style={[styles.detailsValue, { color: selectedCompany.can_add_employee !== false ? '#10b981' : '#ef4444' }]}>
                                            {selectedCompany.can_add_employee !== false ? 'YES' : 'NO'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.detailsCard}>
                                    <Text style={styles.detailsLabel}>Company Documents</Text>
                                    {selectedCompany.documents && selectedCompany.documents.length > 0 ? (
                                        <View style={{ gap: 8 }}>
                                            {selectedCompany.documents.map(doc => (
                                                <TouchableOpacity
                                                    key={doc.id}
                                                    style={styles.docRow}
                                                    onPress={() => window.open(doc.url, '_blank')}
                                                >
                                                    <MaterialCommunityIcons name="file-pdf-box" size={20} color="#ef4444" />
                                                    <Text style={styles.docRowText} numberOfLines={1}>{doc.name}</Text>
                                                    <MaterialCommunityIcons name="open-in-new" size={12} color="#94a3b8" />
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    ) : (
                                        <Text style={styles.emptyText}>No documents uploaded</Text>
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => { setEditingCompany(selectedCompany); setCompanyModalVisible(true); }}
                                >
                                    <Text style={styles.actionButtonText}>Edit Company Settings</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: '#3b82f6', marginTop: 12 }]}
                                    onPress={() => { setEditingEmployee(null); setEmployeeModalVisible(true); }}
                                    disabled={selectedCompany.can_add_employee === false}
                                >
                                    <Text style={[styles.actionButtonText, { color: 'white' }]}>
                                        {selectedCompany.can_add_employee === false ? 'Employee Addition Disabled' : 'Add Employee'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : selectedClient ? (
                            <View>
                                <View style={styles.paneHeader}>
                                    <Text style={styles.paneTitle}>{selectedClient.name} Overview</Text>
                                </View>

                                <View style={styles.detailsCard}>
                                    <Text style={styles.detailsLabel}>Identity & Tenancy</Text>
                                    <View style={styles.detailsRow}>
                                        <Text style={styles.detailsKey}>Code</Text>
                                        <Text style={styles.detailsValue}>{selectedClient.company_code || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.detailsRow}>
                                        <Text style={styles.detailsKey}>Industry</Text>
                                        <Text style={styles.detailsValue}>{selectedClient.industry || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.detailsRow}>
                                        <Text style={styles.detailsKey}>Tenancy</Text>
                                        <Text style={[styles.detailsValue, { color: selectedClient.tenancy_type === 'OWNED' ? '#10b981' : '#3b82f6' }]}>
                                            {selectedClient.tenancy_type}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.detailsCard}>
                                    <Text style={styles.detailsLabel}>Location</Text>
                                    <Text style={styles.detailsAddressText}>{selectedClient.address || 'No address provided'}</Text>
                                    <Text style={styles.detailsSubText}>{selectedClient.city}, {selectedClient.state}, {selectedClient.country}</Text>
                                </View>

                                <View style={styles.detailsCard}>
                                    <Text style={styles.detailsLabel}>Resource Limits</Text>
                                    <View style={styles.detailsRow}>
                                        <Text style={styles.detailsKey}>Max Companies</Text>
                                        <Text style={styles.detailsValue}>{selectedClient.max_companies}</Text>
                                    </View>
                                    <View style={styles.detailsRow}>
                                        <Text style={styles.detailsKey}>Max Employees</Text>
                                        <Text style={styles.detailsValue}>{selectedClient.max_employees}</Text>
                                    </View>
                                    <View style={styles.detailsRow}>
                                        <Text style={styles.detailsKey}>Max Assets</Text>
                                        <Text style={styles.detailsValue}>{selectedClient.max_assets}</Text>
                                    </View>
                                </View>

                                <View style={styles.detailsCard}>
                                    <Text style={styles.detailsLabel}>Active Modules</Text>
                                    <View style={styles.tagContainer}>
                                        {(Array.isArray(selectedClient.enabled_modules) ? selectedClient.enabled_modules : JSON.parse(selectedClient.enabled_modules || '[]')).map(mod => (
                                            <View key={mod} style={styles.tag}>
                                                <Text style={styles.tagText}>{mod.toUpperCase()}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: '#3b82f6', marginBottom: 20 }]}
                                    onPress={() => { setEditingClient(selectedClient); setClientModalVisible(true); }}
                                >
                                    <Text style={[styles.actionButtonText, { color: 'white' }]}>Edit Client Settings</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={[styles.emptyPane, { marginTop: 100 }]}>
                                <MaterialCommunityIcons name="information-outline" size={48} color="#e2e8f0" />
                                <Text style={styles.emptyText}>Select a client or company to view full details</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>

            </View>

            {/* Modals */}
            <ClientFormModal
                visible={clientModalVisible}
                onClose={() => { setClientModalVisible(false); setEditingClient(null); }}
                onSave={handleSaveClient}
                client={editingClient}
            />
            <CompanyFormModal
                visible={companyModalVisible}
                onClose={() => { setCompanyModalVisible(false); setEditingCompany(null); }}
                onSave={handleSaveCompany}
                clientId={selectedClient?.id}
                clientName={selectedClient?.name}
                company={editingCompany}
            />
            <EmployeeFormModal
                visible={employeeModalVisible}
                onClose={() => { setEmployeeModalVisible(false); setEditingEmployee(null); }}
                onSave={handleSaveEmployee}
                companyId={selectedCompany?.id}
                companyName={selectedCompany?.name}
                employee={editingEmployee}
            />

            <AlertDialog
                visible={alertConfig.visible}
                onDismiss={() => setAlertConfig({ ...alertConfig, visible: false })}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />
            <ConfirmDialog
                visible={confirmConfig.visible}
                onDismiss={() => setConfirmConfig({ ...confirmConfig, visible: false })}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                danger={confirmConfig.danger}
            />
        </AppLayout>
    );
};

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    kpiContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        padding: 32,
        paddingBottom: 0,
    },
    paneContainer: {
        flex: 1,
        flexDirection: 'row',
        padding: 32,
        gap: 24,
    },
    pane: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        // Shadow for premium feel
        ...(Platform.OS === 'web' ? {
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.07)',
            backdropFilter: 'blur(10px)',
        } : {}),
    },
    paneLeft: { flex: 1 },
    paneMiddle: { flex: 1.2 },
    paneRight: { flex: 1 },
    paneHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    paneTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#cbd5e1',
    },
    clientCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    activeCard: {
        borderColor: '#3b82f6',
        backgroundColor: '#eff6ff',
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionIcon: {
        padding: 4,
        marginLeft: 4,
    },
    clientName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#334155',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    statusActive: { backgroundColor: '#dcfce7' },
    statusSuspended: { backgroundColor: '#fee2e2' },
    statusText: { fontSize: 10, fontWeight: '700' },
    usageRow: {
        marginBottom: 6,
    },
    usageLabel: {
        fontSize: 11,
        color: '#64748b',
    },
    progressBarBg: {
        height: 4,
        backgroundColor: '#f1f5f9',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
    },
    companyCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    companyName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    tagContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    tag: {
        backgroundColor: '#f8fafc',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    tagText: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '500',
    },
    limitWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fffbeb',
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
        gap: 8,
    },
    limitWarningText: {
        fontSize: 12,
        color: '#b45309',
        fontWeight: '600',
    },
    detailsCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    detailsLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#64748b',
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    detailsKey: {
        fontSize: 14,
        color: '#64748b',
    },
    detailsValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    detailsAddressText: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '500',
        marginBottom: 4,
    },
    detailsSubText: {
        fontSize: 12,
        color: '#94a3b8',
    },
    emptyText: {
        fontSize: 13,
        color: '#94a3b8',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 8
    },
    docRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 10
    },
    docRowText: {
        flex: 1,
        fontSize: 12,
        fontWeight: '600',
        color: '#1e293b'
    },
    actionButton: {
        backgroundColor: '#f1f5f9',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#475569',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyPane: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.8,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
    }
});

export default SuperadminDashboardScreen;
