import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useAuthStore from '../store/authStore';
import OfficeSelectorModal from './modals/OfficeSelectorModal';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5032/api';

const Sidebar = ({ activeRoute = 'Dashboard', navigation }) => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const userRole = user?.role || 'EMPLOYEE';

    // State
    const [collapsedGroups, setCollapsedGroups] = useState({});
    const [officeSelectorVisible, setOfficeSelectorVisible] = useState(false);
    // Derived state
    const activeModules = (userRole === 'SUPER_ADMIN')
        ? ['dashboard', 'assets', 'premises', 'employees', 'maintenance', 'reports', 'premises_display', 'module', 'module_sections', 'sub_modules']
        : (user?.enabled_modules && Array.isArray(user.enabled_modules) && user.enabled_modules.length > 0)
            ? user.enabled_modules
            : ['dashboard', 'assets', 'employees', 'premises', 'maintenance', 'reports']; // Fallback

    // Debug
    console.log('[Sidebar] Active Modules:', activeModules);

    const toggleGroup = (groupName) => {
        setCollapsedGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

    const handleOfficeSelect = (route) => {
        setOfficeSelectorVisible(false);
        // Pass params to trigger wizard open
        // navigation.navigate(route, { openWizard: true }); // Incorrect in revert req - should navigate to list page
        navigation.navigate(route);
    };

    // Menu Item Click Handler
    const handleMenuPress = (key) => {
        if (key === 'OfficeSelector') {
            setOfficeSelectorVisible(true);
        } else {
            navigation && navigation.navigate(key);
        }
    };

    const menuGroups = [
        {
            title: null,
            items: [
                { key: 'Dashboard', label: 'Dashboard', icon: 'view-dashboard-outline', roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'EMPLOYEE'] },
                { key: 'SuperadminDashboard', label: 'Control Center', icon: 'shield-crown-outline', roles: ['SUPER_ADMIN'] },
            ]
        },
        {
            title: 'Platform Management',
            key: 'platform',
            roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'],
            items: [
                { key: 'Companies', label: 'Companies', icon: 'domain', roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'] },
                { key: 'Settings', label: 'Platform Settings', icon: 'cog-outline', roles: ['SUPER_ADMIN'] },
            ]
        },
        {
            title: 'Custom Modules',
            key: 'module_builder',
            roles: ['COMPANY_ADMIN', 'SUPER_ADMIN'],
            items: [
                { key: 'ModulesHome', label: 'Module', icon: 'layers-outline', roles: ['COMPANY_ADMIN', 'SUPER_ADMIN'] },
                { key: 'ModuleSections', label: 'Module sections', icon: 'view-grid-plus-outline', roles: ['COMPANY_ADMIN', 'SUPER_ADMIN'] },
                { key: 'SubModules', label: 'Sub-modules', icon: 'file-tree-outline', roles: ['COMPANY_ADMIN', 'SUPER_ADMIN'] },
            ]

        },
        {
            title: 'Operations',
            key: 'operations',
            roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'EMPLOYEE'],
            items: [
                { key: 'AssetDisplay', label: 'Premises display', icon: 'monitor-dashboard', roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'] },
                { key: 'Employees', label: 'Staff members', icon: 'account-group-outline', roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'] },
            ]
        },

    ];

    // Helper function to check if module is enabled
    const isModuleEnabled = (moduleKey) => {
        // Super admin sees everything
        if (userRole === 'SUPER_ADMIN') return true;

        // Module mapping: sidebar keys to module_master names (or enabled_modules keys)
        const moduleMapping = {
            'Dashboard': 'dashboard',
            'AssetDisplay': 'premises_display',
            'Employees': 'employees',
            'Maintenance': 'maintenance',
            'Reports': 'reports',
            'ModulesHome': 'module',
            'ModuleSections': 'module_sections',
            'SubModules': 'sub_modules',
            'Companies': 'dashboard', // Usually basic access
            'Settings': 'dashboard' // Usually basic access
        };


        // Always allow certain management pages
        const alwaysEnabled = ['Dashboard', 'Companies', 'Settings', 'SuperadminDashboard'];
        if (alwaysEnabled.includes(moduleKey)) return true;

        // Check if module is in the enabled list
        const moduleName = moduleMapping[moduleKey];
        if (!moduleName) return false; // Unknown module, hide it

        return activeModules.includes(moduleName);
    };

    const handleLogout = async () => {
        await logout();
    };

    return (
        <View style={styles.container}>
            {/* 1. Logo Section */}
            <View style={styles.logoSection}>
                <View style={styles.logoIcon}>
                    <MaterialCommunityIcons name="cube-scan" size={24} color="#3b82f6" />
                </View>
                <View>
                    <Text style={styles.appName}>TRakio</Text>
                    <Text style={styles.appSubtitle}>Asset Platform</Text>
                </View>
            </View>

            {/* 2. Sidebar User Block */}
            <View style={styles.userBlock}>
                <View style={styles.avatar}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }}
                        style={{ width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: '#eff6ff' }}
                    />
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user?.name || 'TRakio Admin'}</Text>
                    <Text style={styles.userRole}>
                        {userRole === 'SUPER_ADMIN' ? 'Superadmin' : userRole.replace('_', ' ')}
                    </Text>
                </View>
            </View>

            <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
                {menuGroups.map((group, groupIndex) => {
                    // Check if user has role for ANY item in this group or the group itself
                    if (group.roles && !group.roles.includes(userRole) && userRole !== 'SUPER_ADMIN') return null;

                    const visibleItems = group.items.filter(item =>
                        (item.roles.includes(userRole) || userRole === 'SUPER_ADMIN') &&
                        isModuleEnabled(item.key) // Check if module is enabled
                    );

                    if (visibleItems.length === 0) return null;

                    const isCollapsed = collapsedGroups[group.key];

                    return (
                        <View key={groupIndex} style={styles.groupContainer}>
                            {group.title && (
                                <TouchableOpacity
                                    style={styles.groupHeader}
                                    onPress={() => group.key && toggleGroup(group.key)}
                                    activeOpacity={0.7}
                                    disabled={!group.key}
                                >
                                    <Text style={styles.groupTitle}>
                                        {group.key === 'platform' && userRole !== 'SUPER_ADMIN' ? 'Group Management' : group.title}
                                    </Text>
                                    {group.key && (
                                        <MaterialCommunityIcons
                                            name={isCollapsed ? "chevron-right" : "chevron-down"}
                                            size={16}
                                            color="#94a3b8"
                                        />
                                    )}
                                </TouchableOpacity>
                            )}

                            {!isCollapsed && visibleItems.map((item) => {
                                // Enhanced active check
                                let isActive = item.key === activeRoute;

                                return (
                                    <TouchableOpacity
                                        key={item.key}
                                        style={[styles.menuItem, isActive && styles.activeMenuItem]}
                                        onPress={() => handleMenuPress(item.key)}
                                    >
                                        <MaterialCommunityIcons
                                            name={item.icon}
                                            size={20}
                                            color={isActive ? '#3b82f6' : '#64748b'}
                                            style={{ marginRight: 12 }}
                                        />
                                        <Text style={[styles.menuLabel, isActive && styles.activeMenuLabel]}>
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    );
                })}
            </ScrollView>

            {/* 4. Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <MaterialCommunityIcons name="logout" size={20} color="#ef4444" style={{ marginRight: 12 }} />
                <Text style={styles.logoutLabel}>Logout</Text>
            </TouchableOpacity>
            {/* 5. Modals */}
            <OfficeSelectorModal
                visible={officeSelectorVisible}
                onClose={() => setOfficeSelectorVisible(false)}
                onSelect={handleOfficeSelect}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 260,
        backgroundColor: 'white',
        height: '100%',
        borderRightWidth: 1,
        borderRightColor: 'rgba(0,0,0,0.06)',
        paddingVertical: 24,
        paddingHorizontal: 16,
    },
    logoSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        paddingHorizontal: 8,
    },
    logoIcon: {
        width: 40,
        height: 40,
        backgroundColor: '#eff6ff',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    appName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    appSubtitle: {
        fontSize: 12,
        color: '#94a3b8',
    },
    userBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        marginBottom: 24,
    },
    avatar: {
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    },
    userRole: {
        fontSize: 11,
        color: '#64748b',
        textTransform: 'uppercase',
    },
    menuContainer: {
        flex: 1,
    },
    groupContainer: {
        marginBottom: 24,
    },
    groupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 12,
    },
    groupTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginBottom: 2,
        borderRadius: 8,
    },
    activeMenuItem: {
        backgroundColor: '#eff6ff',
    },
    menuLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    activeMenuLabel: {
        color: '#3b82f6',
        fontWeight: '600',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 8,
        borderRadius: 8,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9'
    },
    logoutLabel: {
        fontSize: 14,
        color: '#ef4444',
        fontWeight: '600',
    },
});

export default Sidebar;
