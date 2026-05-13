import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  SafeAreaView, Alert, ScrollView, ActivityIndicator, Image,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { authAPI } from '../../services/api';
import { authStore } from '../../store/authStore';

const PURPLE = '#7C3AED';

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Mohon isi semua kolom');
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      await authStore.setAuth(response.token, response.user);
    } catch (error) {
      Alert.alert('Login Gagal', 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Top Icon */}
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'file:///C:/Users/agust/.gemini/antigravity/brain/82610f0c-f3bd-40ca-8af6-3c69e09a7cf0/login_robot_icon_1778695953509.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Header Text */}
        <View style={styles.header}>
          <Text style={styles.title}>Selamat datang kembali!</Text>
          <Text style={styles.subtitle}>Masuk untuk melanjutkan belajar.</Text>
        </View>

        {/* Form Section */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email atau Username</Text>
            <TextInput
              style={styles.input}
              placeholder="contoh@email.com"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Masukkan password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#94A3B8"
                />
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Lupa password?</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed && { opacity: 0.9 },
              loading && { opacity: 0.7 },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Masuk</Text>
            )}
          </Pressable>
        </View>

        {/* Footer Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Belum punya akun? </Text>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Daftar</Text>
          </Pressable>
        </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flexGrow: 1, paddingHorizontal: 30, paddingTop: 40, paddingBottom: 40 },
  logoContainer: { alignItems: 'center', marginBottom: 24, marginTop: 20 },
  logo: { width: 100, height: 100, borderRadius: 25 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#64748B' },
  form: { marginBottom: 24 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 10 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: '#1E293B' },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  passwordInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: '#1E293B' },
  eyeBtn: { paddingHorizontal: 12 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 40, marginTop: -10 },
  forgotText: { fontSize: 14, fontWeight: '600', color: PURPLE },
  loginButton: { backgroundColor: PURPLE, borderRadius: 12, paddingVertical: 16, alignItems: 'center', shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { fontSize: 14, color: '#64748B' },
  registerLink: { fontSize: 14, fontWeight: 'bold', color: PURPLE },
});

export default LoginScreen;