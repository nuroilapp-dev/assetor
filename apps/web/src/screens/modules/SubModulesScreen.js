import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import AppLayout from '../../components/AppLayout';
import { Card, Title, Button, Portal, Modal, ActivityIndicator, Checkbox, DataTable } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../api/client';
import AlertDialog from '../../components/AlertDialog';

const SubModulesScreen = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);

    // Data Loading
    const [loadingData, setLoadingData] = useState(false);
    const [modules, setModules] = useState([]);
    const [countries, setCountries] = useState([]);
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [areas, setAreas] = useState([]);
    const [types, setTypes] = useState([]);

    // List State
    const [companyModules, setCompanyModules] = useState([]);
    const [loadingList, setLoadingList] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [filterModule, setFilterModule] = useState(null);

    // Form State
    const [selectedModule, setSelectedModule] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedPropertyType, setSelectedPropertyType] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedArea, setSelectedArea] = useState(null);
    const [status, setStatus] = useState(true);

    // Structure Data
    const [moduleSections, setModuleSections] = useState([]);
    const [loadingSections, setLoadingSections] = useState(false);
    const [sectionFields, setSectionFields] = useState({});
    const [expandedSectionId, setExpandedSectionId] = useState(null);
    const [loadingFields, setLoadingFields] = useState(false);
    const [selectedFields, setSelectedFields] = useState({});

    // Dropdown UI State
    const [dropdownOpen, setDropdownOpen] = useState(null);

    // Pagination State
    const [page, setPage] = useState(0);
    const itemsPerPage = 7;

    // Alert Dialog State
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'info' });

    const handleOpenModal = () => {
        setEditingId(null);
        setSelectedModule(null);
        setSelectedCountry(null);
        setSelectedPropertyType(null);
        setSelectedType(null);
        setSelectedArea(null);
        setStatus(true);
        setModuleSections([]);
        setSectionFields({});
        setExpandedSectionId(null);
        setSelectedFields({});
        setModalVisible(true);
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        const mod = modules.find(m => m.module_id === item.module_id || m.id === item.module_id);
        const country = countries.find(c => c.id === item.country_id);
        const propType = propertyTypes.find(pt => pt.id === item.property_type_id);
        const type = types.find(t => t.id === item.premises_type_id);
        const area = areas.find(a => a.id === item.area_id);
        setSelectedModule(mod || null);
        setSelectedCountry(country || null);
        setSelectedPropertyType(propType || null);
        setSelectedType(type || null);
        setSelectedArea(area || null);
        setStatus(item.is_active === 1 || item.status === 'ACTIVE');

        // Populate selected fields from item.selected_fields
        const fieldsState = {};
        let fieldsArray = [];

        if (item.selected_fields) {
            if (Array.isArray(item.selected_fields)) {
                fieldsArray = item.selected_fields;
            } else if (typeof item.selected_fields === 'string') {
                fieldsArray = item.selected_fields.split(',').map(Number);
            }
        }

        fieldsArray.forEach(fid => {
            fieldsState[fid] = true;
        });

        // Debugging Alert
        // alert(`Debug Edit:\nLoaded Count: ${Object.keys(fieldsState).length}\nIDs: ${JSON.stringify(Object.keys(fieldsState))}`);

        setSelectedFields(fieldsState);

        setModalVisible(true);
    };

    useEffect(() => {
        fetchInitialData();
        fetchCompanyModules();
    }, []);

    useEffect(() => {
        if (!modalVisible) {
            fetchCompanyModules();
        }
    }, [modalVisible]);

    const fetchCompanyModules = async () => {
        setLoadingList(true);
        try {
            const res = await api.get('company-modules');
            if (res.data.success) {
                setCompanyModules(res.data.data);
            }
        } catch (error) {
            console.error('Fetch company modules error:', error);
        } finally {
            setLoadingList(false);
        }
    };

    const fetchInitialData = async () => {
        try {
            setLoadingData(true);
            const [modRes, countriesRes, propRes, areasRes, typesRes] = await Promise.all([
                api.get('module-master'),
                api.get('countries'),
                api.get('property-types'),
                api.get('areas'),
                api.get('premises-types')
            ]);
            if (modRes.data.success) setModules(modRes.data.data);
            if (countriesRes.data.success) setCountries(countriesRes.data.data);
            if (propRes.data.success) setPropertyTypes(propRes.data.data);
            if (areasRes.data.success) setAreas(areasRes.data.data);
            if (typesRes.data.success) setTypes(typesRes.data.data);
        } catch (error) {
            console.error('Fetch data error:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const fetchSections = async (moduleId) => {
        try {
            setLoadingSections(true);
            setExpandedSectionId(null);
            const res = await api.get(`module-builder/${moduleId}/sections`);
            if (res.data.success) {
                setModuleSections(res.data.data);
            }
        } catch (error) {
            console.error('Fetch sections error:', error);
            setModuleSections([]);
        } finally {
            setLoadingSections(false);
        }
    };

    const handleSectionPress = async (sectionId) => {
        if (expandedSectionId === sectionId) {
            setExpandedSectionId(null);
            return;
        }
        setExpandedSectionId(sectionId);
        if (!sectionFields[sectionId]) {
            try {
                setLoadingFields(true);
                const res = await api.get(`module-builder/fields?section_id=${sectionId}`);
                if (res.data.success) {
                    const fields = res.data.data;
                    setSectionFields(prev => ({ ...prev, [sectionId]: fields }));

                    // Merge new fields into selection state without overwriting existing selections
                    setSelectedFields(prev => {
                        const newState = { ...prev };
                        fields.forEach(f => {
                            if (newState[f.id] === undefined) {
                                newState[f.id] = false;
                            }
                        });
                        return newState;
                    });
                }
            } catch (error) {
                console.error('Fetch fields error:', error);
            } finally {
                setLoadingFields(false);
            }
        }
    };

    const toggleFieldSelection = (fieldId) => {
        const id = Number(fieldId);
        setSelectedFields(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleDropdown = (key) => {
        setDropdownOpen(dropdownOpen === key ? null : key);
    };

    const clearSelections = () => {
        setSelectedFields({});
        setAlertConfig({ visible: true, title: 'Cleared', message: 'All selections cleared.', type: 'info' });
    };

    const handleSave = async () => {
        if (!selectedModule) {
            setAlertConfig({ visible: true, title: 'Module Required', message: 'Please select a module first.', type: 'warning' });
            return;
        }
        try {
            // Extract selected field IDs from the boolean map
            const selectedFieldIds = Object.keys(selectedFields)
                .filter(id => selectedFields[id] === true)
                .map(Number);

            const payload = {
                module_id: selectedModule.module_id || selectedModule.id,
                country_id: selectedCountry?.id || null,
                property_type_id: selectedPropertyType?.id || null,
                premises_type_id: selectedType?.id || null,
                area_id: selectedArea?.id || null,
                is_active: status,
                status_id: status ? 1 : 2,
                selected_fields: selectedFieldIds
            };

            console.log('[SubModulesScreen] SUBMITTING PAYLOAD:', JSON.stringify(payload, null, 2));

            // Debugging Alert for User
            // alert(`Debug Save:\nCount: ${selectedFieldIds.length}\nIDs: ${JSON.stringify(selectedFieldIds)}`);

            let res;
            if (editingId) {
                res = await api.put(`company-modules/${editingId}`, payload);
            } else {
                res = await api.post('company-modules', payload);
            }
            if (res.data.success) {
                setAlertConfig({
                    visible: true,
                    title: 'Success',
                    message: editingId ? 'Module updated successfully!' : 'Module saved successfully!',
                    type: 'success'
                });
                setFilterModule(selectedModule);
                setModalVisible(false);
                fetchCompanyModules();
            } else {
                setAlertConfig({ visible: true, title: 'Error', message: 'Failed to save: ' + res.data.message, type: 'error' });
            }
        } catch (error) {
            console.error('Save error:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: error.response?.data?.message || error.message,
                type: 'error'
            });
        }
    };

    const renderDropdown = (label, placeholder, value, options, onSelect, key, labelKey = 'name') => {
        const isOpen = dropdownOpen === key;
        return (
            <View style={[styles.inputContainer, { zIndex: isOpen ? 10 : 1 }]}>
                <Text style={styles.inputLabel}>{label}</Text>
                <TouchableOpacity
                    style={[styles.dropdownTrigger, isOpen && styles.dropdownTriggerActive]}
                    onPress={() => toggleDropdown(key)}
                >
                    <Text style={[styles.dropdownText, !value && styles.placeholderText]} numberOfLines={1}>
                        {value ? value[labelKey] || value.label || value.name : placeholder}
                    </Text>
                    <MaterialCommunityIcons name="chevron-down" size={20} color="#64748b" />
                </TouchableOpacity>

                {isOpen && (
                    <View style={styles.dropdownList}>
                        {options.length === 0 ? (
                            <Text style={{ padding: 12, color: '#94a3b8' }}>No options</Text>
                        ) : (
                            <ScrollView style={{ maxHeight: 250 }} nestedScrollEnabled={true}>
                                {options.map((opt, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            onSelect(opt);
                                            setDropdownOpen(null);
                                        }}
                                    >
                                        <Text style={styles.dropdownItemText}>{opt[labelKey] || opt.label || opt.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                )}
            </View>
        );
    };

    useEffect(() => {
        if (selectedModule) {
            fetchSections(selectedModule.module_id || selectedModule.id);
        } else {
            setModuleSections([]);
            setSectionFields({});
            setExpandedSectionId(null);
        }

        // Only clear selected fields if we are NOT in edit mode
        // In edit mode (editingId is truthy), handleEdit has explicitly set the fields
        if (!editingId) {
            setSelectedFields({});
            setSectionFields({}); // Also clear section fields cache to force refresh
        }
    }, [selectedModule, editingId]);

    return (
        <AppLayout navigation={navigation} title="Submodules">
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <View>
                        <Title>Submodules</Title>
                        <Text style={styles.subtitle}>Manage sub-module definitions and configurations</Text>
                    </View>
                    <Button mode="contained" icon="plus" onPress={handleOpenModal} style={styles.addButton}>
                        Add Sub-module
                    </Button>
                </View>

                {/* Filter */}
                <View style={{ marginBottom: 16, zIndex: 50 }}>
                    {renderDropdown("Filter by Module", "Show all...", filterModule, modules, setFilterModule, 'filter', 'module_name')}
                    {filterModule && (
                        <TouchableOpacity onPress={() => setFilterModule(null)} style={{ position: 'absolute', right: 0, top: 0, padding: 8 }}>
                            <Text style={{ color: '#3b82f6', fontSize: 12 }}>Clear Filter</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <Card style={styles.card}>
                    <Card.Content style={{ padding: 0 }}>
                        {loadingList ? (
                            <ActivityIndicator size="large" color="#3b82f6" style={{ margin: 40 }} />
                        ) : (
                            <DataTable>
                                <DataTable.Header style={{ backgroundColor: '#6c7ae0', borderTopLeftRadius: 10, borderTopRightRadius: 10, height: 52 }}>
                                    <DataTable.Title style={{ flex: 1.5, justifyContent: 'flex-start' }} textStyle={{ color: 'white', fontWeight: 'bold' }}>Module Name</DataTable.Title>
                                    <DataTable.Title style={{ flex: 1.2, justifyContent: 'flex-start' }} textStyle={{ color: 'white', fontWeight: 'bold' }}>Country</DataTable.Title>
                                    <DataTable.Title style={{ flex: 1, justifyContent: 'flex-start' }} textStyle={{ color: 'white', fontWeight: 'bold' }}>Property</DataTable.Title>
                                    <DataTable.Title style={{ flex: 1, justifyContent: 'flex-start' }} textStyle={{ color: 'white', fontWeight: 'bold' }}>Premise Type</DataTable.Title>
                                    <DataTable.Title style={{ flex: 1.2, justifyContent: 'flex-start' }} textStyle={{ color: 'white', fontWeight: 'bold' }}>Area</DataTable.Title>
                                    <DataTable.Title style={{ flex: 0.8, justifyContent: 'flex-start' }} textStyle={{ color: 'white', fontWeight: 'bold' }}>Status</DataTable.Title>
                                    <DataTable.Title style={{ flex: 0.5, justifyContent: 'center' }} textStyle={{ color: 'white', fontWeight: 'bold' }}>Action</DataTable.Title>
                                </DataTable.Header>

                                {(() => {
                                    const filtered = companyModules.filter(m => !filterModule || (m.name === filterModule.module_name || m.module_name === filterModule.module_name));
                                    const totalItems = filtered.length;
                                    const paginated = filtered.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

                                    if (totalItems === 0) {
                                        return (
                                            <View style={{ padding: 40, alignItems: 'center' }}>
                                                <MaterialCommunityIcons name="alert-circle-outline" size={32} color="#94a3b8" />
                                                <Text style={{ color: '#94a3b8', marginTop: 12, fontSize: 15 }}>No configured sub-modules found.</Text>
                                            </View>
                                        );
                                    }

                                    return (
                                        <>
                                            <ScrollView style={{ maxHeight: 'calc(100vh - 460px)' }}>
                                                {paginated.map((item, index) => (
                                                    <DataTable.Row key={item.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f2f6ff' }}>
                                                        <DataTable.Cell style={{ flex: 1.5, paddingLeft: 16 }}>{item.name}</DataTable.Cell>
                                                        <DataTable.Cell style={{ flex: 1.2 }}>{item.country || '-'}</DataTable.Cell>
                                                        <DataTable.Cell style={{ flex: 1 }}>{item.property_type || '-'}</DataTable.Cell>
                                                        <DataTable.Cell style={{ flex: 1 }}>{item.premises_type || '-'}</DataTable.Cell>
                                                        <DataTable.Cell style={{ flex: 1.2 }}>{item.section_area || '-'}</DataTable.Cell>
                                                        <DataTable.Cell style={{ flex: 0.8 }}>
                                                            <View style={[styles.badge, item.status === 'ACTIVE' ? styles.badgeActive : styles.badgeInactive]}>
                                                                <Text style={[styles.badgeText, item.status === 'ACTIVE' ? styles.badgeTextActive : styles.badgeTextInactive]}>{item.status}</Text>
                                                            </View>
                                                        </DataTable.Cell>
                                                        <DataTable.Cell style={{ flex: 0.5, justifyContent: 'center' }}>
                                                            <TouchableOpacity onPress={() => handleEdit(item)}>
                                                                <MaterialCommunityIcons name="pencil" size={20} color="rgb(99, 102, 241)" />
                                                            </TouchableOpacity>
                                                        </DataTable.Cell>
                                                    </DataTable.Row>
                                                ))}
                                            </ScrollView>

                                            <View style={styles.paginationContainer}>
                                                <Text style={styles.paginationText}>
                                                    Showing {page * itemsPerPage + 1} to {Math.min((page + 1) * itemsPerPage, totalItems)} of {totalItems}
                                                </Text>
                                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                                    <TouchableOpacity
                                                        onPress={() => setPage(0)}
                                                        disabled={page === 0}
                                                        style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
                                                    >
                                                        <MaterialCommunityIcons name="chevron-double-left" size={20} color={page === 0 ? '#cbd5e1' : '#64748b'} />
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        onPress={() => setPage(Math.max(0, page - 1))}
                                                        disabled={page === 0}
                                                        style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
                                                    >
                                                        <MaterialCommunityIcons name="chevron-left" size={20} color={page === 0 ? '#cbd5e1' : '#64748b'} />
                                                    </TouchableOpacity>

                                                    <View style={[styles.pageBtn, styles.pageBtnActive]}>
                                                        <Text style={styles.pageBtnTextActive}>{page + 1}</Text>
                                                    </View>

                                                    <TouchableOpacity
                                                        onPress={() => setPage(Math.min(Math.ceil(totalItems / itemsPerPage) - 1, page + 1))}
                                                        disabled={page >= Math.ceil(totalItems / itemsPerPage) - 1}
                                                        style={[styles.pageBtn, page >= Math.ceil(totalItems / itemsPerPage) - 1 && styles.pageBtnDisabled]}
                                                    >
                                                        <MaterialCommunityIcons name="chevron-right" size={20} color={page >= Math.ceil(totalItems / itemsPerPage) - 1 ? '#cbd5e1' : '#64748b'} />
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        onPress={() => setPage(Math.ceil(totalItems / itemsPerPage) - 1)}
                                                        disabled={page >= Math.ceil(totalItems / itemsPerPage) - 1}
                                                        style={[styles.pageBtn, page >= Math.ceil(totalItems / itemsPerPage) - 1 && styles.pageBtnDisabled]}
                                                    >
                                                        <MaterialCommunityIcons name="chevron-double-right" size={20} color={page >= Math.ceil(totalItems / itemsPerPage) - 1 ? '#cbd5e1' : '#64748b'} />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </>
                                    );
                                })()}
                            </DataTable>
                        )}
                    </Card.Content>
                </Card>

                <Portal>
                    <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Title style={styles.modalTitle}>{editingId ? 'Edit Module' : 'Add Module'}</Title>
                                <Text style={styles.modalSubtitle}>Configure module and fields</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        if (selectedModule) fetchSections(selectedModule.module_id || selectedModule.id);
                                    }}
                                    style={{ marginRight: 16 }}
                                >
                                    <MaterialCommunityIcons name="refresh" size={24} color="#3b82f6" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.divider} />

                        {loadingData ? (
                            <ActivityIndicator size="large" color="#3b82f6" style={{ marginVertical: 40 }} />
                        ) : (
                            <>
                                <View style={[styles.row, { zIndex: dropdownOpen ? 1000 : 1 }]}>
                                    <View style={{ flex: 1.5, marginRight: 8 }}>{renderDropdown("Module Name", "Select...", selectedModule, modules, setSelectedModule, 'module', 'module_name')}</View>
                                    <View style={{ flex: 1.2, marginRight: 8 }}>{renderDropdown("Country", "Select...", selectedCountry, countries, setSelectedCountry, 'country', 'country_name')}</View>
                                    <View style={{ flex: 1, marginRight: 8 }}>{renderDropdown("Property Type", "Select...", selectedPropertyType, propertyTypes, setSelectedPropertyType, 'property', 'name')}</View>
                                    <View style={{ flex: 1, marginRight: 8 }}>{renderDropdown("Premise Type", "Select...", selectedType, types, setSelectedType, 'type', 'type_name')}</View>
                                    <View style={{ flex: 1.2, marginRight: 8 }}>{renderDropdown("Area", "Select Area...", selectedArea, areas, setSelectedArea, 'area')}</View>
                                    <View style={styles.statusContainer}>
                                        <Text style={styles.inputLabel}>Status</Text>
                                        <Switch value={status} onValueChange={setStatus} />
                                    </View>
                                </View>

                                <View style={styles.structureSection}>
                                    <Text style={styles.sectionLabel}>MODULE STRUCTURE</Text>
                                    {!selectedModule ? (
                                        <View style={styles.structureBox}><Text style={styles.structureTextPlaceholder}>Select a module first</Text></View>
                                    ) : loadingSections ? (
                                        <ActivityIndicator size="small" color="#3b82f6" />
                                    ) : (
                                        <View style={styles.structureListContainer}>
                                            <View style={styles.structureHeader}>
                                                <Text style={styles.structureHeaderText}>{(selectedModule.module_name || selectedModule.name)} Structure</Text>
                                                <View style={{ flex: 1 }} />
                                                <TouchableOpacity onPress={clearSelections}><Text style={{ color: '#ef4444', fontSize: 12 }}>Clear All</Text></TouchableOpacity>
                                            </View>
                                            <ScrollView style={{ height: 240 }} nestedScrollEnabled={true}>
                                                {moduleSections.length === 0 ? (
                                                    <View style={{ padding: 40, alignItems: 'center' }}>
                                                        <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#94a3b8" />
                                                        <Text style={{ color: '#94a3b8', marginTop: 8 }}>No sections found for this module.</Text>
                                                    </View>
                                                ) : moduleSections.map((section) => {
                                                    const isExpanded = expandedSectionId === section.id;
                                                    const fields = sectionFields[section.id] || [];
                                                    return (
                                                        <View key={section.id} style={styles.accordionContainer}>
                                                            <TouchableOpacity style={styles.accordionHeader} onPress={() => handleSectionPress(section.id)}>
                                                                <Text style={styles.accordionTitle}>{section.name}</Text>
                                                                <MaterialCommunityIcons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} />
                                                            </TouchableOpacity>
                                                            {isExpanded && (
                                                                <View style={styles.accordionContent}>
                                                                    {fields.map(field => (
                                                                        <TouchableOpacity key={field.id} style={styles.fieldItem} onPress={() => toggleFieldSelection(field.id)}>
                                                                            <Checkbox.Android status={selectedFields[field.id] ? 'checked' : 'unchecked'} color="#3b82f6" />
                                                                            <Text>{field.label}</Text>
                                                                        </TouchableOpacity>
                                                                    ))}
                                                                </View>
                                                            )}
                                                        </View>
                                                    );
                                                })}
                                            </ScrollView>
                                        </View>
                                    )}
                                </View>
                            </>
                        )}
                        <View style={styles.modalFooter}>
                            <Button mode="outlined" onPress={() => setModalVisible(false)} style={{ marginRight: 12 }}>Cancel</Button>
                            <Button mode="contained" onPress={handleSave}>Save</Button>
                        </View>
                    </Modal>

                    <AlertDialog
                        visible={alertConfig.visible}
                        onDismiss={() => setAlertConfig({ ...alertConfig, visible: false })}
                        title={alertConfig.title}
                        message={alertConfig.message}
                        type={alertConfig.type}
                    />
                </Portal>
            </View>
        </AppLayout>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    subtitle: { fontSize: 14, color: '#64748b' },
    addButton: { backgroundColor: '#3b82f6' },
    card: { backgroundColor: 'white', borderRadius: 8 },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    badgeActive: { backgroundColor: '#dcfce7' },
    badgeInactive: { backgroundColor: '#f1f5f9' },
    badgeText: { fontSize: 11, fontWeight: '700' },
    badgeTextActive: { color: '#166534' },
    badgeTextInactive: { color: '#64748b' },
    modalContent: { backgroundColor: 'white', padding: 32, borderRadius: 12, width: '90%', maxWidth: 1000, alignSelf: 'center' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    modalSubtitle: { fontSize: 13, color: '#64748b' },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 20 },
    row: { flexDirection: 'row', alignItems: 'center' },
    inputContainer: { flex: 1 },
    inputLabel: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
    dropdownTrigger: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8 },
    dropdownTriggerActive: { borderColor: '#3b82f6' },
    dropdownText: { fontSize: 14 },
    placeholderText: { color: '#94a3b8' },
    dropdownList: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        marginTop: 4,
        zIndex: 9999,
        elevation: 5,
        // Web shadow support
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    statusContainer: { marginLeft: 16 },
    structureSection: { marginTop: 20 },
    sectionLabel: { fontSize: 11, fontWeight: '700', color: '#94a3b8', marginBottom: 10 },
    structureBox: { padding: 16, backgroundColor: '#f8fafc', borderRadius: 8 },
    structureListContainer: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8 },
    structureHeader: { flexDirection: 'row', padding: 12, backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    accordionContainer: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 12 },
    accordionTitle: { fontWeight: '600' },
    accordionContent: { paddingLeft: 20, paddingBottom: 10 },
    fieldItem: { flexDirection: 'row', alignItems: 'center' },
    modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }
});

export default SubModulesScreen;
