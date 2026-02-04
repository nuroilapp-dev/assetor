import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Modal, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const OfficeSelectorModal = ({ visible, onClose, onSelect }) => {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768; // Simple responsive breakpoint
    const [hoveredCard, setHoveredCard] = useState(null);

    const options = [
        {
            id: 'OfficeOwned',
            label: 'Owned Premises',
            description: 'Company-owned buildings and properties',
            icon: 'office-building',
            themeColor: '#3B82F6',
            bgColorStart: '#E8F1FF',
            bgColorEnd: '#F4F8FF',
            iconBg: '#D8E8FF',
        },
        {
            id: 'OfficeRental',
            label: 'Rental Premises',
            description: 'Leased or rented office spaces',
            icon: 'office-building-marker',
            themeColor: '#F59E0B',
            bgColorStart: '#FFF2E3',
            bgColorEnd: '#FFF7ED',
            iconBg: '#FFE3C2',
        },
    ];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

                <View style={[styles.modalContent, { width: isDesktop ? 720 : '92%' }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Select Premises Type</Text>
                            <Text style={styles.subtitle}>Choose how this premises is managed</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <MaterialCommunityIcons name="close" size={24} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>

                    {/* Cards Container */}
                    <View style={[styles.cardsContainer, isDesktop ? styles.row : styles.col]}>
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.card,
                                    {
                                        backgroundColor: option.bgColorStart,
                                        // Simple gradient effect simulation with shadow/border context 
                                        // or just solid bg since pure gradient in RN requires LinearGradient lib
                                        // which might not be installed. Using fallback solid logic with specified hex.
                                        borderColor: hoveredCard === option.id ? option.themeColor : 'transparent',
                                        transform: hoveredCard === option.id && Platform.OS === 'web' ? [{ translateY: -2 }] : [],
                                        shadowOpacity: hoveredCard === option.id ? 0.2 : 0,
                                    }
                                ]}
                                onPress={() => onSelect(option.id)}
                                activeOpacity={0.9}
                                onMouseEnter={() => setHoveredCard(option.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                            >
                                {/* Badge */}
                                <View style={[styles.iconBadge, { backgroundColor: option.iconBg }]}>
                                    <MaterialCommunityIcons name={option.icon} size={32} color={option.themeColor} />
                                </View>

                                {/* Text */}
                                <Text style={styles.cardTitle}>{option.label}</Text>
                                <Text style={styles.cardDesc}>{option.description}</Text>

                                {/* Button */}
                                <TouchableOpacity
                                    style={[styles.cardButton, { backgroundColor: option.themeColor }]}
                                    onPress={() => onSelect(option.id)}
                                >
                                    <Text style={styles.buttonLabel}>Continue</Text>
                                    <MaterialCommunityIcons name="arrow-right" size={16} color="white" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.45)', // Overlay per spec
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 24,
        paddingTop: 28,
        shadowColor: '#0F172A', // rgba(15,23,42)
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.18,
        shadowRadius: 55,
        elevation: 20,
        maxWidth: '92%',
        minHeight: 520, // Increased height by 20% as requested
        justifyContent: 'center' // Center content vertically if modal grows
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24, // Kept similar, will rely on card spacing
        paddingBottom: 4 // tiny adjustments
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A',
    },
    subtitle: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 6,
    },
    closeButton: {
        padding: 4,
    },

    cardsContainer: {
        gap: 16,
    },
    row: { flexDirection: 'row' },
    col: { flexDirection: 'column' },

    card: {
        flex: 1,
        borderRadius: 18,
        padding: 24,
        alignItems: 'center',
        paddingVertical: 32, // More vertical padding
        height: 260, // Fixed taller height
        borderWidth: 2,
        // Default shadow for lift effect on web if supported
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        // Transition for hover not native in RN, but translateY works on re-render
    },
    iconBadge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
        textAlign: 'center',
    },
    cardDesc: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 20, // Increased spacer as requested
        lineHeight: 20, // slightly better readability
        paddingHorizontal: 8,
    },
    cardButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 40,
        borderRadius: 12,
        gap: 8,
        marginTop: 'auto',
        marginBottom: 4, // Slight visual lift from bottom edge
    },
    buttonLabel: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    }
});

export default OfficeSelectorModal;
