import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BaseModal from './BaseModal';

const EmployeeDetailsModal = ({ visible, onClose, employee }) => {
    if (!employee) return null;

    const InfoRow = ({ label, value, icon, color = "#64748b" }) => (
        <View style={styles.infoRow}>
            <View style={[styles.iconCircle, { backgroundColor: `${color}10` }]}>
                <MaterialCommunityIcons name={icon} size={18} color={color} />
            </View>
            <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || 'N/A'}</Text>
            </View>
        </View>
    );

    const Section = ({ title, icon, children }) => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name={icon} size={20} color="#3b82f6" />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <View style={styles.sectionContent}>
                {children}
            </View>
        </View>
    );

    return (
        <BaseModal visible={visible} onClose={onClose} title="Employee Profile" width={500}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header Information */}
                <View style={styles.header}>
                    <View style={styles.avatarBox}>
                        <Text style={styles.avatarText}>{employee.name?.[0]}</Text>
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.empName}>{employee.name}</Text>
                        <Text style={styles.empPos}>{employee.position || 'Employee'}</Text>
                        <View style={styles.idBadge}>
                            <MaterialCommunityIcons name="card-account-details-outline" size={12} color="#64748b" />
                            <Text style={styles.idText}>{employee.employee_id_card || 'No ID'}</Text>
                        </View>
                    </View>
                </View>

                {/* Contact Information */}
                <Section title="Contact Details" icon="account-box-outline">
                    <InfoRow label="Email Address" value={employee.email} icon="email-outline" color="#3b82f6" />
                    <InfoRow label="Phone Number" value={employee.phone} icon="phone-outline" color="#10b981" />
                </Section>

                {/* Work Information */}
                <Section title="Work Information" icon="briefcase-outline">
                    <InfoRow label="Department" value={employee.department_name || 'General'} icon="office-building-marker-outline" color="#6366f1" />
                    <InfoRow label="Position" value={employee.position} icon="account-tie-outline" color="#f59e0b" />
                    <InfoRow label="Company" value={employee.company_name} icon="domain" color="#0ea5e9" />
                </Section>

                {/* Footer / Meta */}
                <View style={styles.footer}>
                    <Text style={styles.metaText}>Employee ID: {employee.id}</Text>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
        </BaseModal>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    avatarBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    avatarText: { fontSize: 20, fontWeight: '800', color: 'white' },
    headerText: { marginLeft: 16, flex: 1 },
    empName: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
    empPos: { fontSize: 13, color: '#64748b', marginTop: 1, fontWeight: '600' },
    idBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 6,
        alignSelf: 'flex-start',
    },
    idText: { fontSize: 10, fontWeight: '700', color: '#64748b', marginLeft: 4 },
    section: { marginBottom: 16 },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1e293b',
        marginLeft: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionContent: { paddingLeft: 2 },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconCircle: {
        width: 28,
        height: 28,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoTextContainer: { marginLeft: 12 },
    infoLabel: { fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' },
    infoValue: { fontSize: 13, fontWeight: '600', color: '#334155', marginTop: 0 },
    footer: {
        marginTop: 4,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        alignItems: 'center',
    },
    metaText: { fontSize: 11, color: '#cbd5e1', fontWeight: '500' },
});

export default EmployeeDetailsModal;
