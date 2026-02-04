import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppLayout from '../../components/AppLayout';
import PremisesWizardModal from '../../components/modals/PremisesWizardModal';
import PremiseDetailsModal from '../../components/modals/PremiseDetailsModal';
import OfficeSelectorModal from '../../components/modals/OfficeSelectorModal';
import { getPremises, getPremiseById, createPremise, updatePremise, deletePremise } from '../../api/officeApi';
import { Platform } from 'react-native';
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

const OwnedPremisesScreen = ({ navigation, route }) => {
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
            const result = await getPremises('OWNED');
            if (result.success) {
                setPremises(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch owned premises:', error);
            // In web, alerts might be annoying, but acceptable for MVP
        } finally {
            setLoading(false);
        }
    };

    const handleView = async (item) => {
        try {
            const result = await getPremiseById(item.premise_id || item.id);
            if (result.success) {
                setSelectedPremise(result.data);
                setDetailsVisible(true);
            }
        } catch (error) {
            console.error('Failed to view details:', error);
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

    const handleEdit = async (item) => {
        try {
            // Fetch full details as requested
            const result = await getPremiseById(item.premise_id || item.id);
            if (result.success) {
                setSelectedPremise(result.data);
                setWizardVisible(true);
            } else {
                // Fallback to item if fetch fails or success false
                setSelectedPremise(item);
                setWizardVisible(true);
            }
        } catch (error) {
            console.error('Failed to fetch details:', error);
            setSelectedPremise(item);
            setWizardVisible(true);
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
            // Map form data to backend if needed, handled in Modal usually or here.
            // Assume Modal gives clean data ready for submission or we clean it there.
            // We will let Modal handle mapping to match API structure.
            if (selectedPremise) {
                // UPDATE logic
                await updatePremise(selectedPremise.premise_id || selectedPremise.id, data);
                alert('Premises updated successfully');
            } else {
                // CREATE logic
                await createPremise(data);
                alert('Premises created successfully');
            }
            fetchData();
            setWizardVisible(false);
            setSelectedPremise(null);
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save premise: ' + (error.message || 'Unknown error'));
            // Important: do not throw if we want to handle UI here, 
            // but Modal expects throw to stop loading spinner?
            // Let's re-throw so modal can stop loading.
            throw error;
        }
    };

    const handleAddPress = () => {
        // setSelectorVisible(true);
        setSelectedPremise(null);
        setWizardVisible(true);
    };

    const handleOfficeSelect = (type) => { // Kept for reference but unused
        setSelectorVisible(false);
        if (type === 'OfficeOwned') {
            navigation.navigate('OfficeOwned', { openWizard: true, timestamp: Date.now() });
        } else if (type === 'OfficeRental') {
            navigation.navigate('OfficeRental', { openWizard: true, timestamp: Date.now() });
        }
    };

    return (
        <AppLayout navigation={navigation}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Premises</Text>
                        <Text style={styles.subtitle}>Manage company office locations and facilities</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleAddPress}
                    >
                        <MaterialCommunityIcons name="plus" size={20} color="white" />
                        <Text style={styles.actionButtonText}>Add Premises</Text>
                    </TouchableOpacity>
                </View>

                {/* Search - Visual Only for MVP */}
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
                            <Text style={styles.emptyTitle}>No premises found</Text>
                            <Text style={styles.emptySub}>Get started by adding your first office location.</Text>
                            <TouchableOpacity
                                style={[styles.actionButton, { marginTop: 16 }]}
                                onPress={handleAddPress}
                            >
                                <Text style={styles.actionButtonText}>Add Premises</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <ScrollView style={{ width: '100%' }}>
                            {/* Debug: Showing {premises.length} items */}
                            {/* Table Header */}
                            <View style={[styles.row, styles.headerRow]}>
                                <Text style={[styles.cell, styles.headerCell, { flex: 2.5 }]}>PREMISE INFO</Text>
                                <Text style={[styles.cell, styles.headerCell, { flex: 2.5 }]}>LOCATION</Text>
                                <Text style={[styles.cell, styles.headerCell, { flex: 1.5 }]}>AREA / FLOORS</Text>
                                <Text style={[styles.cell, styles.headerCell, { flex: 2 }]}>FINANCIALS</Text>
                                <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>STATUS</Text>
                                <Text style={[styles.cell, styles.headerCell, { flex: 0.8, textAlign: 'right' }]}>ACTIONS</Text>
                            </View>

                            {premises.map((item, index) => (
                                <View key={item.premise_id} style={[styles.row, styles.dataRow]}>
                                    {/* PREMISE INFO */}
                                    <View style={[styles.cell, { flex: 2.5 }]}>
                                        <Text style={styles.cellTextPrimary}>{item.premises_name}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                            <MaterialCommunityIcons name="office-building" size={14} color="#64748b" style={{ marginRight: 4 }} />
                                            <Text style={styles.cellTextSecondary}>{item.premises_use}</Text>
                                        </View>
                                    </View>

                                    {/* LOCATION */}
                                    <View style={[styles.cell, { flex: 2.5 }]}>
                                        <Text style={styles.cellTextPrimary}>{item.city}, {item.country}</Text>
                                        <Text style={[styles.cellTextSecondary, { marginTop: 2 }]} numberOfLines={1}>{item.building_name}</Text>
                                    </View>

                                    {/* AREA / FLOORS */}
                                    <View style={[styles.cell, { flex: 1.5 }]}>
                                        <Text style={styles.cellTextPrimary}>{item.property_size_sqft ? `${item.property_size_sqft} sqft` : '-'}</Text>
                                        <Text style={[styles.cellTextSecondary, { marginTop: 2 }]}>{item.floors_count ? `${item.floors_count} Floors` : '-'}</Text>
                                    </View>

                                    {/* FINANCIALS */}
                                    <View style={[styles.cell, { flex: 2 }]}>
                                        <Text style={styles.cellTextPrimary}>{item.buy_date ? new Date(item.buy_date).toLocaleDateString() : '-'}</Text>
                                        {item.purchase_value ? <Text style={[styles.cellTextSecondary, { marginTop: 2 }]}>${Number(item.purchase_value).toLocaleString()}</Text> : null}
                                    </View>

                                    {/* STATUS */}
                                    <View style={[styles.cell, { flex: 1 }]}>
                                        <StatusPill status={item.status} />
                                    </View>

                                    {/* ACTIONS */}
                                    <View style={[styles.cell, { flex: 0.8, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 }]}>

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

                {/* Details View Modal */}
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
                    mode="OWNED"
                    initialData={selectedPremise}
                    initialStep={wizardStep}
                    readOnly={readOnlyMode}
                    onSave={handleSave}
                />

                {/* Removed TableActionMenu */}

                <OfficeSelectorModal
                    visible={selectorVisible}
                    onClose={() => setSelectorVisible(false)}
                    onSelect={handleOfficeSelect}
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
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24 },
    headerRow: { backgroundColor: '#F7F9FC', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 12 },
    dataRow: { borderBottomWidth: 1, borderBottomColor: '#f8fafc', backgroundColor: 'white' },
    cell: { paddingRight: 12 },
    headerCell: { fontSize: 11, color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    cellTextPrimary: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
    cellTextSecondary: { fontSize: 13, color: '#64748b', fontWeight: '400' },
    cellTextSecondary: { fontSize: 13, color: '#64748b', fontWeight: '400' },

    // Icon Buttons
    actionIconBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', borderRadius: 8, backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0' },
    dangerBtn: { borderColor: '#fee2e2', backgroundColor: '#fef2f2' },

    // Updates
    content: { flex: 1, backgroundColor: 'white', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', minHeight: 400, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { height: 4, width: 0 } },
});

export default OwnedPremisesScreen;
