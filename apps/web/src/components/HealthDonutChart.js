import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Healthy', value: 75 },
    { name: 'Issues', value: 25 },
];
const COLORS = ['#3b82f6', '#e2e8f0'];

const HealthDonutChart = () => {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>Asset Health</Text>
            <View style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            fill="#8884d8"
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                            startAngle={90}
                            endAngle={-270}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <View style={styles.centerTextContainer}>
                    <Text style={styles.centerValue}>75%</Text>
                    <Text style={styles.centerLabel}>Good</Text>
                </View>
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
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    chartContainer: {
        width: '100%',
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        ...(Platform.OS === 'web' ? { display: 'block' } : {}),
    },
    centerTextContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    centerLabel: {
        fontSize: 12,
        color: '#64748b',
    },
});

export default HealthDonutChart;
