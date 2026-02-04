import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
    { name: 'Laptop', count: 120 },
    { name: 'Phone', count: 80 },
    { name: 'Monitor', count: 45 },
    { name: 'Accessory', count: 60 },
    { name: 'Server', count: 20 },
];

const CategoryBarChart = () => {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>Assets by Category</Text>
            <View style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data}>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                            interval={0}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ backgroundColor: 'rgba(50,50,50,0.9)', borderRadius: 8, border: 'none', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 4, 4]} barSize={20}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
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
        flex: 1,
        marginRight: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 16,
    },
    chartContainer: {
        width: '100%',
        height: 200,
        ...(Platform.OS === 'web' ? { display: 'block' } : {}),
    },
});

export default CategoryBarChart;
