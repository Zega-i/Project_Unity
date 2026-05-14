import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  SafeAreaView, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { authAPI } from '../../services/api';
import { authStore } from '../../store/authStore';

const PURPLE = '#7C3AED';

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Error modal
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage]           = useState('');

  // Forgot password modal
  const [forgotVisible, setForgotVisible]   = useState(false);
  const [forgotEmail, setForgotEmail]       = useState('');
  const [forgotStep, setForgotStep]         = useState<'input' | 'sent'>('input');
  const [forgotLoading, setForgotLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Mohon isi email dan password Anda.');
      setErrorModalVisible(true);
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      if (!response || !response.token || !response.user) {
        throw new Error('Response tidak lengkap dari server');
      }
      await authStore.setAuth(response.token, response.user);
    } catch (error: any) {
      const msg = error?.response?.data?.message ||
                  error?.response?.data?.error   ||
                  error?.message                 ||
                  'Email atau password salah. Silakan coba lagi.';
      setErrorMessage(msg);
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    try {
      await authAPI.forgotPassword(forgotEmail.trim());
    } catch (_) {
      // Always show success — don't reveal whether email is registered
    } finally {
      setForgotLoading(false);
      setForgotStep('sent');
    }
  };

  const closeForgot = () => {
    setForgotVisible(false);
    setForgotEmail('');
    setForgotStep('input');
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
          {/* Header */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Ionicons name="school" size={38} color="#FFF" />
            </View>
            <Text style={styles.title}>Selamat Datang!</Text>
            <Text style={styles.subtitle}>Masuk untuk melanjutkan belajar.</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan email Anda"
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

            <Pressable style={styles.forgotBtn} onPress={() => setForgotVisible(true)}>
              <Text style={styles.forgotText}>Lupa Password?</Text>
            </Pressable>

            <Pressable
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>Masuk Sekarang</Text>
              )}
            </Pressable>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Belum punya akun? </Text>
              <Pressable onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Daftar</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Error Modal */}
      <Modal visible={errorModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.errorIconContainer}>
              <Ionicons name="alert-circle" size={40} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Login Gagal</Text>
            <Text style={styles.modalSub}>{errorMessage}</Text>
            <Pressable style={styles.modalCloseBtn} onPress={() => setErrorModalVisible(false)}>
              <Text style={styles.modalCloseText}>Coba Lagi</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Forgot Password Modal */}
      <Modal visible={forgotVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {forgotStep === 'input' ? (
              <>
                <View style={[styles.errorIconContainer, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="lock-closed-outline" size={36} color={PURPLE} />
                </View>
                <Text style={styles.modalTitle}>Lupa Password?</Text>
                <Text style={styles.modalSub}>
                  Masukkan email akunmu. Kami akan mengirimkan link untuk mereset password.
                </Text>
                <TextInput
                  style={styles.forgotInput}
                  placeholder="Email terdaftar"
                  placeholderTextColor="#94A3B8"
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!forgotLoading}
                />
                <Pressable
                  style={[styles.modalCloseBtn, { backgroundColor: PURPLE }, (!forgotEmail.trim() || forgotLoading) && { opacity: 0.6 }]}
                  onPress={handleForgotPassword}
                  disabled={!forgotEmail.trim() || forgotLoading}
                >
                  {forgotLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.modalCloseText}>Kirim Link Reset</Text>
                  )}
                </Pressable>
                <Pressable style={styles.cancelBtn} onPress={closeForgot}>
                  <Text style={styles.cancelText}>Batal</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={[styles.errorIconContainer, { backgroundColor: '#F0FDF4' }]}>
                  <Ionicons name="checkmark-circle" size={40} color="#16A34A" />
                </View>
                <Text style={styles.modalTitle}>Email Terkirim!</Text>
                <Text style={styles.modalSub}>
                  Jika email <Text style={{ fontWeight: 'bold' }}>{forgotEmail}</Text> terdaftar, kamu akan menerima link reset password dalam beberapa menit.
                </Text>
                <Pressable style={[styles.modalCloseBtn, { backgroundColor: '#16A34A' }]} onPress={closeForgot}>
                  <Text style={styles.modalCloseText}>Oke, Mengerti</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#FFFFFF' },
  content:     { padding: 24, paddingTop: 60 },

  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoBox: {
    width: 80, height: 80, borderRadius: 22,
    backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    shadowColor: PURPLE, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 6,
  },
  title:    { fontSize: 28, fontWeight: 'bold', color: '#1E293B' },
  subtitle: { fontSize: 16, color: '#64748B', marginTop: 8 },

  form:        { marginTop: 20 },
  inputGroup:  { marginBottom: 20 },
  label:       { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 8 },
  input:       { backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  passwordInput:   { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1E293B' },
  eyeBtn:          { padding: 12 },

  forgotBtn:  { alignSelf: 'flex-end', marginBottom: 30 },
  forgotText: { color: PURPLE, fontWeight: '600', fontSize: 14 },

  loginBtn:         { backgroundColor: PURPLE, borderRadius: 14, paddingVertical: 16, alignItems: 'center', shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText:     { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerText:      { color: '#64748B', fontSize: 14 },
  registerLink:      { color: PURPLE, fontWeight: 'bold', fontSize: 14 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard:    { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center' },

  errorIconContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  modalSub:   { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 20 },

  forgotInput: {
    width: '100%', backgroundColor: '#F8FAFC', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#1E293B',
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16,
  },
  modalCloseBtn:  { backgroundColor: '#1E293B', borderRadius: 14, paddingVertical: 14, width: '100%', alignItems: 'center' },
  modalCloseText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  cancelBtn:  { marginTop: 12, paddingVertical: 8 },
  cancelText: { color: '#64748B', fontSize: 14, fontWeight: '600' },
});

export default LoginScreen;
