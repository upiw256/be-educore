import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Perhatian', 'Username dan password harus diisi');
      return;
    }
    try {
      setLoading(true);
      await login(username, password);
    } catch (error) {
      Alert.alert('Login Gagal', error.response?.data?.message || 'Periksa kembali username dan password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Background gradient layers */}
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>🎓</Text>
        </View>
        <Text style={styles.appName}>EduCore</Text>
        <Text style={styles.appTagline}>School Management System</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Selamat Datang</Text>
        <Text style={styles.cardSub}>Masuk untuk melanjutkan</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Username</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Masukkan username"
              placeholderTextColor="#aaa"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              id="input-username"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Masukkan password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              id="input-password"
            />
            <TouchableOpacity onPress={() => setShowPass(v => !v)}>
              <Text style={styles.toggleIcon}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
          id="btn-login"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Masuk</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>EduCore v1.0 • 2026</Text>
    </KeyboardAvoidingView>
  );
};

const BLUE_DARK = '#0D47A1';
const BLUE = '#1565C0';
const BLUE_LIGHT = '#1976D2';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BLUE_DARK, justifyContent: 'center', padding: 24 },
  bgTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: BLUE_DARK },
  bgBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', backgroundColor: '#F0F4FF' },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  logoIcon: { fontSize: 36 },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
  appTagline: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 28, elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16 },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A2E' },
  cardSub: { color: '#888', marginBottom: 24, marginTop: 4, fontSize: 14 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginLeft: 2 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E8EAF6', borderRadius: 12, backgroundColor: '#FAFAFA', paddingHorizontal: 14 },
  inputIcon: { fontSize: 18, marginRight: 8 },
  textInput: { flex: 1, height: 50, fontSize: 15, color: '#1A1A2E' },
  toggleIcon: { fontSize: 18, padding: 4 },
  loginButton: { marginTop: 8, height: 52, backgroundColor: BLUE, borderRadius: 14, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  loginButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold', letterSpacing: 0.5 },
  footer: { textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 32 },
});

export default LoginScreen;
