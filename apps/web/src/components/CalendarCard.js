import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CalendarCard = () => {
    // Static calendar data for visualization
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const dates = [
        ['', '', 1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10, 11, 12],
        [13, 14, 15, 16, 17, 18, 19],
        [20, 21, 22, 23, 24, 25, 26],
        [27, 28, 29, 30, 31, '', ''],
    ];

    const today = 24;
    const maintenanceDays = [12, 18, 28]; // Sample highlight days

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>Maintenance Schedule</Text>
                <Text style={styles.month}>January 2026</Text>
            </View>

            <View style={styles.calendarGrid}>
                {/* Days Header */}
                <View style={styles.row}>
                    {days.map((d, i) => (
                        <Text key={i} style={styles.dayLabel}>{d}</Text>
                    ))}
                </View>

                {/* Dates */}
                {dates.map((week, wIndex) => (
                    <View key={wIndex} style={styles.row}>
                        {week.map((date, dIndex) => {
                            if (!date) return <View key={dIndex} style={styles.dateCell} />;

                            const isToday = date === today;
                            const isMaintenance = maintenanceDays.includes(date);

                            return (
                                <View key={dIndex} style={styles.dateCell}>
                                    <View style={[
                                        styles.dateBubble,
                                        isToday && styles.todayBubble,
                                        isMaintenance && styles.maintenanceBubble
                                    ]}>
                                        <Text style={[
                                            styles.dateText,
                                            isToday && styles.activeDateText,
                                            isMaintenance && styles.activeDateText
                                        ]}>{date}</Text>
                                    </View>
                                </View>
                            );
                        })}
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
        borderRadius: 18,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        height: '100%', // Match neighbor KPI column height if possible
        minHeight: 300,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    month: {
        fontSize: 14,
        color: '#64748b',
    },
    calendarGrid: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    dayLabel: {
        width: 30,
        textAlign: 'center',
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '500',
    },
    dateCell: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateBubble: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    todayBubble: {
        backgroundColor: '#3b82f6',
    },
    maintenanceBubble: {
        backgroundColor: '#f97316',
    },
    dateText: {
        fontSize: 12,
        color: '#334155',
    },
    activeDateText: {
        color: 'white',
        fontWeight: '600',
    },
});

export default CalendarCard;
