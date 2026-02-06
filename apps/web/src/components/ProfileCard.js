import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useAuthStore from '../store/authStore';

const ProfileCard = () => {
    const user = useAuthStore((state) => state.user);
    const role = user?.role === 'SUPER_ADMIN' ? 'Superadmin' : (user?.role?.replace('_', ' ') || 'User');

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>Profile</Text>
                <TouchableOpacity>
                    <MaterialCommunityIcons name="dots-horizontal" size={20} color="#94a3b8" />
                </TouchableOpacity>
            </View>

            <View style={styles.profileBody}>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }}
                    style={styles.avatar}
                />
                <Text style={styles.name}>{user?.name || 'TRakio Admin'}</Text>
                <Text style={styles.role}>{role || 'COMPANY ADMIN'}</Text>

                <View style={styles.stats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>125</Text>
                        <Text style={styles.statLabel}>Items</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>4</Text>
                        <Text style={styles.statLabel}>Teams</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Edit Profile</Text>
                </TouchableOpacity>
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
        minWidth: 200,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    profileBody: {
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 12,
        borderWidth: 3,
        borderColor: '#eff6ff',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    role: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 16,
    },
    stats: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        width: '100%',
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    statLabel: {
        fontSize: 11,
        color: '#94a3b8',
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: '#e2e8f0',
    },
    button: {
        width: '100%',
        paddingVertical: 10,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#475569',
        fontSize: 13,
        fontWeight: '500',
    }
});

export default ProfileCard;
