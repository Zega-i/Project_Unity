import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  SafeAreaView, Alert, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { authAPI } from '../../services/api';
import { authStore } from '../../store/authStore';

const PURPLE = '#7C3AED';

type Role = 'STUDENT' | 'TEACHER';

const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [school, setSchool]       = useState('');
  const [dob, setDob]             = useState('');
  const [nip, setNip]             = useState('');
  const [subject, setSubject]     = useState('');
  const [role, setRole]           = useState<Role>('STUDENT');
  const [loading, setLoading]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, title: '', message: '' });

  // Auto-format DOB as DD-MM-YYYY
  const handleDobChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) {
      formatted = digits.slice(0, 2) + '-' + digits.slice(2, 4) + '-' + digits.slice(4);
    } else if (digits.length > 2) {
      formatted = digits.slice(0, 2) + '-' + digits.slice(2);
    }
    setDob(formatted);
  };

  const parseDob = (value: string): string | undefined => {
    const parts = value.split('-');
    if (parts.length !== 3 || parts[2].length < 4) return undefined;
    const iso = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    return isNaN(iso.getTime()) ? undefined : iso.toISOString();
  };

  // Password rules — same as ChangePasswordScreen
  const pwRules = [
    { ok: password.length >= 8,                      text: 'Minimal 8 karakter'       },
    { ok: /[A-Z]/.test(password),                    text: 'Huruf kapital (A–Z)'       },
    { ok: /[a-z]/.test(password),                    text: 'Huruf kecil (a–z)'         },
    { ok: /[0-9]/.test(password),                    text: 'Mengandung angka (0–9)'    },
    { ok: /[!@#$%^&*(),.?":{}|<>]/.test(password),  text: 'Karakter spesial (!@#$%)'  },
  ];
  const pwScore = pwRules.filter(r => r.ok).length;
  const pwValid = pwRules.every(r => r.ok);
  const strengthColor = pwScore >= 5 ? '#10B981' : pwScore >= 3 ? '#F59E0B' : '#EF4444';
  const strengthLabel = pwScore >= 5 ? 'Kuat' : pwScore >= 3 ? 'Sedang' : 'Lemah';

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setErrorModal({ visible: true, title: 'Kolom Wajib', message: 'Mohon isi semua kolom utama.' });
      return;
    }
    if (role === 'STUDENT' && !school) {
      setErrorModal({ visible: true, title: 'Data Sekolah', message: 'Mohon isi nama sekolah kamu.' });
      return;
    }
    if (role === 'TEACHER') {
      if (!nip || !subject) {
        setErrorModal({ visible: true, title: 'Data Guru', message: 'Mohon isi NIP dan Mata Pelajaran.' });
        return;
      }
    }
    if (!pwValid) {
      setErrorModal({ 
        visible: true, 
        title: 'Password Tidak Valid', 
        message: 'Password harus minimal 8 karakter, mengandung huruf besar, kecil, angka, dan karakter spesial.' 
      });
      return;
    }
    setLoading(true);
    try {
      const extra = role === 'STUDENT' ? {
        school,
        grade: 10,
        dateOfBirth: dob ? parseDob(dob) : undefined,
      } : {
        school,
        nip,
        subject,
      };
      const response = await authAPI.register(email, password, name, role, extra);
      await authStore.setAuth(response.token, response.user);
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Pendaftaran gagal';
      setErrorModal({ 
        visible: true, 
        title: 'Error', 
        message: msg 
      });
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
          {/* Back Button */}
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#1E293B" />
          </Pressable>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Buat Akun Baru</Text>
            <Text style={styles.subtitle}>Bergabung dan mulai perjalanan belajarmu sekarang!</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan nama lengkap"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
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
              <Text style={styles.label}>Role</Text>
              <View style={styles.roleContainer}>
                <Pressable
                  style={[styles.roleBtn, role === 'STUDENT' && styles.roleBtnActive]}
                  onPress={() => setRole('STUDENT')}
                >
                  <Text style={[styles.roleBtnText, role === 'STUDENT' && styles.roleBtnTextActive]}>Siswa</Text>
                </Pressable>
                <Pressable
                  style={[styles.roleBtn, role === 'TEACHER' && styles.roleBtnActive]}
                  onPress={() => setRole('TEACHER')}
                >
                  <Text style={[styles.roleBtnText, role === 'TEACHER' && styles.roleBtnTextActive]}>Guru</Text>
                </Pressable>
              </View>
            </View>

            {role === 'STUDENT' ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Sekolah</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nama Sekolah"
                    placeholderTextColor="#94A3B8"
                    value={school}
                    onChangeText={setSchool}
                    editable={!loading}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Tanggal Lahir</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="DD-MM-YYYY"
                    placeholderTextColor="#94A3B8"
                    value={dob}
                    onChangeText={handleDobChange}
                    keyboardType="number-pad"
                    editable={!loading}
                    maxLength={10}
                  />
                  <Text style={styles.inputHint}>Contoh: 17-08-2007</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Sekolah / Instansi</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nama Sekolah"
                    placeholderTextColor="#94A3B8"
                    value={school}
                    onChangeText={setSchool}
                    editable={!loading}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>NIP / Nomor Induk Guru</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan NIP"
                    placeholderTextColor="#94A3B8"
                    value={nip}
                    onChangeText={setNip}
                    keyboardType="number-pad"
                    editable={!loading}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mata Pelajaran yang Diampu</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: Matematika"
                    placeholderTextColor="#94A3B8"
                    value={subject}
                    onChangeText={setSubject}
                    editable={!loading}
                  />
                </View>
              </>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Minimal 8 karakter"
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
              {password.length > 0 && (
                <>
                  <View style={styles.strengthRow}>
                    <View style={styles.strengthBars}>
                      {[0, 1, 2, 3, 4].map((i) => (
                        <View key={i} style={[styles.strengthBar, { backgroundColor: i < pwScore ? strengthColor : '#E2E8F0' }]} />
                      ))}
                    </View>
                    <Text style={[styles.strengthLabel, { color: strengthColor }]}>{strengthLabel}</Text>
                  </View>
                  <View style={styles.pwRules}>
                    {pwRules.map((rule, i) => (
                      <View key={i} style={styles.pwRule}>
                        <Ionicons
                          name={rule.ok ? 'checkmark-circle' : 'ellipse-outline'}
                          size={14}
                          color={rule.ok ? '#16A34A' : '#94A3B8'}
                        />
                        <Text style={[styles.pwRuleText, { color: rule.ok ? '#16A34A' : '#94A3B8' }]}>
                          {rule.text}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.registerBtn,
                pressed && { opacity: 0.9 },
                loading && { opacity: 0.7 },
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.registerBtnText}>Daftar</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Sudah punya akun? </Text>
            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Masuk</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={errorModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setErrorModal({ ...errorModal, visible: false })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.errorIconCircle}>
              <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>{errorModal.title}</Text>
            <Text style={styles.modalMessage}>{errorModal.message}</Text>
            <View style={styles.modalActions}>
              <Pressable 
                style={styles.modalBtn} 
                onPress={() => setErrorModal({ ...errorModal, visible: false })}
              >
                <Text style={styles.modalBtnText}>Mengerti</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#FFFFFF' },
  content:      { flexGrow: 1, paddingHorizontal: 30, paddingTop: 20, paddingBottom: 40 },
  backBtn:      { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 20, marginLeft: -10 },
  header:       { marginBottom: 32 },
  title:        { fontSize: 26, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  subtitle:     { fontSize: 15, color: '#64748B', lineHeight: 22 },
  form:         { marginBottom: 24 },
  inputGroup:   { marginBottom: 24 },
  label:        { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 10 },
  input:        { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: '#1E293B' },
  inputHint:    { fontSize: 12, color: '#94A3B8', marginTop: 6 },

  roleContainer:      { flexDirection: 'row', gap: 12 },
  roleBtn:            { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  roleBtnActive:      { backgroundColor: PURPLE, borderColor: PURPLE },
  roleBtnText:        { fontSize: 14, fontWeight: '600', color: '#64748B' },
  roleBtnTextActive:  { color: '#FFFFFF' },

  passwordWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  passwordInput:   { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: '#1E293B' },
  eyeBtn:          { paddingHorizontal: 12 },

  strengthRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  strengthBars: { flexDirection: 'row', flex: 1, gap: 4 },
  strengthBar:  { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel:{ fontSize: 12, fontWeight: '700' },

  pwRules:    { marginTop: 8, gap: 6 },
  pwRule:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pwRuleText: { fontSize: 12, fontWeight: '500' },

  registerBtn:     { backgroundColor: PURPLE, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 10, shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  registerBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  footer:     { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontSize: 14, color: '#64748B' },
  loginLink:  { fontSize: 14, fontWeight: 'bold', color: PURPLE },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  errorIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    backgroundColor: PURPLE,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default RegisterScreen;
