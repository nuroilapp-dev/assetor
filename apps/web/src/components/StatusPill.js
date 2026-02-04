import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const StatusPill = ({ status }) => {
    const getStatusStyle = () => {
        switch (status?.toUpperCase()) {
            case 'ASSIGNED':
                return { bg: '#dbeafe', color: '#1e40af' };
            case 'AVAILABLE':
                return { bg: '#d1fae5', color: '#065f46' };
            case 'MAINTENANCE':
                return { bg: '#fed7aa', color: '#9a3412' };
            default:
                return { bg: '#f1f5f9', color: '#475569' };
        }
    };

    const style = getStatusStyle();

    return (
        <View style={[styles.pill, { backgroundColor: style.bg }]}>
            <Text style={[styles.text, { color: style.color }]}>
                {status || 'Unknown'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    pill: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: 12,
        fontWeight: '600',
    },
});

export default StatusPill;
