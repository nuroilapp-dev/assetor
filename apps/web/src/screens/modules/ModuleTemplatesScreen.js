import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import {
    Text, Button, Card, TextInput, IconButton,
    ActivityIndicator, Snackbar, Chip, Switch, Divider,
    DataTable, Menu
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../api/client';

const FIELD_TYPES = [
    { label: 'Text', value: 'TEXT' },
    { label: 'Number', value: 'NUMBER' },
    { label: 'Textarea', value: 'TEXTAREA' },
    { label: 'Date', value: 'DATE' },
    { label: 'Dropdown', value: 'SELECT' },
    { label: 'Radio', value: 'RADIO' },
    { label: 'Checkbox', value: 'CHECKBOX' }
];

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- New Configuration Form (Standalone) ---
export const NewConfigurationForm = ({ onDismiss, moduleMaster, masterLoading, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [moduleMenu, setModuleMenu] = useState(false);
    const [formData, setFormData] = useState({
        module_id: null,
        template_name: '',
        description: '',
        use_template_sections: true
    });

    const selectedModule = (moduleMaster || []).find(m => m.module_id === formData.module_id);
    const selectedModuleLabel = selectedModule?.module_name || 'Select Module';

    const handleCreate = async () => {
        if (!formData.module_id) return Alert.alert('Error', 'Please select a module');
        if (!formData.template_name || formData.template_name.trim().length < 3) return Alert.alert('Error', 'Template name must be at least 3 characters');

        setLoading(true);
        try {
            const res = await api.post('/modules/configurations', formData);
            if (res.data.success) {
                if (onRefresh) onRefresh();
                if (onDismiss) onDismiss();
                // Reset form
                setFormData({ module_id: null, template_name: '', description: '', use_template_sections: true });
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', err.response?.data?.message || 'Failed to create configuration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.formContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle}>New Configuration</Text>
                    <Text style={styles.modalSubtitle}>Create a configuration template for a module</Text>
                </View>
                <IconButton
                    icon="close"
                    size={22}
                    iconColor="#64748b"
                    onPress={onDismiss}
                    style={styles.closeBtn}
                />
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.modalGrid}>
                    <View style={styles.modalColumn}>
                        <Text style={styles.inputLabel}>Module</Text>
                        <Menu
                            visible={moduleMenu}
                            onDismiss={() => setModuleMenu(false)}
                            anchor={
                                <Button
                                    mode="outlined"
                                    onPress={() => setModuleMenu(true)}
                                    contentStyle={styles.dropdownBtnInternal}
                                    icon={masterLoading ? undefined : "chevron-down"}
                                    loading={masterLoading}
                                    disabled={masterLoading}
                                    style={styles.modalInput}
                                    textColor={formData.module_id ? '#1e293b' : '#94a3b8'}
                                >
                                    {masterLoading ? 'Loading...' : selectedModuleLabel}
                                </Button>
                            }
                        >
                            {moduleMaster?.map(m => (
                                <Menu.Item
                                    key={m.module_id}
                                    onPress={() => {
                                        setFormData({ ...formData, module_id: m.module_id, template_name: `${m.module_name} Template` });
                                        setModuleMenu(false);
                                    }}
                                    title={m.module_name}
                                />
                            ))}
                        </Menu>
                    </View>

                    <View style={styles.modalColumn}>
                        <Text style={styles.inputLabel}>Template Name</Text>
                        <TextInput
                            mode="outlined"
                            value={formData.template_name}
                            onChangeText={t => setFormData({ ...formData, template_name: t })}
                            placeholder="e.g., Premises Template"
                            style={styles.modalInput}
                            outlineStyle={styles.inputOutline}
                            dense
                        />
                    </View>
                </View>

                <View style={{ marginTop: 20 }}>
                    <Text style={styles.inputLabel}>Details / Notes</Text>
                    <TextInput
                        mode="outlined"
                        value={formData.description}
                        onChangeText={t => setFormData({ ...formData, description: t })}
                        placeholder="Short description shown in the Details column"
                        multiline
                        numberOfLines={3}
                        style={[styles.modalInput, { height: 100 }]}
                        outlineStyle={styles.inputOutline}
                    />
                </View>

                <View style={styles.toggleRow}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={styles.toggleLabel}>Use default template sections</Text>
                        <Text style={styles.toggleHelper}>If enabled, auto-create standard heads/subheads/fields for this module.</Text>
                    </View>
                    <Switch
                        value={formData.use_template_sections}
                        onValueChange={v => setFormData({ ...formData, use_template_sections: v })}
                        color="#3b82f6"
                    />
                </View>
            </ScrollView>

            <View style={styles.modalFooter}>
                <Button
                    mode="text"
                    onPress={onDismiss}
                    textColor="#64748b"
                    style={{ marginRight: 8 }}
                >
                    Cancel
                </Button>
                <Button
                    mode="contained"
                    onPress={handleCreate}
                    loading={loading}
                    disabled={loading}
                    style={styles.createBtn}
                    contentStyle={{ height: 44 }}
                >
                    Create Configuration
                </Button>
            </View>
        </View>
    );
};

// --- Sub-components for Editor ---

const SubheadRow = ({ subhead, onChange, onRemove }) => {
    const [typeMenu, setTypeMenu] = useState(false);
    const update = (key, val) => onChange({ ...subhead, [key]: val });
    const showOptions = ['SELECT', 'RADIO', 'CHECKBOX'].includes(subhead.field_type);
    const optionsString = (subhead.options || []).map(o => o.option_label).join(', ');

    const handleOptionsChange = (text) => {
        const opts = text.split(',').map((val, idx) => ({
            id: generateId(),
            option_label: val.trim(),
            option_value: val.trim().toUpperCase().replace(/\s+/g, '_'),
            option_order: idx + 1
        })).filter(o => o.option_label !== '');
        update('options', opts);
    };

    return (
        <View style={styles.subheadContainer}>
            <View style={styles.subheadHeader}>
                <View style={{ flex: 2, marginRight: 8 }}>
                    <TextInput
                        label="Subhead Title"
                        mode="outlined" dense
                        value={subhead.subhead_title}
                        onChangeText={t => update('subhead_title', t)}
                        placeholder="e.g., Total Area (sqm)"
                    />
                </View>
                <View style={{ flex: 1.5, marginRight: 8 }}>
                    <Menu
                        visible={typeMenu}
                        onDismiss={() => setTypeMenu(false)}
                        anchor={
                            <Button mode="outlined" onPress={() => setTypeMenu(true)} contentStyle={{ height: 40 }} icon="chevron-down">
                                {FIELD_TYPES.find(f => f.value === subhead.field_type)?.label || subhead.field_type}
                            </Button>
                        }
                    >
                        {FIELD_TYPES.map(t => (
                            <Menu.Item key={t.value} onPress={() => { update('field_type', t.value); setTypeMenu(false); }} title={t.label} />
                        ))}
                    </Menu>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
                    <Text style={{ fontSize: 10, marginRight: 4 }}>Required</Text>
                    <Switch value={!!subhead.is_required} onValueChange={v => update('is_required', v)} color="#3b82f6" />
                </View>
                <IconButton icon="close-circle-outline" iconColor="#ef4444" size={20} onPress={onRemove} />
            </View>
            {subhead.field_type === 'TEXT' && (
                <TextInput
                    label="Placeholder"
                    mode="outlined" dense
                    value={subhead.placeholder || ''}
                    onChangeText={t => update('placeholder', t)}
                    style={{ marginTop: 8 }}
                    placeholder="Enter help text for user"
                />
            )}
            {showOptions && (
                <TextInput
                    label="Options (Comma separated)"
                    mode="outlined"
                    multiline
                    numberOfLines={2}
                    value={optionsString}
                    onChangeText={handleOptionsChange}
                    style={{ marginTop: 8 }}
                    placeholder="e.g., Ground Level, Dock Leveler"
                />
            )}
        </View>
    );
};

const HeadCard = ({ head, onChange, onRemove }) => {
    const update = (key, val) => onChange({ ...head, [key]: val });
    const addSubhead = () => {
        const newSub = { id: generateId(), subhead_title: '', field_type: 'TEXT', is_required: false, subhead_order: (head.subheads?.length || 0) + 1, options: [] };
        update('subheads', [...(head.subheads || []), newSub]);
    };
    return (
        <Card style={styles.headCard}>
            <Card.Content>
                <View style={styles.rowBetween}>
                    <TextInput
                        label="Head Title"
                        mode="outlined"
                        value={head.head_title}
                        onChangeText={t => update('head_title', t)}
                        style={{ flex: 1, marginRight: 16 }}
                        placeholder="e.g., Facility Specifications"
                    />
                    <Button icon="delete-outline" textColor="#ef4444" onPress={onRemove}>Remove Head</Button>
                </View>
                {head.subheads?.map((sub, idx) => (
                    <SubheadRow key={sub.id || idx} subhead={sub}
                        onChange={(newS) => { const newSubs = [...head.subheads]; newSubs[idx] = newS; update('subheads', newSubs); }}
                        onRemove={() => { const newSubs = head.subheads.filter((_, i) => i !== idx); update('subheads', newSubs); }}
                    />
                ))}
                <Button mode="outlined" icon="plus" onPress={addSubhead} style={{ marginTop: 16, alignSelf: 'flex-start' }} compact>Add Subhead</Button>
            </Card.Content>
        </Card>
    );
};

// --- Module Templates Content (Standalone) ---
export const ModuleTemplatesContent = ({ onClose, onAddNew, moduleMaster, onRefresh }) => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('LIST'); // LIST | EDIT
    const [formData, setFormData] = useState({ id: null, module_id: null, template_name: '', heads: [] });
    const [alert, setAlert] = useState({ visible: false, message: '', type: 'success' });

    useEffect(() => {
        fetchTemplates();
    }, [onRefresh]);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await api.get('/modules/templates');
            setTemplates(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (id) => {
        setLoading(true);
        try {
            const res = await api.get(`/modules/templates/${id}`);
            setFormData(res.data.data);
            setViewMode('EDIT');
        } catch (err) {
            setAlert({ visible: true, message: 'Failed to load template', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this template?')) return;
        try {
            await api.delete(`/modules/templates/${id}`);
            fetchTemplates();
            setAlert({ visible: true, message: 'Deleted successfully', type: 'success' });
        } catch (err) {
            setAlert({ visible: true, message: 'Delete failed', type: 'error' });
        }
    };

    const handleSaveEdit = async () => {
        if (!formData.module_id) return setAlert({ visible: true, message: 'Select a module', type: 'error' });
        if (formData.heads.length === 0) return setAlert({ visible: true, message: 'Add at least one head', type: 'error' });

        setLoading(true);
        try {
            await api.put(`/modules/templates/${formData.id}`, formData);
            fetchTemplates();
            setViewMode('LIST');
            setAlert({ visible: true, message: 'Updated successfully', type: 'success' });
        } catch (err) {
            setAlert({ visible: true, message: err.response?.data?.message || 'Update failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const addHead = () => {
        setFormData({ ...formData, heads: [...formData.heads, { id: generateId(), head_title: '', head_order: formData.heads.length + 1, subheads: [] }] });
    };

    if (viewMode === 'LIST') {
        return (
            <View style={styles.listContainer}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Module</Text>
                        <Text style={styles.subtitle}>Build and manage dynamic data modules</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <Button mode="contained" icon="plus" onPress={onAddNew} style={styles.newConfigBtn}>New Configuration</Button>
                        {onClose && <IconButton icon="close" size={24} iconColor="#64748b" onPress={onClose} style={{ marginRight: -8 }} />}
                    </View>
                </View>

                <View style={styles.tableWrapper}>
                    {loading ? (
                        <View style={styles.loadingArea}><ActivityIndicator color="#3b82f6" /><Text style={{ marginTop: 12, color: '#64748b' }}>Loading...</Text></View>
                    ) : (
                        <ScrollView style={styles.tableScroll} showsVerticalScrollIndicator={true}>
                            <DataTable style={styles.table}>
                                <DataTable.Header style={styles.tableHeader}>
                                    <DataTable.Title textStyle={styles.tableHeaderText}>Template Name</DataTable.Title>
                                    <DataTable.Title textStyle={styles.tableHeaderText}>Module</DataTable.Title>
                                    <DataTable.Title numeric textStyle={styles.tableHeaderText}>Details</DataTable.Title>
                                    <DataTable.Title numeric textStyle={styles.tableHeaderText}>Actions</DataTable.Title>
                                </DataTable.Header>
                                {templates.map(t => (
                                    <DataTable.Row key={t.id} style={styles.tableRow}>
                                        <DataTable.Cell><Text style={styles.templateNameText}>{t.template_name || '(No Name)'}</Text></DataTable.Cell>
                                        <DataTable.Cell style={{ flex: 0.8 }}><Chip compact style={styles.moduleChip} textStyle={{ fontSize: 10, color: '#3b82f6' }}>{t.module_name}</Chip></DataTable.Cell>
                                        <DataTable.Cell numeric><Text style={styles.countsText}>{t.head_count} H, {t.subhead_count} S</Text></DataTable.Cell>
                                        <DataTable.Cell numeric>
                                            <View style={{ flexDirection: 'row' }}>
                                                <IconButton icon="pencil-outline" size={18} iconColor="#64748b" onPress={() => handleEdit(t.id)} />
                                                <IconButton icon="trash-can-outline" size={18} iconColor="#ef4444" onPress={() => handleDelete(t.id)} />
                                            </View>
                                        </DataTable.Cell>
                                    </DataTable.Row>
                                ))}
                                {templates.length === 0 && (
                                    <View style={styles.noDataArea}><MaterialCommunityIcons name="layers-off-outline" size={48} color="#cbd5e1" /><Text style={styles.emptyText}>No configurations found.</Text></View>
                                )}
                            </DataTable>
                        </ScrollView>
                    )}
                </View>
                <Snackbar visible={alert.visible} onDismiss={() => setAlert({ ...alert, visible: false })} style={{ backgroundColor: alert.type === 'error' ? '#ef4444' : '#22c55e' }}>{alert.message}</Snackbar>
            </View>
        );
    }

    const selectedModule = (moduleMaster || []).find(m => m.module_id === formData.module_id);
    const selectedModuleLabel = selectedModule?.module_name || 'Select Module';

    return (
        <View style={styles.listContainer}>
            <View style={styles.header}>
                <IconButton icon="arrow-left" onPress={() => setViewMode('LIST')} />
                <Text style={styles.title}>Edit Module</Text>
                <View style={{ flex: 1 }} />
                <Button onPress={() => setViewMode('LIST')}>Cancel</Button>
                <Button mode="contained" icon="content-save-outline" onPress={handleSaveEdit} loading={loading}>Save Changes</Button>
            </View>
            <ScrollView contentContainerStyle={styles.editorContent} showsVerticalScrollIndicator={false}>
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <View style={styles.rowBetween}>
                            <View style={{ flex: 1, marginRight: 16 }}><TextInput label="Module" value={selectedModuleLabel} disabled mode="outlined" dense /></View>
                            <View style={{ flex: 2 }}><TextInput label="Template Name" mode="outlined" value={formData.template_name} onChangeText={t => setFormData({ ...formData, template_name: t })} dense /></View>
                        </View>
                        <Button mode="contained-tonal" icon="plus" onPress={addHead} style={{ marginTop: 24, alignSelf: 'flex-start' }} compact>Add Head</Button>
                    </Card.Content>
                </Card>
                {formData.heads.map((head, idx) => (
                    <HeadCard key={head.id || idx} head={head}
                        onChange={(newHead) => { const newHeads = [...formData.heads]; newHeads[idx] = newHead; setFormData({ ...formData, heads: newHeads }); }}
                        onRemove={() => { const newHeads = formData.heads.filter((_, i) => i !== idx); setFormData({ ...formData, heads: newHeads }); }}
                    />
                ))}
            </ScrollView>
            <Snackbar visible={alert.visible} onDismiss={() => setAlert({ ...alert, visible: false })} style={{ backgroundColor: alert.type === 'error' ? '#ef4444' : '#22c55e' }}>{alert.message}</Snackbar>
        </View>
    );
};

const ModuleTemplatesScreen = ({ navigation }) => {
    return (
        <View style={{ flex: 1, padding: 20 }}>
            <ModuleTemplatesContent onClose={() => navigation.goBack()} onAddNew={() => { }} />
        </View>
    );
};

const styles = StyleSheet.create({
    listContainer: { flex: 1, backgroundColor: 'white', padding: 24, borderRadius: 22 },
    formContainer: { backgroundColor: 'white', padding: 24, borderRadius: 22 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    headerActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
    subtitle: { fontSize: 14, color: '#64748b', marginTop: 2 },
    newConfigBtn: { borderRadius: 10, height: 40 },
    tableWrapper: { maxHeight: 450, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff' },
    tableScroll: { flex: 1 },
    table: { minWidth: 600 },
    tableHeader: { backgroundColor: '#f8fafc' },
    tableHeaderText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
    tableRow: { borderBottomColor: '#f1f5f9', height: 60 },
    templateNameText: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
    moduleChip: { height: 24, backgroundColor: '#eff6ff' },
    countsText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
    loadingArea: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    noDataArea: { padding: 60, alignItems: 'center', justifyContent: 'center' },
    emptyText: { textAlign: 'center', color: '#94a3b8', fontSize: 14, marginTop: 12 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
    modalSubtitle: { fontSize: 14, color: '#64748b', marginTop: 2 },
    closeBtn: { margin: 0, marginTop: -4, marginRight: -4 },
    modalBody: { flex: 1 },
    modalGrid: { flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: 20 },
    modalColumn: { flex: 1 },
    inputLabel: { fontSize: 12, fontWeight: '700', color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    modalInput: { backgroundColor: 'white' },
    inputOutline: { borderRadius: 10, borderColor: '#e2e8f0' },
    dropdownBtnInternal: { height: 48, justifyContent: 'space-between', flexDirection: 'row-reverse', paddingHorizontal: 4 },
    toggleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, padding: 16, backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9' },
    toggleLabel: { fontSize: 14, fontWeight: '700', color: '#334155' },
    toggleHelper: { fontSize: 12, color: '#64748b', marginTop: 2 },
    modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    createBtn: { borderRadius: 10, paddingHorizontal: 8 },
    editorContent: { paddingBottom: 40 },
    sectionCard: { marginBottom: 16, backgroundColor: 'white', borderRadius: 12, elevation: 2 },
    headCard: { marginBottom: 16, backgroundColor: 'white', borderLeftWidth: 4, borderLeftColor: '#3b82f6', borderRadius: 12, elevation: 2 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    subheadContainer: { marginTop: 12, padding: 12, backgroundColor: '#fdfdfd', borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9' },
    subheadHeader: { flexDirection: 'row', alignItems: 'center' },
});

export default ModuleTemplatesScreen;
