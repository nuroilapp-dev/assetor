import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';

const AreaChartCard = () => {
    // Simulated smooth curve using multiple views for visual effect
    // In a real app with dependencies, we would use react-native-svg or recharts
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>Asset Usage Trend</Text>
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: '#3b82f6' }]} />
                        <Text style={styles.legendText}>Usage</Text>
                    </View>
                </View>
            </View>

            <View style={styles.chartContainer}>
                {/* Grid Lines */}
                {[0, 1, 2, 3].map((i) => (
                    <View key={i} style={[styles.gridLine, { bottom: i * 50 }]} />
                ))}

                {/* Simulated Wave using Bars for robustness without SVG */}
                <View style={styles.waveContainer}>
                    {[40, 65, 55, 80, 60, 95, 75, 85, 65, 50, 70, 90].map((height, index) => (
                        <View
                            key={index}
                            style={[
                                styles.bar,
                                {
                                    height: `${height}%`,
                                    backgroundColor: '#3b82f6',
                                    opacity: 0.2 + (index / 20), // Gradient effect
                                }
                            ]}
                        />
                    ))}
                </View>

                {/* X-Axis Labels */}
                <View style={styles.xAxis}>
                    <Text style={styles.axisLabel}>Jan</Text>
                    <Text style={styles.axisLabel}>Feb</Text>
                    <Text style={styles.axisLabel}>Mar</Text>
                    <Text style={styles.axisLabel}>Apr</Text>
                    <Text style={styles.axisLabel}>May</Text>
                    <Text style={styles.axisLabel}>Jun</Text>
                </View>
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
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    legend: {
        flexDirection: 'row',
        gap: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 12,
        color: '#64748b',
    },
    chartContainer: {
        height: 250,
        position: 'relative',
        justifyContent: 'flex-end',
    },
    gridLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#f1f5f9',
    },
    waveContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: '100%',
        paddingBottom: 30, // Space for axis
        paddingHorizontal: 10,
    },
    bar: {
        flex: 1,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        marginHorizontal: 2,
    },
    xAxis: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    axisLabel: {
        fontSize: 12,
        color: '#94a3b8',
    },
});

export default AreaChartCard;
