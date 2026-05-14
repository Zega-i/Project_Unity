import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, TextInput, ActivityIndicator, Modal,
  StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { authStore } from '../../store/authStore';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const PURPLE = '#7C3AED';

const ChangePasswordScreen = () => {
  const navigation = useNavigation<any>();
  const { triggerMedium } = useHapticFeedback();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const validatePassword = (password: string) => {
    const errors = [];

    if (password.length < 8) {
      errors.push('Minimal 8 karakter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Minimal 1 huruf besar (A-Z)');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Minimal 1 huruf kecil (a-z)');
    }
    if (!/\d/.test(password)) {
      errors.push('Minimal 1 angka (0-9)');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Minimal 1 karakter spesial (!@#$%)');
    }

    return errors;
  };

  const handleChangePassword = async () => {
    setError('');
    triggerMedium();

    // Validasi
    if (!oldPassword.trim()) {
      setError('Password lama tidak boleh kosong');
      return;
    }

    if (!newPassword.trim()) {
      setError('Password baru tidak boleh kosong');
      return;
    }

    if (!confirmPassword.trim()) {
      setError('Konfirmasi password tidak boleh kosong');
      return;
    }

    if (oldPassword === newPassword) {
      setError('Password baru harus berbeda dari password lama');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password baru dan konfirmasi tidak cocok');
      return;
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setError('Password baru tidak memenuhi kriteria: ' + passwordErrors.join(', '));
      return;
    }

    setLoading(true);

    try {
      const token = await authStore.getToken();

      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch('http://your-backend-url/api/auth/change-password', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify({
      //     oldPassword,
      //     newPassword,
      //     confirmPassword
      //   })
      // });

      // if (!response.ok) {
      //   const data = await response.json();
      //   throw new Error(data.message || 'Gagal mengubah password');
      // }

      // Simulate successful response
      await new Promise(resolve => setTimeout(resolve, 1500));

      triggerMedium();
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessModalVisible(true);
    } catch (err: any) {
      triggerMedium();
      setError(err.message || 'Terjadi kesalahan saat mengubah password');
    } finally {
      setLoading(false);
    }
  };

  const newPasswordErrors = newPassword ? validatePassword(newPassword) : [];
  const passwordStrength = newPassword ? (5 - newPasswordErrors.length) : 0;
  const strengthColor = passwordStrength === 5 ? '#10B981' : passwordStrength >= 3 ? '#F59E0B' : '#EF4444';

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight }]}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#1E293B" />
            </Pressable>
            <Text style={styles.headerTitle}>Ganti Password</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={PURPLE} />
            <Text style={styles.infoText}>
              Password harus minimal 8 karakter dengan kombinasi huruf besar, kecil, angka, dan karakter spesial
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Old Password */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Password Lama</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Masukkan password lama Anda"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showOldPassword}
                value={oldPassword}
                onChangeText={setOldPassword}
              />
              <Pressable onPress={() => setShowOldPassword(!showOldPassword)}>
                <Ionicons
                  name={showOldPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#94A3B8"
                />
              </Pressable>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Password Baru</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Masukkan password baru"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <Pressable onPress={() => setShowNewPassword(!showNewPassword)}>
                <Ionicons
                  name={showNewPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#94A3B8"
                />
              </Pressable>
            </View>

            {/* Password Strength */}
            {newPassword && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBars}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.strengthBar,
                        { backgroundColor: i < passwordStrength ? strengthColor : '#E2E8F0' }
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthText, { color: strengthColor }]}>
                  {passwordStrength === 5 ? 'Kuat' : passwordStrength >= 3 ? 'Sedang' : 'Lemah'}
                </Text>
              </View>
            )}

            {/* Validation Requirements */}
            {newPassword && newPasswordErrors.length > 0 && (
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Kriteria yang belum terpenuhi:</Text>
                {newPasswordErrors.map((error, idx) => (
                  <Text key={idx} style={styles.requirementItem}>
                    • {error}
                  </Text>
                ))}
              </View>
            )}

            {newPassword && newPasswordErrors.length === 0 && (
              <View style={styles.requirementsContainer}>
                <Text style={[styles.requirementsTitle, { color: '#10B981' }]}>✓ Password memenuhi semua kriteria</Text>
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Konfirmasi Password Baru</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Ketik ulang password baru"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#94A3B8"
                />
              </Pressable>
            </View>

            {confirmPassword && newPassword !== confirmPassword && (
              <Text style={styles.matchError}>Password tidak cocok</Text>
            )}

            {confirmPassword && newPassword === confirmPassword && (
              <Text style={styles.matchSuccess}>✓ Password cocok</Text>
            )}
          </View>

          {/* Change Button */}
          <Pressable
            style={[styles.changeBtn, loading && styles.changebtnDisabled]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.changeBtnText}>Ganti Password</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            </View>
            <Text style={styles.modalTitle}>Password Berhasil Diubah</Text>
            <Text style={styles.modalDesc}>
              Password Anda telah berhasil diperbarui. Gunakan password baru saat login berikutnya.
            </Text>

            <Pressable
              style={styles.modalBtn}
              onPress={() => {
                setSuccessModalVisible(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.modalBtnText}>Kembali ke Pengaturan</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },

  infoCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: PURPLE + '10', borderRadius: 12, padding: 14, marginBottom: 20, gap: 10 },
  infoText: { flex: 1, fontSize: 13, color: '#1E293B', lineHeight: 18, fontWeight: '500' },

  errorCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FEF2F2', borderRadius: 12, padding: 14, marginBottom: 20, gap: 10, borderLeftWidth: 4, borderLeftColor: '#EF4444' },
  errorText: { flex: 1, fontSize: 13, color: '#1E293B', lineHeight: 18, fontWeight: '500' },

  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 10 },
  passwordInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  textInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#1E293B' },

  strengthContainer: { marginTop: 12, gap: 8 },
  strengthBars: { flexDirection: 'row', gap: 4 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthText: { fontSize: 12, fontWeight: '600' },

  requirementsContainer: { marginTop: 12, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, borderLeftWidth: 3, borderLeftColor: '#EF4444' },
  requirementsTitle: { fontSize: 12, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  requirementItem: { fontSize: 11, color: '#64748B', marginBottom: 4, lineHeight: 16 },

  matchError: { marginTop: 8, fontSize: 12, color: '#EF4444', fontWeight: '500' },
  matchSuccess: { marginTop: 8, fontSize: 12, color: '#10B981', fontWeight: '500' },

  changeBtn: { backgroundColor: PURPLE, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 20, shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  changebtnDisabled: { opacity: 0.6 },
  changeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#FFFFFF', width: '85%', borderRadius: 24, padding: 24, alignItems: 'center' },
  successIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  modalDesc: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  modalBtn: { width: '100%', paddingVertical: 14, borderRadius: 12, backgroundColor: PURPLE, alignItems: 'center' },
  modalBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
});

export default ChangePasswordScreen;
