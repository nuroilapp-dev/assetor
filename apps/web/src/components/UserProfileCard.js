import React from 'react';
import { View, StyleSheet, Image, Platform } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const UserProfileCard = () => {
    return (
        <Card style={styles.card}>
            <View style={styles.content}>
                <View style={styles.avatarContainer}>
                    {/* Placeholder for Avatar */}
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>AS</Text>
                    </View>
                    <View style={styles.onlineBadge} />
                </View>

                <View style={styles.info}>
                    <Text style={styles.name}>Alexandra Smith</Text>
                    <Text style={styles.role}>Asset Manager</Text>
                </View>

                <View style={styles.actions}>
                    <MaterialCommunityIcons name="cog-outline" size={20} color="#94a3b8" />
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: "#64748b",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#10b981', // Green
        borderWidth: 2,
        borderColor: 'white',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    role: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    actions: {
        padding: 8,
    }
});

export default UserProfileCard;
