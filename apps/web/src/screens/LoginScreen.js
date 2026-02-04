import React, { useState } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Title, Text, Surface, HelperText } from 'react-native-paper';
import useAuthStore from '../store/authStore';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secureText, setSecureText] = useState(true);
    const { login, loading, error } = useAuthStore();

    const handleLogin = async () => {
        if (!email || !password) return;
        await login(email, password);
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <Surface style={styles.loginCard}>
                    <View style={styles.logoContainer}>
                        <Title style={styles.title}>TRakio</Title>
                        <Text style={styles.subtitle}>Asset Management System</Text>
                    </View>

                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        mode="outlined"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={styles.input}
                    />

                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        mode="outlined"
                        secureTextEntry={secureText}
                        right={<TextInput.Icon icon={secureText ? "eye" : "eye-off"} onPress={() => setSecureText(!secureText)} />}
                        style={styles.input}
                    />

                    {error && <HelperText type="error" visible={!!error}>{error}</HelperText>}

                    <Button
                        mode="contained"
                        onPress={handleLogin}
                        loading={loading}
                        disabled={loading}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                    >
                        Login
                    </Button>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Enterprise Grade Tracking</Text>
                    </View>
                </Surface>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ebf2f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyboardView: {
        width: '100%',
        maxWidth: 400,
        padding: 20,
    },
    loginCard: {
        padding: 30,
        borderRadius: 20,
        elevation: 4,
        backgroundColor: 'white',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#3498db',
    },
    subtitle: {
        color: '#7f8c8d',
    },
    input: {
        marginBottom: 15,
    },
    button: {
        marginTop: 10,
        borderRadius: 10,
    },
    buttonContent: {
        paddingVertical: 8,
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#95a5a6',
    }
});

export default LoginScreen;
