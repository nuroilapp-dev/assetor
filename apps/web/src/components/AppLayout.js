import React from 'react';
import { View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppLayout = ({ children, navigation }) => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    return (
        <View style={styles.container}>
            {/* Fixed Sidebar for Desktop */}
            {!isMobile && (
                <View style={styles.sidebarWrapper}>
                    <Sidebar navigation={navigation} />
                </View>
            )}

            {/* Main Content */}
            <View style={styles.mainWrapper}>
                <Topbar />
                <View style={styles.contentArea}>
                    {children}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#F5F8FF', // Light blue background
        height: '100%',
        overflow: 'hidden', // Prevent body scroll if using internal scroll
    },
    sidebarWrapper: {
        width: 260,
        height: '100%',
        zIndex: 20,
    },
    mainWrapper: {
        flex: 1,
        height: '100%',
        flexDirection: 'column',
    },
    contentArea: {
        flex: 1,
        padding: 32, // Dashboard padding
        overflow: 'hidden', // Let the DashBoardScreen handle scrolling
    },
});

export default AppLayout;
