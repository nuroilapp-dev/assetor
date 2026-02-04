import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, useWindowDimensions, Platform, KeyboardAvoidingView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SECTIONS = [
    { id: 'identity', label: 'Premises Identity', icon: 'card-account-details-outline' },
    { id: 'address', label: 'Address & Location', icon: 'map-marker-outline' },
    { id: 'specs', label: 'Facility Specifications', icon: 'floor-plan' },
    { id: 'legal', label: 'Ownership / Legal', icon: 'file-certificate-outline' },
    { id: 'regulatory', label: 'Zone & Regulatory', icon: 'shield-check-outline' },
    { id: 'utilities', label: 'Utilities & Services', icon: 'lightning-bolt-outline' },
    { id: 'costing', label: 'Costing & Budget', icon: 'cash-multiple' },
    { id: 'people', label: 'People & Access', icon: 'account-group-outline' },
    { id: 'safety', label: 'Safety & Risk', icon: 'alert-outline' },
    { id: 'warehouse', label: 'Warehouse Ops', icon: 'warehouse' },
    { id: 'documents', label: 'Documents', icon: 'file-document-multiple-outline' },
    { id: 'assets', label: 'Linked Assets', icon: 'link-variant' },
];

const PremisesMasterModal = ({ visible, onClose, premiseId = null, onSave }) => {
    const { width, height } = useWindowDimensions();
    const isDesktop = width >= 1024;

    // UI State
    const [activeSection, setActiveSection] = useState('identity');
    const [step, setStep] = useState(1); // 1: Select Ownership, 2: Form

    // Form Data
    const [formData, setFormData] = useState({
        premise_type: 'Office',
        country: 'UAE',
        ownership_type: 'Owned',

        // Identity
        premises_name: '',
        business_unit: '',
        status: 'Active',
        primary_purpose: [],

        // Address
        emirate: '',
        area_locality: '',
        building_name: '',
        makani_number: '',
        street: '',
        unit_number: '',
        floor: '',
        google_maps_link: '',
        access_notes: '',

        // Specs (Dynamic)
        specs: [{ total_area_sqm: '', built_up_area_sqm: '', usable_area_sqm: '', ceiling_height_m: '', loading_bays: '', parking_capacity: '', power_capacity_kw: '' }],

        // Legal (Conditional)
        owned: {
            title_deed_no: '',
            purchase_date: '',
            purchase_value: '',
            insurance_policy_ref: '',
            depreciation_method: ''
        },
        rented: {
            landlord_name: '',
            landlord_contact: '',
            tenancy_contract_no: '',
            lease_start_date: '',
            lease_end_date: '',
            rent_frequency: 'Annual',
            annual_rent: '',
            security_deposit: '',
            ejari_or_tawtheeq_no: '',
            renewal_terms: ''
        },

        // Utilities
        electricity_provider: '',
        electricity_account_no: '',
        water_account_no: '',
        internet_provider: '',
        waste_management_provider: '',

        // Documents
        documents: []
    });

    const updateField = (section, field, value) => {
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const addSpec = () => {
        setFormData(prev => ({
            ...prev,
            specs: [...prev.specs, { total_area_sqm: '', built_up_area_sqm: '', usable_area_sqm: '', ceiling_height_m: '', loading_bays: '', parking_capacity: '', power_capacity_kw: '' }]
        }));
    };

    const handleSave = () => {
        onSave && onSave(formData);
        onClose();
    };

    const renderInput = (label, value, onChange, placeholder = '', type = 'default') => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput
                style={styles.input}
                value={value?.toString()}
                onChangeText={onChange}
                placeholder={placeholder}
                placeholderTextColor="#94A3B8"
                keyboardType={type === 'number' ? 'numeric' : 'default'}
            />
        </View>
    );

    const renderStep1 = () => (
        <View style={styles.step1Container}>
            <Text style={styles.stepTitle}>Select Ownership</Text>
            <Text style={styles.stepSubtitle}>Choose whether the premises is owned or rented</Text>

            <View style={styles.ownershipCards}>
                {['Owned', 'Rented', 'Subleased'].map(opt => (
                    <TouchableOpacity
                        key={opt}
                        style={[styles.ownershipCard, formData.ownership_type === opt && styles.activeOwnershipCard]}
                        onPress={() => updateField(null, 'ownership_type', opt)}
                    >
                        <MaterialCommunityIcons
                            name={opt === 'Owned' ? 'home-variant-outline' : 'key-outline'}
                            size={32}
                            color={formData.ownership_type === opt ? '#3B82F6' : '#64748B'}
                        />
                        <Text style={[styles.ownershipLabel, formData.ownership_type === opt && styles.activeOwnershipLabel]}>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.continueButton} onPress={() => setStep(2)}>
                <Text style={styles.continueText}>Continue</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
            </TouchableOpacity>
        </View>
    );

    const renderFormSection = () => {
        switch (activeSection) {
            case 'identity':
                return (
                    <View style={styles.sectionContent}>
                        <Text style={styles.sectionTitle}>Premises Identity</Text>
                        <View style={styles.fieldGrid}>
                            {renderInput('Premises Name*', formData.premises_name, (v) => updateField(null, 'premises_name', v), 'e.g. Dubai Main Office')}
                            {renderInput('Business Unit', formData.business_unit, (v) => updateField(null, 'business_unit', v), 'e.g. Logistics')}
                            {renderInput('Status', formData.status, (v) => updateField(null, 'status', v), 'Active')}
                        </View>
                    </View>
                );
            case 'address':
                return (
                    <View style={styles.sectionContent}>
                        <Text style={styles.sectionTitle}>Address & Location</Text>
                        <View style={styles.fieldGrid}>
                            {renderInput('Emirate/State', formData.emirate, (v) => updateField(null, 'emirate', v), 'e.g. Dubai')}
                            {renderInput('Area/Locality', formData.area_locality, (v) => updateField(null, 'area_locality', v), 'e.g. Business Bay')}
                            {renderInput('Building Name', formData.building_name, (v) => updateField(null, 'building_name', v))}
                            {renderInput('Makani Number', formData.makani_number, (v) => updateField(null, 'makani_number', v))}
                            {renderInput('Street', formData.street, (v) => updateField(null, 'street', v))}
                            {renderInput('Unit/Office No.', formData.unit_number, (v) => updateField(null, 'unit_number', v))}
                            {renderInput('Floor', formData.floor, (v) => updateField(null, 'floor', v))}
                            {renderInput('Google Maps Link', formData.google_maps_link, (v) => updateField(null, 'google_maps_link', v), 'https://...')}
                        </View>
                    </View>
                );
            case 'specs':
                return (
                    <View style={styles.sectionContent}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>Facility Specifications</Text>
                            <TouchableOpacity style={styles.addButton} onPress={addSpec}>
                                <MaterialCommunityIcons name="plus" size={20} color="white" />
                                <Text style={styles.addButtonText}>Add Spec</Text>
                            </TouchableOpacity>
                        </View>
                        {formData.specs.map((spec, index) => (
                            <View key={index} style={styles.specCard}>
                                <View style={styles.fieldGrid}>
                                    {renderInput('Total Area (sqm)', spec.total_area_sqm, (v) => {
                                        const newSpecs = [...formData.specs];
                                        newSpecs[index].total_area_sqm = v;
                                        setFormData({ ...formData, specs: newSpecs });
                                    }, '', 'number')}
                                    {renderInput('Built-up Area (sqm)', spec.built_up_area_sqm, (v) => {
                                        const newSpecs = [...formData.specs];
                                        newSpecs[index].built_up_area_sqm = v;
                                        setFormData({ ...formData, specs: newSpecs });
                                    }, '', 'number')}
                                    {renderInput('Ceiling Height (m)', spec.ceiling_height_m, (v) => {
                                        const newSpecs = [...formData.specs];
                                        newSpecs[index].ceiling_height_m = v;
                                        setFormData({ ...formData, specs: newSpecs });
                                    }, '', 'number')}
                                    {renderInput('Parking Capacity', spec.parking_capacity, (v) => {
                                        const newSpecs = [...formData.specs];
                                        newSpecs[index].parking_capacity = v;
                                        setFormData({ ...formData, specs: newSpecs });
                                    }, '', 'number')}
                                </View>
                            </View>
                        ))}
                    </View>
                );
            case 'legal':
                return (
                    <View style={styles.sectionContent}>
                        <Text style={styles.sectionTitle}>Ownership / Lease & Legal</Text>
                        {formData.ownership_type === 'Owned' ? (
                            <View style={styles.fieldGrid}>
                                {renderInput('Title Deed No.', formData.owned.title_deed_no, (v) => updateField('owned', 'title_deed_no', v))}
                                {renderInput('Purchase Date', formData.owned.purchase_date, (v) => updateField('owned', 'purchase_date', v), 'YYYY-MM-DD')}
                                {renderInput('Purchase Value', formData.owned.purchase_value, (v) => updateField('owned', 'purchase_value', v), '', 'number')}
                                {renderInput('Insurance Policy Ref', formData.owned.insurance_policy_ref, (v) => updateField('owned', 'insurance_policy_ref', v))}
                            </View>
                        ) : (
                            <View style={styles.fieldGrid}>
                                {renderInput('Landlord Name', formData.rented.landlord_name, (v) => updateField('rented', 'landlord_name', v))}
                                {renderInput('Tenancy Contract No.', formData.rented.tenancy_contract_no, (v) => updateField('rented', 'tenancy_contract_no', v))}
                                {renderInput('Lease End Date', formData.rented.lease_end_date, (v) => updateField('rented', 'lease_end_date', v), 'YYYY-MM-DD')}
                                {renderInput('Annual Rent', formData.rented.annual_rent, (v) => updateField('rented', 'annual_rent', v), '', 'number')}
                                {renderInput('Ejari/Tawtheeq No.', formData.rented.ejari_or_tawtheeq_no, (v) => updateField('rented', 'ejari_or_tawtheeq_no', v))}
                            </View>
                        )}
                    </View>
                );
            case 'utilities':
                return (
                    <View style={styles.sectionContent}>
                        <Text style={styles.sectionTitle}>Utilities & Services</Text>
                        <View style={styles.fieldGrid}>
                            {renderInput('Electricity Provider', formData.electricity_provider, (v) => updateField(null, 'electricity_provider', v), 'e.g. DEWA')}
                            {renderInput('Electricity A/C No.', formData.electricity_account_no, (v) => updateField(null, 'electricity_account_no', v))}
                            {renderInput('Water A/C No.', formData.water_account_no, (v) => updateField(null, 'water_account_no', v))}
                            {renderInput('Internet Provider', formData.internet_provider, (v) => updateField(null, 'internet_provider', v))}
                        </View>
                    </View>
                );
            default:
                return (
                    <View style={styles.sectionContent}>
                        <Text style={styles.sectionTitle}>{SECTIONS.find(s => s.id === activeSection)?.label}</Text>
                        <View style={styles.placeholderContainer}>
                            <MaterialCommunityIcons name="cog-outline" size={48} color="#CBD5E1" />
                            <Text style={styles.placeholderText}>Section "{activeSection}" fields are coming soon in this master configuration flow.</Text>
                        </View>
                    </View>
                );
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={[styles.modalBox, { width: isDesktop ? 1000 : '95%', maxHeight: height * 0.85 }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>{premiseId ? 'Edit Premises' : 'Create Premises'}</Text>
                            <Text style={styles.subtitle}>Configure office, warehouse, or facility details</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <MaterialCommunityIcons name="close" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    {step === 1 ? renderStep1() : (
                        <View style={styles.body}>
                            {/* Sidebar Tabs */}
                            <View style={styles.sidebar}>
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {SECTIONS.map(section => (
                                        <TouchableOpacity
                                            key={section.id}
                                            style={[styles.tabItem, activeSection === section.id && styles.activeTabItem]}
                                            onPress={() => setActiveSection(section.id)}
                                        >
                                            <MaterialCommunityIcons
                                                name={section.icon}
                                                size={20}
                                                color={activeSection === section.id ? '#3B82F6' : '#64748B'}
                                            />
                                            {isDesktop && <Text style={[styles.tabLabel, activeSection === section.id && styles.activeTabLabel]}>{section.label}</Text>}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Form Area */}
                            <View style={styles.formArea}>
                                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                                    <View style={styles.topLevelControls}>
                                        <View style={styles.controlItem}>
                                            <Text style={styles.controlLabel}>Premises Type</Text>
                                            <View style={styles.fakePicker}>
                                                <Text style={styles.fakePickerText}>{formData.premise_type}</Text>
                                                <MaterialCommunityIcons name="chevron-down" size={20} color="#64748B" />
                                            </View>
                                        </View>
                                        <View style={styles.controlItem}>
                                            <Text style={styles.controlLabel}>Country</Text>
                                            <View style={styles.fakePicker}>
                                                <Text style={styles.fakePickerText}>{formData.country}</Text>
                                                <MaterialCommunityIcons name="chevron-down" size={20} color="#64748B" />
                                            </View>
                                        </View>
                                    </View>

                                    {renderFormSection()}
                                </ScrollView>

                                {/* Footer */}
                                <View style={styles.footer}>
                                    <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                                        <Text style={styles.cancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                        <Text style={styles.saveText}>Save Configuration</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: 'white',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 24,
    },
    header: {
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1E293B',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
    },
    closeBtn: {
        padding: 8,
    },
    body: {
        flex: 1,
        flexDirection: 'row',
    },
    sidebar: {
        width: Platform.OS === 'web' ? 240 : 60,
        backgroundColor: '#F8FAF6',
        borderRightWidth: 1,
        borderRightColor: '#F1F5F9',
        paddingVertical: 12,
    },
    tabItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginHorizontal: 8,
        borderRadius: 8,
        marginBottom: 2,
    },
    activeTabItem: {
        backgroundColor: '#EFF6FF',
    },
    tabLabel: {
        fontSize: 14,
        color: '#64748B',
        marginLeft: 12,
        fontWeight: '500',
    },
    activeTabLabel: {
        color: '#3B82F6',
        fontWeight: '600',
    },
    formArea: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    topLevelControls: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    controlItem: {
        flex: 1,
    },
    controlLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    fakePicker: {
        height: 48,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: '#F8FAFC',
    },
    fakePickerText: {
        fontSize: 14,
        color: '#1E293B',
    },
    sectionContent: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 20,
    },
    fieldGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    inputGroup: {
        flexBasis: '48%',
        minWidth: 200,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#64748B',
        marginBottom: 6,
    },
    input: {
        height: 44,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 14,
        color: '#1E293B',
        backgroundColor: '#FFFFFF',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3B82F6',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 6,
    },
    addButtonText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
    },
    specCard: {
        padding: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 16,
    },
    placeholderContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    placeholderText: {
        marginTop: 16,
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        maxWidth: 300,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    cancelBtn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
    },
    cancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    saveBtn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: '#3B82F6',
    },
    saveText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },

    // Step 1 Styles
    step1Container: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 12,
    },
    stepSubtitle: {
        fontSize: 16,
        color: '#64748B',
        marginBottom: 40,
        textAlign: 'center',
    },
    ownershipCards: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 40,
    },
    ownershipCard: {
        width: 160,
        height: 160,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    activeOwnershipCard: {
        backgroundColor: '#EFF6FF',
        borderColor: '#3B82F6',
    },
    ownershipLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748B',
    },
    activeOwnershipLabel: {
        color: '#3B82F6',
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 14,
        gap: 10,
    },
    continueText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    }
});

export default PremisesMasterModal;
