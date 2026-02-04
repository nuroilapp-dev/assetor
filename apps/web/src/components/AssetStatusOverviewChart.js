import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
// Recharts only works on Web. 
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Mon', available: 200, assigned: 150, maintenance: 20 },
    { name: 'Tue', available: 180, assigned: 160, maintenance: 30 },
    { name: 'Wed', available: 190, assigned: 155, maintenance: 25 },
    { name: 'Thu', available: 170, assigned: 180, maintenance: 20 },
    { name: 'Fri', available: 150, assigned: 200, maintenance: 20 },
    { name: 'Sat', available: 160, assigned: 190, maintenance: 20 },
    { name: 'Sun', available: 180, assigned: 170, maintenance: 20 },
];

const AssetStatusOverviewChart = () => {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>Asset Status Overview</Text>
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: '#3b82f6' }]} />
                        <Text style={styles.legendText}>Assigned</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
                        <Text style={styles.legendText}>Available</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: '#f59e0b' }]} />
                        <Text style={styles.legendText}>Maintenance</Text>
                    </View>
                </View>
            </View>
            <View style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorAssigned" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorAvailable" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorMaintenance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="assigned"
                            stackId="1"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorAssigned)"
                        />
                        <Area
                            type="monotone"
                            dataKey="available"
                            stackId="1"
                            stroke="#10b981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorAvailable)"
                        />
                        <Area
                            type="monotone"
                            dataKey="maintenance"
                            stackId="1"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorMaintenance)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
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
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    chartContainer: {
        width: '100%',
        minHeight: 300,
        ...(Platform.OS === 'web' ? { display: 'block' } : {}),
    },
    legend: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    dot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 12, color: '#64748b' },
});

export default AssetStatusOverviewChart;
