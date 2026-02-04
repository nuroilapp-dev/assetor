import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Card, Text, Button, IconButton, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../api/client';
import AppLayout from '../components/AppLayout';
import AssetFormModal from '../components/AssetFormModal';

const AssetsScreen = ({ navigation }) => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const response = await api.get('/assets');
            setAssets(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAsset = async (newAsset) => {
        // Here you would typically post to the backend
        // await api.post('/assets', newAsset);
        console.log('Saving asset:', newAsset);
        setModalVisible(false);
        // An optimistic update or refetch would go here
    };

    const filteredAssets = assets.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.asset_code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AppLayout navigation={navigation} title="Asset Management">
            <View style={styles.container}>
                {/* Controls Header */}
                <View style={styles.controlsHeader}>
                    <View style={styles.searchWrapper}>
                        <MaterialCommunityIcons name="magnify" size={20} color="#64748b" style={styles.searchIcon} />
                        <TextInput
                            placeholder="Search assets, employees, departments..."
                            value={search}
                            onChangeText={setSearch}
                            style={styles.searchInput}
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                            console.log('Add Asset Pressed');
                            setModalVisible(true);
                        }}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="plus" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.addButtonText}>Add Asset</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#3b82f6" />
                    </View>
                ) : filteredAssets.length === 0 ? (
                    /* Empty State UI */
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconCircle}>
                            <MaterialCommunityIcons name="package-variant" size={48} color="#94a3b8" />
                        </View>
                        <Text style={styles.emptyTitle}>No assets found</Text>
                        <Text style={styles.emptySubtitle}>
                            {search
                                ? `No results matching "${search}"`
                                : "You haven't added any assets yet. Click the button above to get started."}
                        </Text>
                        {search.length > 0 && (
                            <Button mode="text" onPress={() => setSearch('')} textColor="#3b82f6">
                                Clear Search
                            </Button>
                        )}
                    </View>
                ) : (
                    /* Asset Grid */
                    <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
                        <View style={styles.grid}>
                            {filteredAssets.map(asset => (
                                <Card key={asset.id} style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.iconBox}>
                                            <MaterialCommunityIcons name="laptop" size={24} color="#3b82f6" />
                                        </View>
                                        <IconButton icon="dots-horizontal" size={20} iconColor="#94a3b8" />
                                    </View>

                                    <View style={styles.cardContent}>
                                        <Text style={styles.assetName} numberOfLines={1}>{asset.name}</Text>
                                        <Text style={styles.assetCode}>{asset.asset_code}</Text>

                                        <View style={styles.divider} />

                                        <View style={styles.cardFooter}>
                                            <View style={[
                                                styles.statusBadge,
                                                { backgroundColor: asset.status === 'AVAILABLE' ? '#dcfce7' : '#ffedd5' }
                                            ]}>
                                                <Text style={{
                                                    color: asset.status === 'AVAILABLE' ? '#166534' : '#9a3412',
                                                    fontSize: 11,
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                }}>
                                                    {asset.status}
                                                </Text>
                                            </View>
                                            <Text style={styles.brandText}>{asset.brand}</Text>
                                        </View>
                                    </View>
                                </Card>
                            ))}
                        </View>
                    </ScrollView>
                )}

                <AssetFormModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSave={handleSaveAsset}
                />
            </View>
        </AppLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        padding: 24,
    },
    controlsHeader: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 16,
    },
    searchWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingHorizontal: 16,
        height: 48,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#1e293b',
        outlineStyle: 'none',
        height: '100%',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3b82f6',
        paddingHorizontal: 20,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    addButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        maxWidth: 300,
        marginBottom: 24,
    },
    list: {
        paddingBottom: 40,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
    },
    card: {
        width: '31%',
        minWidth: 280,
        backgroundColor: 'white',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 0,
        backgroundColor: 'white',
        shadowColor: "#64748b",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4,
    },
    cardContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    assetName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    assetCode: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    brandText: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    }
});

export default AssetsScreen;
