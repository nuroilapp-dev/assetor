import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PremisesMasterModal from '../components/modals/PremisesMasterModal';
import useAuthStore from '../store/authStore';

const PremisesMasterScreen = ({ navigation }) => {
    const userRole = useAuthStore(state => state.user?.role);
    const [modalVisible, setModalVisible] = useState(true);

    useEffect(() => {
        if (userRole && userRole !== 'COMPANY_ADMIN') {
            alert('Access denied');
            navigation.navigate('Dashboard');
        }
    }, [userRole]);

    if (userRole !== 'COMPANY_ADMIN') return null;

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Redirecting to Premises Master Configuration...</Text>
            <PremisesMasterModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    navigation.navigate('Dashboard');
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F8FF',
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        fontSize: 16,
        color: '#64748B'
    }
});

export default PremisesMasterScreen;
