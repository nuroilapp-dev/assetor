import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Modal } from 'react-native-paper';
import useAuthStore from '../store/authStore';
import api from '../api/client';
import SuperAdminDashboard from './dashboard/SuperAdminDashboard';
import CompanyAdminDashboard from './dashboard/CompanyAdminDashboard';
import { ModuleTemplatesContent, NewConfigurationForm } from './modules/ModuleTemplatesScreen';

const DashboardScreen = ({ navigation, route }) => {
    const user = useAuthStore((state) => state.user);
    const role = user?.role || 'EMPLOYEE';

    const renderDashboard = () => {
        if (role === 'SUPER_ADMIN') {
            return <SuperAdminDashboard navigation={navigation} />;
        }
        return <CompanyAdminDashboard navigation={navigation} />;
    };

    return (
        <View style={{ flex: 1 }}>
            {renderDashboard()}
        </View>
    );
};

const styles = StyleSheet.create({});

export default DashboardScreen;
