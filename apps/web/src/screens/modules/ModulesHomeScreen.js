import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Card, Text, Button, IconButton, ActivityIndicator, Chip, DataTable, Portal, Modal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../api/client';
import AppLayout from '../../components/AppLayout';
import ModuleFormModal from '../../components/modals/ModuleFormModal';

const ModulesHomeScreen = ({ navigation }) => {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
    const [viewOnly, setViewOnly] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [viewDetailsVisible, setViewDetailsVisible] = useState(false);
    const [selectedModule, setSelectedModule] = useState(null);
    const [initialSection, setInitialSection] = useState(null);

    useEffect(() => {
        fetchModules();
    }, []);

    const fetchModules = async () => {
        try {
            setLoading(true);
            const response = await api.get('module-master');
            // User requested SELECT * FROM module_master and only these details.
            // Mapping module_id to id for DataTable consistency, and name to name.
            const mapped = (response.data.data || []).map(m => ({
                id: m.mapping_id || m.module_id, // Use mapping_id for existing memberships
                module_id: m.module_id,
                name: m.module_name,
                status: m.mapping_id ? (m.is_enabled ? 'ACTIVE' : 'INACTIVE') : 'INACTIVE',
                country: m.country,
                premises_type: m.premises_type,
                section_area: m.section_area,
                ...m
            }));
            setModules(mapped);
        } catch (error) {
            console.error('Fetch modules error:', error);
            Alert.alert('Error', 'Failed to load module catalog.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveModule = async (moduleData) => {
        try {
            let response;
            if (editingModule) {
                response = await api.put(`company-modules/${editingModule.id}`, moduleData);
                Alert.alert('Success', 'Module configuration updated.');
            } else {
                response = await api.post('company-modules', moduleData);
                Alert.alert('Success', 'Module successfully added.');
            }

            fetchModules();
            setModalVisible(false);
            setEditingModule(null);

            // Navigate to configuration if it's a new module or as requested
            if (!editingModule && response.data?.data?.module_id) {
                navigation.navigate('ModuleTemplates', {
                    moduleId: response.data.data.module_id,
                    moduleName: moduleData.selected_name // Pass name if available
                });
            }
        } catch (error) {
            console.error('Save module error:', error);
            const msg = error.response?.data?.message || 'Failed to save module mapping';
            Alert.alert('Error', msg);
            throw error;
        }
    };

    const handleDeleteModule = async (id) => {
        Alert.alert(
            'Delete Module',
            'Are you sure you want to remove this module from your company catalog?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`company-modules/${id}`);
                            fetchModules();
                        } catch (error) {
                            console.error('Delete module error:', error);
                            Alert.alert('Error', 'Failed to remove module mapping');
                        }
                    }
                }
            ]
        );
    };


    const handleEditModule = (module) => {
        setEditingModule(module);
        setViewOnly(false);
        setInitialSection(null);
        setModalVisible(true);
    };

    const [detailsLoading, setDetailsLoading] = useState(false);
    const [moduleStructure, setModuleStructure] = useState([]); // [{ section, fields: [] }]

    const handleViewModule = async (module) => {
        try {
            setDetailsLoading(true);
            const latest = modules.find(m => m.module_id === module.module_id) || module;
            setSelectedModule(latest);
            setInitialSection(null);
            setViewDetailsVisible(true);
            setModuleStructure([]);

            // Fetch full structure (Sections + Fields)
            const sectionRes = await api.get(`module-builder/${module.module_id}/sections`);
            const sections = sectionRes.data.data || [];

            const full = await Promise.all(sections.map(async (sec) => {
                const fieldsRes = await api.get(`module-builder/fields?section_id=${sec.id}`);
                return { ...sec, fields: fieldsRes.data.data || [] };
            }));

            setModuleStructure(full);
        } catch (error) {
            console.error('View module details error:', error);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleEditSectionFromDetails = (sectionName) => {
        // Refresh selectedModule from the latest state before editing
        const latest = modules.find(m => m.module_id === selectedModule?.module_id) || selectedModule;
        setViewDetailsVisible(false);
        setInitialSection(sectionName);
        setEditingModule(latest);
        setViewOnly(false);
        setModalVisible(true);
    };

    const handleAddModule = () => {
        setEditingModule(null);
        setViewOnly(false);
        setModalVisible(true);
    };

    const filteredModules = modules.filter(m => {
        const name = (m.name || '').toLowerCase();
        const searchStr = (search || '').toLowerCase();
        return name.includes(searchStr);
    });

    return (
        <AppLayout navigation={navigation} title="Modules">
            <View style={styles.container}>
                {/* Header Section */}
                <View style={styles.pageHeader}>
                    <View>
                        <Text style={styles.title}>Modules</Text>
                        <Text style={styles.subtitle}>Build and manage dynamic data modules</Text>
                    </View>
                </View>

                {/* Controls Header (Matching Assets page) */}
                <View style={styles.controlsHeader}>
                    <View style={styles.searchWrapper}>
                        <MaterialCommunityIcons name="magnify" size={20} color="#64748b" style={styles.searchIcon} />
                        <TextInput
                            placeholder="Search modules..."
                            value={search}
                            onChangeText={setSearch}
                            style={styles.searchInput}
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddModule}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="plus" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.addButtonText}>Add Module</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#3b82f6" />
                    </View>
                ) : filteredModules.length === 0 ? (
                    /* Empty State UI */
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconCircle}>
                            <MaterialCommunityIcons name="layers-off-outline" size={48} color="#94a3b8" />
                        </View>
                        <Text style={styles.emptyTitle}>No modules found</Text>
                        <Text style={styles.emptySubtitle}>
                            {search
                                ? `No results matching "${search}"`
                                : "Click + Add Module to create one."}
                        </Text>
                        {search.length > 0 && (
                            <Button mode="text" onPress={() => setSearch('')} textColor="#3b82f6">
                                Clear Search
                            </Button>
                        )}
                    </View>
                ) : (
                    /* Module List Section (Table like style) */
                    <Card style={styles.tableCard}>
                        <DataTable>
                            <DataTable.Header style={styles.tableHeader}>
                                <DataTable.Title textStyle={[styles.headerText, { flex: 2 }]}>Module Name</DataTable.Title>
                                <DataTable.Title numeric textStyle={styles.headerText}>Sections</DataTable.Title>
                                <DataTable.Title numeric textStyle={styles.headerText}>Fields</DataTable.Title>
                                <DataTable.Title numeric textStyle={styles.headerText}>Actions</DataTable.Title>
                            </DataTable.Header>

                            <ScrollView style={{ maxHeight: 'calc(100vh - 350px)' }}>
                                {filteredModules.map((item) => (
                                    <DataTable.Row key={item.id} style={styles.row}>
                                        <DataTable.Cell style={{ flex: 2 }}>
                                            <View style={styles.nameCell}>
                                                <View style={styles.iconBox}>
                                                    <MaterialCommunityIcons name="layers-outline" size={18} color="#3b82f6" />
                                                </View>
                                                <Text style={styles.moduleName}>{item.name}</Text>
                                            </View>
                                        </DataTable.Cell>

                                        <DataTable.Cell numeric>
                                            <Text style={styles.cellText}>{item.section_count || 0}</Text>
                                        </DataTable.Cell>
                                        <DataTable.Cell numeric>
                                            <Text style={styles.cellText}>{item.field_count || 0}</Text>
                                        </DataTable.Cell>

                                        <DataTable.Cell numeric>
                                            <View style={styles.actionButtons}>
                                                <IconButton
                                                    icon="eye-outline"
                                                    size={20}
                                                    iconColor="#64748b"
                                                    onPress={() => handleViewModule(item)}
                                                />
                                            </View>
                                        </DataTable.Cell>
                                    </DataTable.Row>
                                ))}
                            </ScrollView>
                        </DataTable>
                    </Card>
                )}

                <ModuleFormModal
                    visible={modalVisible}
                    onClose={() => {
                        setModalVisible(false);
                        setInitialSection(null);
                    }}
                    onSave={handleSaveModule}
                    module={editingModule}
                    viewOnly={viewOnly}
                    initialSection={initialSection}
                />

                {/* Premium View Details Modal */}
                <Portal>
                    <Modal
                        visible={viewDetailsVisible}
                        onDismiss={() => setViewDetailsVisible(false)}
                        contentContainerStyle={styles.detailModal}
                    >
                        <View style={styles.detailCard}>
                            <View style={styles.detailHeader}>
                                <View style={styles.detailIconCircle}>
                                    <MaterialCommunityIcons name="information" size={28} color="#6366f1" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.detailTitle}>Module Details</Text>
                                    <Text style={styles.detailSubtitle}>Detailed information about this module</Text>
                                </View>
                                <IconButton
                                    icon="close"
                                    onPress={() => setViewDetailsVisible(false)}
                                    size={20}
                                    color="#64748b"
                                />
                            </View>

                            <View style={styles.detailContent}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>MODULE NAME</Text>
                                    <View style={styles.detailValueWrapper}>
                                        <MaterialCommunityIcons name="layers" size={16} color="#6366f1" style={{ marginRight: 8 }} />
                                        <Text style={styles.detailValue}>{selectedModule?.name}</Text>
                                    </View>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>SECTIONS</Text>
                                    {detailsLoading ? (
                                        <ActivityIndicator size="small" color="#6366f1" style={{ marginTop: 20 }} />
                                    ) : moduleStructure.length > 0 ? (
                                        <View style={styles.sectionsGrid}>
                                            {moduleStructure.map((sec, idx) => (
                                                <TouchableOpacity
                                                    key={idx}
                                                    style={styles.sectionGridItem}
                                                    onPress={() => handleEditSectionFromDetails(sec.name)}
                                                    activeOpacity={0.7}
                                                >
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                                        <MaterialCommunityIcons name="view-dashboard-outline" size={18} color="#6366f1" style={{ marginRight: 10 }} />
                                                        <Text style={styles.sectionText} numberOfLines={1}>{sec.name}</Text>
                                                    </View>
                                                    <MaterialCommunityIcons name="pencil-outline" size={16} color="#6366f1" style={{ opacity: 0.5 }} />
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    ) : (
                                        <Text style={styles.emptySmallText}>No structure defined for this module.</Text>
                                    )}
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>CREATION DATE</Text>
                                    <Text style={styles.detailValue}>
                                        {selectedModule?.created_at ? new Date(selectedModule.created_at).toLocaleDateString() : '1/30/2026'}
                                    </Text>
                                </View>

                                <View style={styles.sectionDivider} />

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>FIELDS SUMMARY</Text>
                                    <Text style={styles.detailValue}>
                                        {selectedModule?.field_count || 0} Dynamic fields configured
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.detailFooter}>
                                <Button
                                    mode="contained"
                                    onPress={() => setViewDetailsVisible(false)}
                                    style={styles.detailCloseBtn}
                                    labelStyle={styles.detailCloseBtnText}
                                >
                                    Close Details
                                </Button>
                            </View>
                        </View>
                    </Modal>
                </Portal>
            </View>
        </AppLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        padding: 24,
    },
    pageHeader: {
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
    controlsHeader: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 16,
    },
    searchWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingHorizontal: 16,
        height: 48,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#1e293b',
        outlineStyle: 'none',
        height: '100%',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3b82f6',
        paddingHorizontal: 20,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    addButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    tableCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        elevation: 0,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        overflow: 'hidden',
        shadowColor: "#64748b",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
    },
    tableHeader: {
        backgroundColor: '#f8fafc',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748b',
        textTransform: 'uppercase',
    },
    row: {
        borderBottomColor: '#f1f5f9',
        height: 64,
    },
    nameCell: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    moduleName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    cellText: {
        fontSize: 13,
        color: '#475569',
    },
    statusChip: {
        height: 24,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionNameButton: {
        backgroundColor: '#eff6ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#bfdbfe',
        minWidth: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionNameButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#3b82f6',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        maxWidth: 300,
        marginBottom: 24,
    },
    detailModal: {
        backgroundColor: 'transparent',
        padding: 20,
        width: '100%',
        maxWidth: 800,
        alignSelf: 'center',
    },
    detailCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#f8fafc',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    detailIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#eef2ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    detailTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
    },
    detailSubtitle: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
    },
    closeBtn: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    detailContent: {
        padding: 24,
        gap: 20,
    },
    detailRow: {
        gap: 6,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailValueWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailValue: {
        fontSize: 15,
        color: '#475569',
        fontWeight: '500',
    },
    sectionsGrid: {
        marginTop: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    sectionGridItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        width: 'calc(50% - 6px)',
    },
    sectionText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
    },
    sectionDivider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginVertical: 4,
    },
    fieldTagsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    fieldMiniTag: {
        fontSize: 11,
        color: '#64748b',
        backgroundColor: '#ffffff',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: '#e2e8f0',
    },
    emptySmallText: {
        fontSize: 13,
        color: '#94a3b8',
        fontStyle: 'italic',
    },
    detailFooter: {
        padding: 24,
        paddingTop: 0,
    },
    detailCloseBtn: {
        borderRadius: 12,
        paddingVertical: 4,
        backgroundColor: '#6366f1',
    },
    detailCloseBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: 'white',
    },
});

export default ModulesHomeScreen;
