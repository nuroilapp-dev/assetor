import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppLayout from '../components/AppLayout';

// A Clean Placeholder Screen for any module
const PlaceholderScreen = ({ navigation, title, icon, actionLabel }) => {
    return (
        <AppLayout navigation={navigation}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>Manage your {title.toLowerCase()} here</Text>
                    </View>
                    {actionLabel && (
                        <TouchableOpacity style={styles.actionButton}>
                            <MaterialCommunityIcons name="plus" size={20} color="white" />
                            <Text style={styles.actionButtonText}>{actionLabel}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Search / Filter Row */}
                <View style={styles.filterRow}>
                    <View style={styles.searchBox}>
                        <MaterialCommunityIcons name="magnify" size={20} color="#94a3b8" />
                        <TextInput
                            placeholder={`Search ${title}...`}
                            style={styles.input}
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                    <TouchableOpacity style={styles.filterButton}>
                        <MaterialCommunityIcons name="filter-variant" size={20} color="#64748b" />
                        <Text style={styles.filterText}>Filter</Text>
                    </TouchableOpacity>
                </View>

                {/* Empty State / Content Placeholder */}
                <View style={styles.content}>
                    <View style={styles.emptyState}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name={icon || 'folder-open-outline'} size={48} color="#cbd5e1" />
                        </View>
                        <Text style={styles.emptyTitle}>No records found</Text>
                        <Text style={styles.emptySub}>Get started by creating a new record.</Text>
                    </View>
                </View>
            </View>
        </AppLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3b82f6',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    actionButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 12,
    },
    searchBox: {
        flex: 1,
        maxWidth: 400,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 44,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    input: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#1e293b',
        outlineStyle: 'none'
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        height: 44,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 8,
    },
    filterText: {
        color: '#64748b',
        fontWeight: '500',
    },
    content: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 400,
    },
    emptyState: {
        alignItems: 'center',
    },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 4,
    },
    emptySub: {
        fontSize: 14,
        color: '#94a3b8',
    }
});

export default PlaceholderScreen;
