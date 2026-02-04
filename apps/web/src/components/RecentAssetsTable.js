import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const assets = [
    { id: '1', name: 'MacBook Pro M2', user: 'Alex S.', status: 'Assigned', date: 'Oct 24, 2025' },
    { id: '2', name: 'Dell XPS 15', user: 'Maria G.', status: 'Available', date: 'Oct 22, 2025' },
    { id: '3', name: 'iPhone 14', user: 'Sales Dept', status: 'Maintenance', date: 'Oct 20, 2025' },
    { id: '4', name: 'Sony Monitor', user: 'Design Team', status: 'Assigned', date: 'Oct 19, 2025' },
];

const StatusPill = ({ status }) => {
    let bg, color;
    switch (status) {
        case 'Assigned': bg = '#dbeafe'; color = '#1e40af'; break; // Blue
        case 'Available': bg = '#dcfce7'; color = '#15803d'; break; // Green
        case 'Maintenance': bg = '#fee2e2'; color = '#b91c1c'; break; // Red
        default: bg = '#f1f5f9'; color = '#475569';
    }
    return (
        <View style={[styles.pill, { backgroundColor: bg }]}>
            <Text style={[styles.pillText, { color }]}>{status}</Text>
        </View>
    );
};

const RecentAssetsTable = () => {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>Recent Assets</Text>
                <Text style={styles.link}>View All</Text>
            </View>
            <View style={styles.table}>
                {/* Table Header */}
                <View style={[styles.row, styles.headerRow]}>
                    <Text style={[styles.cell, styles.headerCell, { flex: 2 }]}>Asset Name</Text>
                    <Text style={[styles.cell, styles.headerCell, { flex: 1.5 }]}>User</Text>
                    <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Status</Text>
                    <Text style={[styles.cell, styles.headerCell, { flex: 1, textAlign: 'right' }]}>Date</Text>
                </View>

                {assets.map((item, index) => (
                    <View key={item.id} style={[styles.row, index !== assets.length - 1 && styles.borderBottom]}>
                        <View style={[styles.cell, { flex: 2, flexDirection: 'row', alignItems: 'center' }]}>
                            <View style={styles.iconBox}>
                                <MaterialCommunityIcons name="laptop" size={16} color="#3b82f6" />
                            </View>
                            <Text style={styles.cellTextPrimary}>{item.name}</Text>
                        </View>
                        <Text style={[styles.cell, styles.cellTextSecondary, { flex: 1.5 }]}>{item.user}</Text>
                        <View style={[styles.cell, { flex: 1 }]}>
                            <StatusPill status={item.status} />
                        </View>
                        <Text style={[styles.cell, styles.cellTextSecondary, { flex: 1, textAlign: 'right' }]}>{item.date}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 18,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        flex: 1, // Take available space
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    link: {
        fontSize: 14,
        color: '#3b82f6',
        fontWeight: '500',
    },
    table: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    headerRow: {
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        marginBottom: 4,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    cell: {
        // Flex handled inline
    },
    headerCell: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    cellTextPrimary: {
        fontSize: 14,
        fontWeight: '500',
        color: '#334155',
    },
    cellTextSecondary: {
        fontSize: 13,
        color: '#64748b',
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    pill: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    pillText: {
        fontSize: 11,
        fontWeight: '600',
    },
});

export default RecentAssetsTable;
