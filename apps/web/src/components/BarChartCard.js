import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const BarChartCard = () => {
    const data = [
        { label: 'IT', value: 85, color: '#3b82f6' },
        { label: 'HR', value: 45, color: '#f97316' },
        { label: 'Ops', value: 65, color: '#10b981' },
        { label: 'Sales', value: 30, color: '#8b5cf6' },
    ];

    return (
        <View style={styles.card}>
            <Text style={styles.title}>Assets by Category</Text>
            <View style={styles.chartContainer}>
                {data.map((item, index) => (
                    <View key={index} style={styles.barGroup}>
                        <View style={styles.barBackground}>
                            <View
                                style={[
                                    styles.bar,
                                    {
                                        height: `${item.value}%`,
                                        backgroundColor: item.color
                                    }
                                ]}
                            />
                        </View>
                        <Text style={styles.label}>{item.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        minHeight: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 24,
    },
    chartContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        paddingBottom: 10,
    },
    barGroup: {
        alignItems: 'center',
        height: '100%',
        justifyContent: 'flex-end',
        gap: 12,
        flex: 1,
    },
    barBackground: {
        width: 12,
        height: '80%',
        backgroundColor: '#f1f5f9',
        borderRadius: 6,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    bar: {
        width: '100%',
        borderRadius: 6,
    },
    label: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
});

export default BarChartCard;
