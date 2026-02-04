import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const DonutChartCard = () => {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>Asset Health Score</Text>
            <View style={styles.chartContainer}>
                {/* CSS/View based Donut Chart */}
                <View style={styles.donutContainer}>
                    <View style={[styles.donutSegment, styles.segment1]} />
                    <View style={[styles.donutSegment, styles.segment2]} />

                    {/* Inner Circle to make it a donut */}
                    <View style={styles.innerCircle}>
                        <Text style={styles.scoreText}>75%</Text>
                        <Text style={styles.statusText}>Healthy</Text>
                    </View>
                </View>
            </View>

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
                    <Text style={styles.legendText}>Good</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: '#f59e0b' }]} />
                    <Text style={styles.legendText}>Repair</Text>
                </View>
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
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        alignSelf: 'flex-start',
        marginBottom: 24,
    },
    chartContainer: {
        position: 'relative',
        width: 160,
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    donutContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 16,
        borderColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    segment1: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 16,
        borderColor: '#10b981',
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent',
        transform: [{ rotate: '-45deg' }],
    },
    segment2: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 16,
        borderColor: '#10b981',
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent',
        transform: [{ rotate: '45deg' }],
        opacity: 0.8,
    },
    innerCircle: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        zIndex: 10,
    },
    scoreText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    statusText: {
        fontSize: 12,
        color: '#10b981',
        fontWeight: '600',
        marginTop: 4,
    },
    legend: {
        flexDirection: 'row',
        gap: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 12,
        color: '#64748b',
    },
});

export default DonutChartCard;
