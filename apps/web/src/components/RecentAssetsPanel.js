import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Mock Data
const recentAssets = [
    { id: '1', name: 'MacBook Pro M2', assetId: 'AST-0092', company: 'Acme Corp', status: 'Assigned', date: '20 mins ago' },
    { id: '2', name: 'Dell XPS 15', assetId: 'AST-0091', company: 'Globex Inc', status: 'Available', date: '1 hour ago' },
    { id: '3', name: 'Herman Miller Chair', assetId: 'AST-0090', company: 'Acme Corp', status: 'Maintenance', date: '2 hours ago' },
    { id: '4', name: 'iPhone 15', assetId: 'AST-0089', company: 'Acme Corp', status: 'Assigned', date: '4 hours ago' },
    { id: '5', name: 'Samsung Monitor', assetId: 'AST-0088', company: 'Globex Inc', status: 'Available', date: '5 hours ago' },
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

const RecentAssetsPanel = ({ showCompany = true }) => {
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
                    {showCompany && <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Company</Text>}
                    <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Status</Text>
                    <Text style={[styles.cell, styles.headerCell, { flex: 1, textAlign: 'right' }]}>Added</Text>
                </View>

                {recentAssets.map((item, index) => (
                    <View key={item.id} style={[styles.row, index !== recentAssets.length - 1 && styles.borderBottom]}>
                        <View style={[styles.cell, { flex: 2, flexDirection: 'row', alignItems: 'center' }]}>
                            <View style={styles.iconBox}>
                                <MaterialCommunityIcons name="laptop" size={16} color="#3b82f6" />
                            </View>
                            <View>
                                <Text style={styles.cellTextPrimary}>{item.name}</Text>
                                <Text style={styles.cellTextSub}>{item.assetId}</Text>
                            </View>
                        </View>
                        {showCompany && <Text style={[styles.cell, styles.cellTextSecondary, { flex: 1 }]}>{item.company}</Text>}
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
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        flex: 1,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    link: {
        fontSize: 13,
        color: '#3b82f6',
        fontWeight: '600',
        cursor: 'pointer' // web only
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
        marginBottom: 8,
        paddingBottom: 12
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    cell: {
        // Flex handled inline
    },
    headerCell: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    cellTextPrimary: {
        fontSize: 14,
        fontWeight: '500',
        color: '#334155',
    },
    cellTextSub: {
        fontSize: 11,
        color: '#94a3b8',
    },
    cellTextSecondary: {
        fontSize: 13,
        color: '#64748b',
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

export default RecentAssetsPanel;
