import React from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import AppLayout from '../../components/AppLayout';
import KpiCard from '../../components/KpiCard';
import UsageTrendAreaChart from '../../components/UsageTrendAreaChart';
import CategoryBarChart from '../../components/CategoryBarChart';
import HealthDonutChart from '../../components/HealthDonutChart';
import RecentAssetsTable from '../../components/RecentAssetsTable';
import ProfileCard from '../../components/ProfileCard';
import CalendarCard from '../../components/CalendarCard';

const CompanyAdminDashboard = ({ navigation }) => {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 1200;

    return (
        <AppLayout navigation={navigation}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.gridContainer, isDesktop ? styles.gridDesktop : styles.gridMobile]}>

                    {/* LEFT MAIN COLUMN */}
                    <View style={styles.mainColumn}>

                        {/* 1. KPI Row (3 Cards - Specific Visuals) */}
                        <View style={styles.kpiRow}>
                            <KpiCard
                                title="Total Assets"
                                value="1,205" // Mock company scoped
                                icon="cube-outline"
                                gradientColors={['#3b82f6', '#2563eb']}
                                iconBg="rgba(255,255,255,0.2)"
                            />
                            <KpiCard
                                title="Assigned Assets"
                                value="950"
                                icon="account-check-outline"
                                gradientColors={['#6366f1', '#4f46e5']} // Indigo
                                iconBg="rgba(255,255,255,0.2)"
                            />
                            <KpiCard
                                title="Available Assets"
                                value="150"
                                icon="cube-send"
                                gradientColors={['#f59e0b', '#d97706']} // Amber
                                iconBg="rgba(255,255,255,0.2)"
                            />
                        </View>

                        {/* 2. Usage Trend Chart (Area Chart) */}
                        <View style={styles.section}>
                            <UsageTrendAreaChart />
                        </View>

                        {/* 3. Bottom Row: Bar, Donut, Recent Table */}
                        <View style={styles.bottomRow}>
                            <View style={[styles.bottomCardWrapper, { flex: 1.2 }]}>
                                <CategoryBarChart />
                            </View>
                            <View style={[styles.bottomCardWrapper, { flex: 0.8 }]}>
                                <HealthDonutChart />
                            </View>
                            <View style={[styles.bottomCardWrapper, { flex: 2 }]}>
                                {/* Recent Assets without Company Column */}
                                <RecentAssetsTable />
                            </View>
                        </View>
                    </View>

                    {/* RIGHT SIDEBAR COLUMN */}
                    <View style={styles.rightColumn}>
                        {/* Profile Card */}
                        <View style={styles.rightCardWrapper}>
                            <ProfileCard />
                        </View>

                        {/* Maintenance Calendar */}
                        <View style={[styles.rightCardWrapper, { flex: 1 }]}>
                            <CalendarCard />
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
    gridContainer: {
        flex: 1,
        gap: 24,
    },
    gridDesktop: {
        flexDirection: 'row',
    },
    gridMobile: {
        flexDirection: 'column',
    },
    mainColumn: {
        flex: 3,
        flexDirection: 'column',
        gap: 24,
    },
    rightColumn: {
        flex: 1,
        minWidth: 300,
        flexDirection: 'column',
        gap: 24,
    },
    kpiRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    section: {
        width: '100%',
    },
    bottomRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    bottomCardWrapper: {
        minWidth: 250,
    },
    rightCardWrapper: {
        width: '100%',
    }
});

export default CompanyAdminDashboard;
