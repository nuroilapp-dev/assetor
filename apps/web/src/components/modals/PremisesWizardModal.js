import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BaseModal from './BaseModal';
import { uploadFile } from '../../api/officeApi';
import DateField from '../form/DateField';



const PDFPreviewModal = ({ visible, url, onClose }) => {
    return (
        <BaseModal visible={visible} onClose={onClose} title="Document Preview" width={900}>
            <View style={{ height: '80vh', width: '100%' }}>
                {Platform.OS === 'web' ? (
                    <iframe src={url} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Preview" />
                ) : (
                    <Text>Preview not available on native</Text>
                )}
            </View>
        </BaseModal>
    );
};


// ... (imports remain the same) ...
const PremisesWizardModal = ({ visible, onClose, mode = 'OWNED', initialData = null, onSave, initialStep = 1, readOnly = false }) => {
    const isOwned = mode === 'OWNED';
    // Owned has 5 Steps, Rental has 4 Steps (preserved legacy)
    const totalSteps = isOwned ? 5 : 4;
    const [step, setStep] = useState(initialStep);
    const [loading, setLoading] = useState(false);
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        if (visible) {
            setStep(initialStep);
        }
    }, [visible, initialStep]);

    const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toISOString().split('T')[0];
    };

    const initialFormState = {
        name: '',
        building: '',
        type: 'Office',
        country: '',
        country: '',
        city: '',
        capacity: '', // New field

        // Owned Fields
        areaSqft: '',
        googleMapUrl: '',
        floorsCount: '',
        depreciationRate: '',
        electricityAvailable: false,
        waterAvailable: false,
        internetAvailable: false,
        insuranceExpiry: '',

        // Step 2 (Rental Legacy)
        buyDate: '',
        purchaseValue: '',
        ownershipType: 'Freehold',

        // Rental Fields
        leaseStart: '',
        leaseEnd: '',
        monthlyRent: '',
        yearlyRent: '',
        paymentFrequency: 'MONTHLY',
        renewalDate: '',
        securityDeposit: '',

        // Common
        address: '',
        addressLine2: '', // New
        landmark: '', // New
        unitNumber: '',
        parking: 'Yes',
        parkingArea: '', // New field
        electricityId: '',
        waterId: '',

        status: 'ACTIVE',
        notes: '',
        documentName: '',
        documentPath: '',
        documentUrl: '',
        documentMime: '',

        landlordName: '',
        landlordPhone: '',
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (visible) {
            setStep(1);
            if (initialData) {
                // Map existing data to new form structure
                setFormData({
                    ...initialFormState,
                    name: initialData.premises_name || '',
                    building: initialData.building_name || '',
                    type: (initialData.premises_use ? initialData.premises_use.charAt(0) + initialData.premises_use.slice(1).toLowerCase() : 'Office'),
                    country: initialData.country || '',
                    city: initialData.city || '',
                    capacity: initialData.capacity ? String(initialData.capacity) : '',

                    // Owned specific
                    areaSqft: initialData.property_size_sqft ? String(initialData.property_size_sqft) : '',
                    googleMapUrl: initialData.google_map_url || '',
                    floorsCount: initialData.floors_count ? String(initialData.floors_count) : '',
                    depreciationRate: initialData.depreciation_rate ? String(initialData.depreciation_rate) : '',
                    electricityAvailable: !!initialData.electricity_available,
                    waterAvailable: !!initialData.water_available,
                    internetAvailable: !!initialData.internet_available,
                    insuranceExpiry: formatDateForInput(initialData.insurance_expiry),

                    buyDate: formatDateForInput(initialData.buy_date),
                    purchaseValue: initialData.purchase_value ? String(initialData.purchase_value) : '',

                    leaseStart: formatDateForInput(initialData.contract_start),
                    leaseEnd: formatDateForInput(initialData.contract_end),
                    monthlyRent: initialData.monthly_rent ? String(initialData.monthly_rent) : '',
                    yearlyRent: initialData.yearly_rent ? String(initialData.yearly_rent) : '',
                    paymentFrequency: initialData.payment_frequency || 'MONTHLY',
                    renewalDate: formatDateForInput(initialData.renewal_date || initialData.renewal_reminder_date || initialData.next_payment_date), // Fallbacks
                    securityDeposit: initialData.security_deposit ? String(initialData.security_deposit) : '',

                    address: initialData.full_address || '',
                    addressLine2: initialData.address_line2 || '',
                    landmark: initialData.landmark || '',
                    unitNumber: '', // Not in DB yet? Assuming it might be part of address or needs new col if critical
                    // We mapped unitNumber to notes previously, but let's keep empty if not distinct column
                    parking: initialData.parking_available ? 'Yes' : 'No', // Map from DB boolean if exists, or use existing `parking` field if string? 
                    // DB likely store as boolean `parking_available` or `parking`. 
                    // Previous code mapped `parking: 'Yes'`. 
                    // Let's assume initialData might have `parking_available` or `parking`.
                    parkingArea: initialData.parking_area ? String(initialData.parking_area) : '',

                    status: initialData.status || 'ACTIVE',
                    notes: initialData.notes || '',
                    documentName: initialData.document_name || '',
                    documentPath: initialData.document_path || '',
                    documentUrl: initialData.document_url || '',
                    documentMime: initialData.document_mime || '',
                });
            } else {
                setFormData(initialFormState);
            }
        }
    }, [visible, initialData]);

    const updateField = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));
    const nextStep = () => { if (step < totalSteps) setStep(step + 1); };
    const prevStep = () => { if (step > 1) setStep(step - 1); };

    const fileInputRef = useRef(null);
    const SERVER_URL = 'http://localhost:5026'; // MVP Hardcode

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result;
            setLoading(true);
            try {
                const result = await uploadFile({ name: file.name, content: base64 });
                if (result.success) {
                    setFormData(p => ({
                        ...p,
                        documentName: file.name,
                        documentPath: result.path,
                        documentUrl: `${SERVER_URL}${result.path}`,
                        documentMime: file.type
                    }));
                }
            } catch (e) {
                console.error('Upload failed', e);
                alert('Upload failed');
            } finally {
                setLoading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handlePreview = () => {
        if (formData.documentUrl) {
            setPreviewUrl(formData.documentUrl);
            setPreviewVisible(true);
        }
    };

    const handleDownload = () => {
        if (formData.documentUrl && Platform.OS === 'web') {
            window.open(formData.documentUrl, '_blank');
        }
    };

    const handleSubmit = async () => {
        if (!onSave) return;
        setLoading(true);
        try {
            const payload = {
                premise_type: mode,
                premises_name: formData.name,
                building_name: formData.building,
                premises_use: formData.type.toUpperCase(),
                country: formData.country,
                city: formData.city,
                full_address: formData.address,
                address_line2: formData.addressLine2,
                landmark: formData.landmark,
                capacity: formData.capacity,
                status: formData.status,
                document_name: formData.documentName,
                document_path: formData.documentPath,
                document_mime: formData.documentMime,
                google_map_url: formData.googleMapUrl,

                parking_available: formData.parking === 'Yes',
                parking_area: formData.parking === 'Yes' ? formData.parkingArea : null,

                notes: formData.notes
            };

            // Validation
            if (payload.parking_available && !payload.parking_area) {
                alert('Please enter Parking Area / Slots'); // Simple alert for now or use toast if available
                setLoading(false);
                return;
            }

            if (isOwned) {
                payload.owned = {
                    buy_date: formData.buyDate ? formData.buyDate : null,
                    purchase_value: formData.purchaseValue || 0,
                    owner_name: formData.ownershipType,
                    property_size_sqft: formData.areaSqft || 0,
                    floors_count: formData.floorsCount || 0,
                    depreciation_rate: formData.depreciationRate || 0,
                    renewal_required: !!formData.renewalDate, // Auto infer?
                    renewal_date: formData.renewalDate || null,
                    insurance_expiry: formData.insuranceExpiry || null,
                    electricity_available: formData.electricityAvailable,
                    water_available: formData.waterAvailable,
                    internet_available: formData.internetAvailable,
                    notes: formData.notes
                };
            } else {
                payload.rental = {
                    contract_start: formData.leaseStart ? formData.leaseStart : null,
                    contract_end: formData.leaseEnd ? formData.leaseEnd : null,
                    monthly_rent: formData.monthlyRent || 0,
                    yearly_rent: formData.yearlyRent || 0,
                    payment_frequency: formData.paymentFrequency,
                    security_deposit: formData.securityDeposit || null,
                    renewal_reminder_date: formData.renewalDate ? formData.renewalDate : null,
                    notes: formData.notes
                };
            }
            await onSave(payload);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- STEPS ---

    // --- RENDER STEPS ---

    // Step 1: Basic (Shared)
    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Basic Premises Details</Text>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Premises Name *</Text>
                <TextInput style={styles.input} value={formData.name} onChangeText={t => updateField('name', t)} placeholder="e.g. HQ Main Office" />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Capacity (Persons)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={formData.capacity} onChangeText={t => updateField('capacity', t)} placeholder="e.g. 50" />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Premises Type *</Text>
                <View style={styles.pillRow}>
                    {['Office', 'Warehouse', 'Staff'].map(t => (
                        <TouchableOpacity key={t} style={[styles.pill, formData.type === t && styles.activePill]} onPress={() => updateField('type', t)}>
                            <Text style={[styles.pillText, formData.type === t && styles.activePillText]}>{t}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );

    // Step 2: Location (Owned) vs Lease Details (Rental)
    const renderStep2 = () => {
        if (!isOwned) {
            // RENTAL: Lease Details (Legacy Step 2)
            return (
                <View style={styles.stepContainer}>
                    <Text style={styles.stepTitle}>Lease Details</Text>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Lease Start Date</Text>
                            <DateField value={formData.leaseStart} onChange={t => updateField('leaseStart', t)} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Lease End Date</Text>
                            <DateField value={formData.leaseEnd} onChange={t => updateField('leaseEnd', t)} />
                        </View>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Payment Frequency</Text>
                        <View style={styles.pillRow}>
                            {['MONTHLY', 'YEARLY'].map(t => (
                                <TouchableOpacity key={t} style={[styles.pill, formData.paymentFrequency === t && styles.activePill]} onPress={() => updateField('paymentFrequency', t)}>
                                    <Text style={[styles.pillText, formData.paymentFrequency === t && styles.activePillText]}>{t.charAt(0) + t.slice(1).toLowerCase()}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>{formData.paymentFrequency === 'MONTHLY' ? 'Monthly Rent' : 'Yearly Rent'}</Text>
                            <TextInput style={styles.input} keyboardType="numeric" value={formData.paymentFrequency === 'MONTHLY' ? formData.monthlyRent : formData.yearlyRent} onChangeText={t => {
                                if (formData.paymentFrequency === 'MONTHLY') {
                                    const y = (parseFloat(t) || 0) * 12;
                                    setFormData(p => ({ ...p, monthlyRent: t, yearlyRent: y ? y.toFixed(0) : '' }));
                                } else {
                                    const m = (parseFloat(t) || 0) / 12;
                                    setFormData(p => ({ ...p, yearlyRent: t, monthlyRent: m ? m.toFixed(2) : '' }));
                                }
                            }} />
                        </View>
                        <View style={{ flex: 1 }}>
                            {/* Readonly Calculated */}
                            <Text style={styles.label}>{formData.paymentFrequency === 'MONTHLY' ? 'Yearly Equivalent' : 'Monthly Equivalent'}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: '#f1f5f9' }]}
                                editable={false}
                                value={formData.paymentFrequency === 'MONTHLY' ? formData.yearlyRent : formData.monthlyRent}
                            />
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Security Deposit</Text>
                            <TextInput style={styles.input} keyboardType="numeric" value={formData.securityDeposit} onChangeText={t => updateField('securityDeposit', t)} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Next Renewal Date</Text>
                            <DateField value={formData.renewalDate} onChange={t => updateField('renewalDate', t)} />
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Landlord Name</Text>
                            <TextInput style={styles.input} value={formData.landlordName} onChangeText={t => updateField('landlordName', t)} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Landlord Phone</Text>
                            <TextInput style={styles.input} keyboardType="phone-pad" value={formData.landlordPhone} onChangeText={t => updateField('landlordPhone', t)} />
                        </View>
                    </View>
                </View>
            );
        }

        // OWNED: Location
        return (
            <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Location Details</Text>
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Country *</Text>
                        <TextInput style={styles.input} value={formData.country} onChangeText={t => updateField('country', t)} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>City *</Text>
                        <TextInput style={styles.input} value={formData.city} onChangeText={t => updateField('city', t)} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Building Name *</Text>
                        <TextInput style={styles.input} value={formData.building} onChangeText={t => updateField('building', t)} />
                    </View>
                </View>
                <View style={[styles.inputGroup, { flexDirection: 'row', gap: 16 }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Address Line 1</Text>
                        <TextInput style={styles.input} value={formData.address} onChangeText={t => updateField('address', t)} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Address Line 2</Text>
                        <TextInput style={styles.input} value={formData.addressLine2} onChangeText={t => updateField('addressLine2', t)} />
                    </View>
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Landmark</Text>
                    <TextInput style={styles.input} value={formData.landmark} onChangeText={t => updateField('landmark', t)} />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Google Map URL</Text>
                    <TextInput style={styles.input} value={formData.googleMapUrl} onChangeText={t => updateField('googleMapUrl', t)} placeholder="https://maps.google.com/..." />
                </View>
            </View>
        );
    };

    // Step 3: Financials (Owned) vs Address (Rental)
    const renderStep3 = () => {
        if (!isOwned) {
            // RENTAL: Address & Utils (Legacy Step 3)
            return (
                <View style={styles.stepContainer}>
                    <Text style={styles.stepTitle}>Address & Utilities</Text>
                    <View style={[styles.inputGroup, { flexDirection: 'row', gap: 16 }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Address Line 1</Text>
                            <TextInput style={styles.input} value={formData.address} onChangeText={t => updateField('address', t)} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Address Line 2</Text>
                            <TextInput style={styles.input} value={formData.addressLine2} onChangeText={t => updateField('addressLine2', t)} />
                        </View>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Landmark</Text>
                        <TextInput style={styles.input} value={formData.landmark} onChangeText={t => updateField('landmark', t)} />
                    </View>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Country</Text>
                            <TextInput style={styles.input} value={formData.country} onChangeText={t => updateField('country', t)} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>City</Text>
                            <TextInput style={styles.input} value={formData.city} onChangeText={t => updateField('city', t)} />
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Floor / Unit Number</Text>
                            <TextInput style={styles.input} value={formData.unitNumber} onChangeText={t => updateField('unitNumber', t)} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Parking Available</Text>
                            <View style={styles.pillRow}>
                                {['Yes', 'No'].map(t => (
                                    <TouchableOpacity key={t} style={[styles.pill, formData.parking === t && styles.activePill]} onPress={() => updateField('parking', t)}>
                                        <Text style={[styles.pillText, formData.parking === t && styles.activePillText]}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                    {formData.parking === 'Yes' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Parking Area / Slots *</Text>
                            <TextInput style={styles.input} value={formData.parkingArea} onChangeText={t => updateField('parkingArea', t)} placeholder="e.g. 500 sqft or 5 slots" />
                        </View>
                    )}
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Electricity Meter ID</Text>
                            <TextInput style={styles.input} value={formData.electricityId} onChangeText={t => updateField('electricityId', t)} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Water Meter ID</Text>
                            <TextInput style={styles.input} value={formData.waterId} onChangeText={t => updateField('waterId', t)} />
                        </View>
                    </View>
                </View>
            );
        }

        // OWNED: Financials
        return (
            <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Financial Information</Text>
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Buy Date *</Text>
                        <DateField value={formData.buyDate} onChange={t => updateField('buyDate', t)} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Purchase Amount</Text>
                        <TextInput style={styles.input} keyboardType="numeric" value={formData.purchaseValue} onChangeText={t => updateField('purchaseValue', t)} />
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Area (Sq ft)</Text>
                        <TextInput style={styles.input} keyboardType="numeric" value={formData.areaSqft} onChangeText={t => updateField('areaSqft', t)} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Floors Count</Text>
                        <TextInput style={styles.input} keyboardType="numeric" value={formData.floorsCount} onChangeText={t => updateField('floorsCount', t)} />
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Depreciation Rate (%)</Text>
                        <TextInput style={styles.input} keyboardType="numeric" value={formData.depreciationRate} onChangeText={t => updateField('depreciationRate', t)} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Insurance Expiry</Text>
                        <DateField value={formData.insuranceExpiry} onChange={t => updateField('insuranceExpiry', t)} />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ownership Type</Text>
                    <View style={styles.pillRow}>
                        {['Freehold', 'Leasehold'].map(t => (
                            <TouchableOpacity key={t} style={[styles.pill, formData.ownershipType === t && styles.activePill]} onPress={() => updateField('ownershipType', t)}>
                                <Text style={[styles.pillText, formData.ownershipType === t && styles.activePillText]}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        );
    };

    // Step 4: Utilities (Owned) vs Status (Rental)
    const renderStep4 = () => {
        if (!isOwned) {
            // RENTAL: Documents & Status (Legacy Step 4)
            return renderStep5();
        }

        // OWNED: Utilities
        return (
            <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Utilities & Services</Text>
                <View style={[styles.row, { flexWrap: 'wrap' }]}>
                    {[
                        { label: 'Electricity Available', key: 'electricityAvailable' },
                        { label: 'Water Available', key: 'waterAvailable' },
                        { label: 'Internet / Fiber', key: 'internetAvailable' }
                    ].map(item => (
                        <TouchableOpacity
                            key={item.key}
                            style={[styles.checkboxContainer, formData[item.key] && styles.checkboxActive]}
                            onPress={() => updateField(item.key, !formData[item.key])}
                        >
                            <MaterialCommunityIcons name={formData[item.key] ? "checkbox-marked" : "checkbox-blank-outline"} size={24} color={formData[item.key] ? "#3b82f6" : "#94a3b8"} />
                            <Text style={styles.checkboxLabel}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Floor / Unit Number</Text>
                        <TextInput style={styles.input} value={formData.unitNumber} onChangeText={t => updateField('unitNumber', t)} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Parking Available</Text>
                        <View style={styles.pillRow}>
                            {['Yes', 'No'].map(t => (
                                <TouchableOpacity key={t} style={[styles.pill, formData.parking === t && styles.activePill]} onPress={() => updateField('parking', t)}>
                                    <Text style={[styles.pillText, formData.parking === t && styles.activePillText]}>{t}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
                {formData.parking === 'Yes' && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Parking Area / Slots *</Text>
                        <TextInput style={styles.input} value={formData.parkingArea} onChangeText={t => updateField('parkingArea', t)} placeholder="e.g. 500 sqft or 5 slots" />
                    </View>
                )}
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Electricity Meter ID</Text>
                        <TextInput style={styles.input} value={formData.electricityId} onChangeText={t => updateField('electricityId', t)} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Water Meter ID</Text>
                        <TextInput style={styles.input} value={formData.waterId} onChangeText={t => updateField('waterId', t)} />
                    </View>
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Notes</Text>
                    <TextInput style={[styles.input, { height: 80 }]} multiline value={formData.notes} onChangeText={t => updateField('notes', t)} placeholder="Any additional details..." />
                </View>
            </View>
        );
    };

    // Step 5: Documents (Owned) or merged into Step 4 (Rental)
    const renderStep5 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Documents & Status</Text>

            {Platform.OS === 'web' && (
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="application/pdf" onChange={handleFileChange} />
            )}

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Attachment (PDF)</Text>
                {formData.documentPath ? (
                    <View style={styles.fileCard}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <MaterialCommunityIcons name="file-pdf-box" size={32} color="#ef4444" />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fileName} numberOfLines={1}>{formData.documentName}</Text>
                                <Text style={styles.fileSub}>Ready to submit</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity style={styles.actionPill} onPress={handlePreview}>
                                <MaterialCommunityIcons name="eye" size={16} color="#3b82f6" />
                                <Text style={styles.actionPillText}>Preview</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionPill} onPress={handleDownload}>
                                <MaterialCommunityIcons name="download" size={16} color="#3b82f6" />
                                <Text style={styles.actionPillText}>Download</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionPill, { borderColor: '#e2e8f0' }]} onPress={() => fileInputRef.current?.click()}>
                                <Text style={[styles.actionPillText, { color: '#64748b' }]}>Replace</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.uploadBox} onPress={() => fileInputRef.current?.click()}>
                        <MaterialCommunityIcons name="cloud-upload" size={40} color="#94a3b8" />
                        <Text style={styles.uploadText}>Click to upload PDF document</Text>
                        <Text style={styles.uploadSub}>Max size 10MB</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.pillRow}>
                    {['ACTIVE', 'INACTIVE'].map(t => (
                        <TouchableOpacity key={t} style={[styles.pill, formData.status === t && styles.activePill]} onPress={() => updateField('status', t)}>
                            <Text style={[styles.pillText, formData.status === t && styles.activePillText]}>{t}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {isOwned ? null : (
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Internal Notes</Text>
                    <TextInput style={[styles.input, { height: 80 }]} multiline value={formData.notes} onChangeText={t => updateField('notes', t)} placeholder="Any additional details..." />
                </View>
            )}

            <View style={styles.summaryFull}>
                <Text style={styles.summaryTitle}>Summary Preview</Text>
                <Text style={styles.summaryText}>{formData.name} ({formData.type})</Text>
                <Text style={styles.summaryText}>{formData.address}, {formData.city}</Text>
                <Text style={styles.summaryText}>{isOwned ? `Owned - Valid from ${formData.buyDate}` : `Rental - ${formData.monthlyRent}/mo`}</Text>
                {formData.documentName ? <Text style={styles.summaryText}>+ 1 Document Attached</Text> : null}
            </View>
        </View>
    );


    return (
        <BaseModal
            visible={visible}
            onClose={onClose}
            title={`${readOnly ? 'View' : (initialData ? 'Edit' : 'Add')} Premises`}
            width={720}
            closeOnBackdrop={false}
        >
            <View style={styles.container}>

                {/* Horizontal Stepper */}
                <View style={styles.stepperContainer}>
                    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s, i) => {
                        const isCompleted = step > s;
                        const isActive = step === s;

                        // Define Labels
                        let label = '';
                        if (isOwned) {
                            const labels = ['Basic Info', 'Location', 'Financials', 'Utilities', 'Docs & Status'];
                            label = labels[i];
                        } else {
                            const labels = ['Basic Info', 'Lease', 'Address/Utils', 'Docs & Status']; // Rental has 4 steps
                            label = labels[i];
                        }

                        return (
                            <View key={s} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <View style={{ alignItems: 'center', zIndex: 10 }}>
                                    <View style={[
                                        styles.stepCircle,
                                        (isActive || isCompleted) && styles.stepCircleActive,
                                        !isActive && !isCompleted && { backgroundColor: '#e2e8f0' }
                                    ]}>
                                        {isCompleted && <MaterialCommunityIcons name="check" size={16} color="white" />}
                                        {isActive && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: 'white' }} />}
                                    </View>
                                    <Text style={[
                                        styles.stepLabel,
                                        isActive && styles.stepLabelActive,
                                        isCompleted && styles.stepLabelCompleted
                                    ]}>
                                        {label}
                                    </Text>
                                </View>
                                {i < totalSteps - 1 && <View style={[styles.stepLine, (step > s) && styles.stepLineActive]} />}
                            </View>
                        );
                    })}
                </View>

                {/* 
                   For proper readOnly on inputs without replacing all renderStepX functions:
                   We use a trick: verify isReadOnly in render? 
                   We will stick to "Footer Change" for now as it meets 80% requirement and avoids regression risk of big replace.
                   We accept that users can type but can't save. 
                   Ideally we would disable inputs. 
                   Actually, let's inject a "pointerEvents" control on the ScrollView container?
                   <ScrollView pointerEvents={readOnly ? "none" : "auto"} ...>
                   This would disable scrolling too if not careful. "none" disables all interaction.
                   We need "box-none" on parent, but inputs need to be disabled.
                   
                   Let's use a overlay view? No.
                   
                   Let's just change the buttons.
                */}

                <ScrollView style={styles.scrollForm} contentContainerStyle={{ paddingBottom: 24 }}>
                    {/* Interaction Lock for ReadOnly */}
                    <View pointerEvents={readOnly ? 'none' : 'auto'}>
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                        {step === 4 && renderStep4()}
                        {step === 5 && renderStep5()}
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity onPress={step === 1 ? onClose : prevStep} style={styles.backBtn}>
                        <Text style={styles.backBtnText}>{step === 1 ? (readOnly ? 'Close' : 'Cancel') : 'Back'}</Text>
                    </TouchableOpacity>

                    {step < totalSteps ? (
                        <TouchableOpacity onPress={nextStep} style={styles.primaryBtn}>
                            <Text style={styles.primaryBtnText}>Next Step</Text>
                        </TouchableOpacity>
                    ) : (
                        !readOnly && (
                            <TouchableOpacity onPress={handleSubmit} style={[styles.primaryBtn, { backgroundColor: '#10b981' }]} disabled={loading}>
                                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryBtnText}>Save Premises</Text>}
                            </TouchableOpacity>
                        )
                    )}
                </View>
            </View>
            <PDFPreviewModal visible={previewVisible} url={previewUrl} onClose={() => setPreviewVisible(false)} />
        </BaseModal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, maxHeight: '80vh' },
    stepperContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24, gap: 4 },
    stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
    stepCircleActive: { backgroundColor: '#3b82f6' },
    stepNum: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    stepNumActive: { color: 'white' },
    stepLine: { width: 40, height: 2, backgroundColor: '#f1f5f9' },
    stepLineActive: { backgroundColor: '#3b82f6' },

    scrollForm: {
        flex: 1,
    },

    stepContainer: { gap: 20 },
    stepTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 4 },

    inputGroup: { gap: 8 },
    row: { flexDirection: 'row', gap: 16 },
    label: { fontSize: 14, fontWeight: '500', color: '#475569' },
    input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12, fontSize: 14, color: '#334155', backgroundColor: 'white', outlineStyle: 'none' },

    pillRow: { flexDirection: 'row', gap: 12 },
    pill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: 'transparent' },
    activePill: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
    pillText: { fontSize: 14, color: '#64748b' },
    activePillText: { color: '#2563eb', fontWeight: '600' },

    summaryFull: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#3b82f6' },
    summaryTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
    summaryText: { fontSize: 14, color: '#475569', marginBottom: 4 },

    footer: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    backBtn: { paddingVertical: 12, paddingHorizontal: 24 },
    backBtnText: { color: '#64748b', fontWeight: '600' },
    primaryBtn: { backgroundColor: '#3b82f6', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12 },
    primaryBtnText: { color: 'white', fontWeight: '600' },

    fileCard: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
    fileName: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
    fileSub: { fontSize: 12, color: '#64748b' },
    actionPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: 'white', borderWidth: 1, borderColor: '#bfdbfe' },
    actionPillText: { fontSize: 12, fontWeight: '500', color: '#2563eb' },
    uploadBox: { height: 120, borderRadius: 12, borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    uploadText: { marginTop: 12, fontSize: 14, color: '#475569', fontWeight: '500' },
    uploadSub: { marginTop: 2, fontSize: 12, color: '#94a3b8' },

    checkboxContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginRight: 12, marginBottom: 12, minWidth: '45%', backgroundColor: 'white' },
    checkboxActive: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
    checkboxLabel: { marginLeft: 8, fontSize: 14, color: '#334155', fontWeight: '500' },

    stepLabel: { fontSize: 11, fontWeight: '500', color: '#94a3b8', marginTop: 4, textAlign: 'center', width: 80, position: 'absolute', top: 32 },
    stepLabelActive: { color: '#3b82f6', fontWeight: '700' },
    stepLabelCompleted: { color: '#3b82f6' },
});

export default PremisesWizardModal;
