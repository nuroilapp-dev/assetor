import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Dimensions, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppLayout from '../../components/AppLayout';

const { width } = Dimensions.get('window');
const isDesktop = width > 768;

const STEPS = [
    { number: 1, title: 'Job location' },
    { number: 2, title: 'Job position' },
    { number: 3, title: 'Personal details' }
];

const JOB_ROLES = [
    { id: '1', title: 'Senior UX Designer', desc: 'Contract • Remote', rate: 'from £45/hr' },
    { id: '2', title: 'React Native Dev', desc: 'Full-time • London', rate: 'from £50/hr' },
    { id: '3', title: 'Product Manager', desc: 'Full-time • Manchester', rate: 'from £55/hr' },
    { id: '4', title: 'Backend Engineer', desc: 'Contract • Remote', rate: 'from £40/hr' },
];

const SUGGESTIONS = ['Manchester', 'Liverpool', 'Leeds', 'London', 'Newcastle'];

const JobWizardScreen = ({ navigation }) => {
    const [step, setStep] = useState(1);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form Data
    const [location, setLocation] = useState('');
    const [selectedRole, setSelectedRole] = useState(null);
    const [form, setForm] = useState({
        name: '',
        phone: '',
        resume: null
    });

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            setIsSuccess(true);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const renderHeader = () => (
        <View style={styles.stepHeader}>
            <View style={styles.stepLineContainer}>
                <View style={styles.stepLine} />
            </View>
            <View style={styles.stepsRow}>
                {STEPS.map((s, index) => {
                    const isActive = step === s.number;
                    const isCompleted = step > s.number;
                    return (
                        <View key={s.number} style={styles.stepItem}>
                            <View style={[
                                styles.stepCircle,
                                isActive && styles.stepCircleActive,
                                isCompleted && styles.stepCircleCompleted
                            ]}>
                                {isCompleted ? (
                                    <MaterialCommunityIcons name="check" size={16} color="white" />
                                ) : (
                                    <View style={[styles.stepDot, isActive && styles.stepDotActive]} />
                                )}
                            </View>
                            <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                                {s.title}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );

    const renderStep1 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Job location</Text>

            <View style={styles.inputGroup}>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Location: city, area..."
                        placeholderTextColor="#9ca3af"
                        value={location}
                        onChangeText={setLocation}
                    />
                    <MaterialCommunityIcons name="map-marker-outline" size={24} color="#9ca3af" style={styles.inputIcon} />
                </View>
            </View>

            <View style={styles.suggestionsBox}>
                <Text style={styles.suggestionLabel}>SUGGESTIONS</Text>
                <View style={styles.pillsRow}>
                    {SUGGESTIONS.map(city => (
                        <TouchableOpacity
                            key={city}
                            style={styles.pill}
                            onPress={() => setLocation(city)}
                        >
                            <Text style={styles.pillText}>{city}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Job position</Text>

            <View style={styles.inputGroup}>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Roles: job title, position"
                        placeholderTextColor="#9ca3af"
                    />
                    <MaterialCommunityIcons name="magnify" size={24} color="#9ca3af" style={styles.inputIcon} />
                </View>
            </View>

            <View style={styles.roleGrid}>
                {JOB_ROLES.map(role => {
                    const isSelected = selectedRole === role.id;
                    return (
                        <TouchableOpacity
                            key={role.id}
                            style={[styles.roleCard, isSelected && styles.roleCardSelected]}
                            onPress={() => setSelectedRole(role.id)}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={styles.roleTitle}>{role.title}</Text>
                                <Text style={styles.roleDesc}>{role.desc}</Text>
                                <Text style={styles.roleRate}>{role.rate}</Text>
                            </View>
                            <View style={[styles.radio, isSelected && styles.radioSelected]}>
                                {isSelected && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Personal details</Text>

            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Location</Text>
                    <TextInput style={[styles.input, styles.inputDisabled]} value={location || 'Not selected'} editable={false} />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Role</Text>
                    <TextInput
                        style={[styles.input, styles.inputDisabled]}
                        value={JOB_ROLES.find(r => r.id === selectedRole)?.title || 'Not selected'}
                        editable={false}
                    />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                    style={styles.input}
                    value={form.name}
                    onChangeText={t => setForm({ ...form, name: t })}
                    placeholder="e.g. John Doe"
                    placeholderTextColor="#9ca3af"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                    style={styles.input}
                    value={form.phone}
                    onChangeText={t => setForm({ ...form, phone: t })}
                    placeholder="+44 7911 123456"
                    placeholderTextColor="#9ca3af"
                />
            </View>

            <TouchableOpacity style={styles.uploadBox}>
                <View style={styles.uploadCircle}>
                    <MaterialCommunityIcons name="cloud-upload" size={24} color="#6C5CE7" />
                </View>
                <Text style={styles.uploadText}>Click to upload certification</Text>
                <Text style={styles.uploadSub}>or drag and drop</Text>
            </TouchableOpacity>
        </View>
    );

    const renderSuccess = () => (
        <View style={styles.successContent}>
            <View style={styles.successIconCircle}>
                <MaterialCommunityIcons name="check" size={48} color="white" />
            </View>
            <Text style={styles.successTitle}>We've received your application!</Text>
            <Text style={styles.successDesc}>We will process it and reach out to you in days.</Text>

            <TouchableOpacity
                style={[styles.btn, styles.btnPrimary, { marginTop: 32, minWidth: 200 }]}
                onPress={() => { setIsSuccess(false); setStep(1); }}
            >
                <Text style={styles.btnText}>Start New Application</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <AppLayout navigation={navigation}>
            <View style={styles.screenContainer}>
                <View style={styles.card}>
                    {!isSuccess ? (
                        <>
                            {renderHeader()}
                            <View style={styles.body}>
                                {step === 1 && renderStep1()}
                                {step === 2 && renderStep2()}
                                {step === 3 && renderStep3()}
                            </View>
                            <View style={styles.footer}>
                                {step > 1 ? (
                                    <TouchableOpacity style={styles.btnBack} onPress={handleBack}>
                                        <Text style={styles.btnBackText}>Back</Text>
                                    </TouchableOpacity>
                                ) : <View />}

                                <TouchableOpacity
                                    style={[styles.btn, styles.btnPrimary]}
                                    onPress={handleNext}
                                >
                                    <Text style={styles.btnText}>{step === 3 ? 'Submit Application' : 'Next Step'}</Text>
                                    <MaterialCommunityIcons name="arrow-right" size={16} color="white" style={{ marginLeft: 8 }} />
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : renderSuccess()}
                </View>
            </View>
        </AppLayout>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: '#f2f3f5',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    card: {
        width: '100%',
        maxWidth: 900,
        minHeight: 600,
        backgroundColor: 'white',
        borderRadius: 16,
        paddingVertical: 32,
        paddingHorizontal: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 8,
    },
    stepHeader: {
        marginBottom: 40,
        position: 'relative',
    },
    stepLineContainer: {
        position: 'absolute',
        top: 14,
        left: 50,
        right: 50,
        height: 2,
        backgroundColor: '#f3f4f6',
        zIndex: 0,
    },
    stepsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 1,
    },
    stepItem: {
        alignItems: 'center',
        gap: 8,
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepCircleActive: {
        borderColor: '#6C5CE7',
    },
    stepCircleCompleted: {
        backgroundColor: '#6C5CE7',
        borderColor: '#6C5CE7',
    },
    stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e5e7eb' },
    stepDotActive: { backgroundColor: '#6C5CE7' },
    stepLabel: { fontSize: 13, color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    stepLabelActive: { color: '#6C5CE7' },

    body: {
        flex: 1,
        marginBottom: 24,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 24,
    },
    inputGroup: { marginBottom: 20 },
    row: { flexDirection: 'row', gap: 16 },
    label: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1f2937',
        height: '100%',
        outlineStyle: 'none'
    },
    inputDisabled: {
        backgroundColor: '#f9fafb',
        color: '#6b7280'
    },

    // Step 1 Extras
    suggestionsBox: { marginTop: 20 },
    suggestionLabel: { fontSize: 12, fontWeight: '700', color: '#9ca3af', marginBottom: 12, letterSpacing: 1 },
    pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    pill: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: 'white',
    },
    pillText: { fontSize: 14, color: '#4b5563', fontWeight: '500' },

    // Step 2 Extras
    roleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    roleCard: {
        width: '48%',
        minWidth: 300,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    roleCardSelected: {
        borderColor: '#6C5CE7',
        backgroundColor: '#F5F3FF', // Very light purple
    },
    roleTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 4 },
    roleDesc: { fontSize: 13, color: '#6b7280', marginBottom: 12 },
    roleRate: { fontSize: 12, color: '#6C5CE7', fontWeight: '600', backgroundColor: '#EDE9FE', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#d1d5db', justifyContent: 'center', alignItems: 'center' },
    radioSelected: { borderColor: '#6C5CE7' },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#6C5CE7' },

    // Step 3 Extras
    uploadBox: {
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
        borderRadius: 12,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: '#f9fafb'
    },
    uploadCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    uploadText: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
    uploadSub: { fontSize: 12, color: '#9ca3af' },

    // Footer
    footer: {
        marginTop: 'auto',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 24,
        borderTopWidth: 1,
        borderColor: '#f3f4f6',
    },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 30, // Pill shape
    },
    btnPrimary: {
        backgroundColor: '#6C5CE7',
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    btnText: { color: 'white', fontWeight: '600', fontSize: 15 },
    btnBack: { padding: 12 },
    btnBackText: { color: '#6b7280', fontWeight: '600', fontSize: 15 },

    // Success
    successContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    successIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#6C5CE7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
    },
    successTitle: { fontSize: 28, fontWeight: '800', color: '#1f2937', marginBottom: 12 },
    successDesc: { fontSize: 16, color: '#6b7280' },
});

export default JobWizardScreen;
