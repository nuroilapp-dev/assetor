import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppLayout from '../../components/AppLayout';
import PremisesWizardModal from '../../components/modals/PremisesWizardModal';
import PremiseDetailsModal from '../../components/modals/PremiseDetailsModal';
import OfficeSelectorModal from '../../components/modals/OfficeSelectorModal';
import { getPremises, getPremiseById, createPremise, updatePremise, deletePremise } from '../../api/officeApi';
import useAuthStore from '../../store/authStore';
import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

const StatusPill = ({ status }) => {
    let bg, color;
    switch (status) {
        case 'ACTIVE': bg = '#dcfce7'; color = '#15803d'; break;
        case 'INACTIVE': bg = '#f1f5f9'; color = '#475569'; break;
        default: bg = '#f1f5f9'; color = '#475569';
    }
    return (
        <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: bg, alignSelf: 'flex-start' }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: color }}>{status}</Text>
        </View>
    );
};

const RentalPremisesScreen = ({ navigation, route }) => {
    const [wizardVisible, setWizardVisible] = useState(false);
    const [selectorVisible, setSelectorVisible] = useState(false);
    const [premises, setPremises] = useState([]);

    const [loading, setLoading] = useState(true);
    const [selectedPremise, setSelectedPremise] = useState(null);
    const [wizardStep, setWizardStep] = useState(1);
    const [readOnlyMode, setReadOnlyMode] = useState(false);

    // Menu State
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState(null);
    const [menuItem, setMenuItem] = useState(null);
    const [detailsVisible, setDetailsVisible] = useState(false);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await getPremises('RENTAL');
            if (result.success) {
                setPremises(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch rental premises:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (route?.params?.openWizard) {
            setSelectedPremise(null);
            setWizardVisible(true);
            navigation.setParams({ openWizard: undefined });
        }
    }, [route?.params?.openWizard]);

    // --- ACTIONS ---
    const handleEdit = async (item) => {
        try {
            await fetchAndOpenWizard(item.premise_id || item.id);
        } catch (error) {
            console.error('Failed to fetch rental details:', error);
            setSelectedPremise(item);
            setWizardStep(1);
            setReadOnlyMode(false);
            setWizardVisible(true);
        }
    };

    const handleView = async (item) => {
        const id = item.premise_id || item.id;
        try {
            const result = await getPremiseById(id);
            if (result.success) {
                setSelectedPremise(result.data);
                setDetailsVisible(true);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setSelectedPremise(item);
            setDetailsVisible(true);
        }
    };

    const handleDocuments = async (item) => {
        await fetchAndOpenWizard(item.premise_id || item.id, false, 5); // Step 5 presumably? Rental preserved 4 steps?
        // Rental has 4 steps, so documents is step 4 actually.
        // Wait, logic says `const totalSteps = isOwned ? 5 : 4`. So step 4 is doc.
        await fetchAndOpenWizard(item.premise_id || item.id, false, 4);
    };

    const fetchAndOpenWizard = async (id, readOnly = false, step = 1) => {
        const result = await getPremiseById(id);
        if (result.success) {
            setSelectedPremise(result.data);
        } else {
            // fallback
        }
        setWizardStep(step);
        setReadOnlyMode(readOnly);
        setWizardVisible(true);
    };

    const handleChangeStatus = async (item) => {
        const newStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        if (Platform.OS === 'web') {
            if (window.confirm(`Change status to ${newStatus}?`)) executeStatusChange(item, newStatus);
        } else {
            Alert.alert('Change Status', `Change status to ${newStatus}?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Confirm', onPress: () => executeStatusChange(item, newStatus) }
            ]);
        }
    };

    const executeStatusChange = async (item, status) => {
        try {
            await updatePremise(item.premise_id || item.id, { ...item, status });
            fetchData();
        } catch (e) {
            alert('Failed to update status');
        }
    };

    const openMenu = (event, item) => {
        const { pageX, pageY } = event.nativeEvent;
        const pos = (pageX !== undefined) ? { x: pageX, y: pageY } : null;
        if (pos) {
            setMenuPosition(pos);
            setMenuItem(item);
            setMenuVisible(true);
        }
    };

    const handleDelete = (item) => {
        if (Platform.OS === 'web') {
            const confirm = window.confirm(`Are you sure you want to delete ${item.premises_name}?`);
            if (confirm) executeDelete(item.id || item.premise_id);
        } else {
            Alert.alert('Delete Premise', `Are you sure you want to delete ${item.premises_name}?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => executeDelete(item.id || item.premise_id) }
            ]);
        }
    };

    const executeDelete = async (id) => {
        try {
            await deletePremise(id);
            fetchData();
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete premise');
        }
    };

    const handleSave = async (data) => {
        try {
            if (selectedPremise) {
                await updatePremise(selectedPremise.premise_id || selectedPremise.id, data);
                alert('Premises updated successfully');
            } else {
                await createPremise(data);
                alert('Premises created successfully');
            }
            fetchData();
            setWizardVisible(false);
            setSelectedPremise(null);
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save premise: ' + (error.message || 'Unknown error'));
            throw error;
        }
    };

    return (
        <AppLayout navigation={navigation}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Rental Premises</Text>
                        <Text style={styles.subtitle}>Manage leased office spaces</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setSelectorVisible(true)}
                    >
                        <MaterialCommunityIcons name="plus" size={20} color="white" />
                        <Text style={styles.actionButtonText}>Add Premises</Text>
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.filterRow}>
                    <View style={styles.searchBox}>
                        <MaterialCommunityIcons name="magnify" size={20} color="#94a3b8" />
                        <TextInput
                            placeholder="Search premises..."
                            style={styles.input}
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#3b82f6" />
                    ) : premises.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={styles.iconCircle}>
                                <MaterialCommunityIcons name="office-building" size={48} color="#cbd5e1" />
                            </View>
                            <Text style={styles.emptyTitle}>No records found</Text>
                            <Text style={styles.emptySub}>Add your first rental office location.</Text>
                            <TouchableOpacity
                                style={[styles.actionButton, { marginTop: 16 }]}
                                onPress={() => setSelectorVisible(true)}
                            >
                                <Text style={styles.actionButtonText}>Add Now</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <ScrollView style={{ width: '100%' }}>
                            {/* Debug: Showing {premises.length} items */}
                            {/* Table Header */}
                            <View style={[styles.row, styles.headerRow]}>
                                <Text style={[styles.cell, styles.headerCell, { flex: 2 }]}>Premises Name</Text>
                                <Text style={[styles.cell, styles.headerCell, { flex: 1.5 }]}>Building</Text>
                                <Text style={[styles.cell, styles.headerCell, { flex: 1.5 }]}>Landlord</Text>
                                <Text style={[styles.cell, styles.headerCell, { flex: 1.5 }]}>Contract End</Text>
                                <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Rent</Text>
                                <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Status</Text>
                                <Text style={[styles.cell, styles.headerCell, { flex: 1, textAlign: 'right' }]}>Actions</Text>
                            </View>

                            {premises.map((item, index) => (
                                <View key={item.premise_id} style={[styles.row, styles.dataRow]}>
                                    <Text style={[styles.cell, styles.cellTextPrimary, { flex: 2 }]}>{item.premises_name}</Text>
                                    <Text style={[styles.cell, styles.cellTextSecondary, { flex: 1.5 }]}>{item.building_name}</Text>
                                    <Text style={[styles.cell, styles.cellTextSecondary, { flex: 1.5 }]}>{item.landlord_name}</Text>
                                    <Text style={[styles.cell, styles.cellTextSecondary, { flex: 1.5 }]}>{item.contract_end ? new Date(item.contract_end).toLocaleDateString() : '-'}</Text>
                                    <Text style={[styles.cell, styles.cellTextSecondary, { flex: 1 }]}>{item.monthly_rent}</Text>
                                    <View style={[styles.cell, { flex: 1 }]}>
                                        <StatusPill status={item.status} />
                                    </View>
                                    <View style={[styles.cell, { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 }]}>

                                        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionIconBtn}>
                                            <FiEdit2 size={16} color="#475569" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDelete(item)} style={[styles.actionIconBtn, styles.dangerBtn]}>
                                            <FiTrash2 size={16} color="#dc2626" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Details Modal */}
                <PremiseDetailsModal
                    visible={detailsVisible}
                    onClose={() => setDetailsVisible(false)}
                    data={selectedPremise}
                    onEdit={() => {
                        setDetailsVisible(false);
                        handleEdit(selectedPremise);
                    }}
                />

                {/* Wizard Modal */}
                <PremisesWizardModal
                    visible={wizardVisible}
                    onClose={() => { setWizardVisible(false); setSelectedPremise(null); }}
                    mode="RENTAL"
                    initialData={selectedPremise}
                    initialStep={wizardStep}
                    readOnly={readOnlyMode}
                    onSave={handleSave}
                />



                <OfficeSelectorModal
                    visible={selectorVisible}
                    onClose={() => setSelectorVisible(false)}
                    onSelect={(type) => {
                        setSelectorVisible(false);
                        if (type === 'OfficeOwned') {
                            navigation.navigate('OfficeOwned', { openWizard: true, timestamp: Date.now() });
                        } else if (type === 'OfficeRental') {
                            navigation.navigate('OfficeRental', { openWizard: true, timestamp: Date.now() });
                        }
                    }}
                />
            </View>
        </AppLayout>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, gap: 24 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
    actionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3b82f6', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, gap: 8 },
    actionButtonText: { color: 'white', fontWeight: '600', fontSize: 14 },
    filterRow: { flexDirection: 'row', gap: 12 },
    searchBox: { flex: 1, maxWidth: 400, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
    input: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1e293b', outlineStyle: 'none' },
    content: { flex: 1, backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', minHeight: 400, padding: 20 },
    emptyState: { alignItems: 'center', justifyContent: 'center', height: '100%' },
    iconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: '#334155', marginBottom: 4 },
    emptySub: { fontSize: 14, color: '#94a3b8' },

    // Table Styles
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    headerRow: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9', marginBottom: 4, paddingBottom: 12 },
    dataRow: { borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
    cell: { paddingRight: 8 },
    headerCell: { fontSize: 12, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' },
    cellTextPrimary: { fontSize: 14, fontWeight: '500', color: '#334155' },
    cellTextSecondary: { fontSize: 13, color: '#64748b' },

    // Icon Buttons
    actionIconBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', borderRadius: 8, backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0' },
    dangerBtn: { borderColor: '#fee2e2', backgroundColor: '#fef2f2' },
});

export default RentalPremisesScreen;
