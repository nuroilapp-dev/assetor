import React from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import AppLayout from '../../components/AppLayout';
import KpiCard from '../../components/KpiCard';
import AssetStatusOverviewChart from '../../components/AssetStatusOverviewChart';
import RecentAssetsPanel from '../../components/RecentAssetsPanel';

const SuperAdminDashboard = ({ navigation }) => {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 1024;

    return (
        <AppLayout navigation={navigation}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>

                    {/* 1. KPI Row (4 Cards) */}
                    <View style={styles.kpiRow}>
                        <KpiCard
                            title="Total Assets"
                            value="4,250"
                            icon="package-variant"
                            gradientColors={['#3b82f6', '#2563eb']}
                        />
                        <KpiCard
                            title="Assigned"
                            value="3,100"
                            icon="account-check"
                            gradientColors={['#10b981', '#059669']} // Green
                        />
                        <KpiCard
                            title="Available"
                            value="850"
                            icon="cube-outline"
                            gradientColors={['#8b5cf6', '#7c3aed']} // Purple
                        />
                        <KpiCard
                            title="Maintenance"
                            value="300"
                            icon="wrench-clock"
                            gradientColors={['#f59e0b', '#d97706']} // Amber
                        />
                    </View>

                    {/* 2. Main Content Grid */}
                    <View style={[styles.grid, !isDesktop && styles.gridStack]}>
                        {/* Left: Chart */}
                        <View style={[styles.gridItem, { flex: 1.5 }]}>
                            <AssetStatusOverviewChart />
                        </View>

                        {/* Right: Recent Assets */}
                        <View style={[styles.gridItem, { flex: 1 }]}>
                            <RecentAssetsPanel showCompany={true} />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </AppLayout>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 40,
    },
    container: {
        flex: 1,
        gap: 32,
    },
    kpiRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
    },
    grid: {
        flexDirection: 'row',
        gap: 24,
    },
    gridStack: {
        flexDirection: 'column',
    },
    gridItem: {
        minWidth: 300,
    }
});

export default SuperAdminDashboard;
