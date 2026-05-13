import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  SafeAreaView, Alert, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { authAPI } from '../../services/api';
import { authStore } from '../../store/authStore';

const PURPLE = '#7C3AED';

type Role = 'STUDENT' | 'TEACHER';

const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [school, setSchool] = useState('');
  const [className, setClassName] = useState('');
  const [dob, setDob] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || (role === 'STUDENT' && (!school || !className))) {
      Alert.alert('Error', 'Mohon isi semua kolom yang wajib');
      return;
    }
    setLoading(true);
    try {
      const extra = role === 'STUDENT' ? {
        school,
        className,
        grade: 10,
        dateOfBirth: dob ? new Date(dob).toISOString() : undefined,
      } : {};
      const response = await authAPI.register(email, password, name, role, extra);
      await authStore.setAuth(response.data.token, response.data.user);
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Pendaftaran gagal';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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

        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Buat Akun Baru</Text>
          <Text style={styles.subtitle}>Bergabung dan mulai perjalanan belajarmu sekarang!</Text>
        </View>

        {/* Form Section */}
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

          {role === 'STUDENT' && (
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
                <Text style={styles.label}>Kelas</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: 10A"
                  placeholderTextColor="#94A3B8"
                  value={className}
                  onChangeText={setClassName}
                  editable={!loading}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tanggal Lahir</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                  value={dob}
                  onChangeText={setDob}
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
                placeholder="Minimal 6 karakter"
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

        {/* Footer Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Sudah punya akun? </Text>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Masuk</Text>
          </Pressable>
        </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flexGrow: 1, paddingHorizontal: 30, paddingTop: 20, paddingBottom: 40 },
  backBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 20, marginLeft: -10 },
  header: { marginBottom: 32 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#64748B', lineHeight: 22 },
  form: { marginBottom: 24 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 10 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: '#1E293B' },
  roleContainer: { flexDirection: 'row', gap: 12 },
  roleBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  roleBtnActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  roleBtnText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  roleBtnTextActive: { color: '#FFFFFF' },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  passwordInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: '#1E293B' },
  eyeBtn: { paddingHorizontal: 12 },
  registerBtn: { backgroundColor: PURPLE, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 10, shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  registerBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontSize: 14, color: '#64748B' },
  loginLink: { fontSize: 14, fontWeight: 'bold', color: PURPLE },
});

export default RegisterScreen;