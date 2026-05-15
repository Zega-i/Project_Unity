import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, Pressable, StatusBar, KeyboardAvoidingView,
  Platform, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { teacherAPI } from '../../services/api';

const GREEN = '#16A34A';

const TeacherAddClassScreen = () => {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();
  const { triggerMedium, triggerSuccess } = useHapticFeedback();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    schedule: '',
    description: '',
  });

  const [token, setToken] = useState('');

  // Generate a random class code
  const generateToken = () => {
    triggerMedium();
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setToken(result);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.level || !token) {
      Alert.alert('Data Belum Lengkap', 'Mohon isi nama kelas, jenjang, dan buat kode kelas.');
      return;
    }

    setLoading(true);
    try {
      // In real scenario: await teacherAPI.createClass({...formData, token});
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate
      triggerSuccess();
      Alert.alert('Berhasil', 'Kelas baru telah dibuat!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Gagal membuat kelas. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Constants.statusBarHeight }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Tambah Kelas Baru</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.infoCard, { backgroundColor: GREEN + '10', borderColor: GREEN + '20' }]}>
            <Ionicons name="information-circle" size={20} color={GREEN} />
            <Text style={[styles.infoText, { color: GREEN }]}>
              Buat kelas baru dan bagikan kode kelas kepada siswa Anda agar mereka dapat bergabung.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Nama Kelas</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder="Contoh: Matematika 10A"
                placeholderTextColor={colors.textSecondary}
                value={formData.name}
                onChangeText={(txt) => setFormData({...formData, name: txt})}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.text }]}>Jenjang</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                  placeholder="Contoh: 10"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={formData.level}
                  onChangeText={(txt) => setFormData({...formData, level: txt})}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 2, marginLeft: 12 }]}>
                <Text style={[styles.label, { color: colors.text }]}>Jadwal</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                  placeholder="Contoh: Senin, 08:00"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.schedule}
                  onChangeText={(txt) => setFormData({...formData, schedule: txt})}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Deskripsi (Opsional)</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder="Tulis deskripsi singkat kelas..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                value={formData.description}
                onChangeText={(txt) => setFormData({...formData, description: txt})}
              />
            </View>

            <View style={[styles.tokenSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View>
                <Text style={[styles.tokenTitle, { color: colors.text }]}>Kode Kelas</Text>
                <Text style={[styles.tokenSub, { color: colors.textSecondary }]}>Gunakan kode ini untuk siswa bergabung</Text>
              </View>
              {token ? (
                <View style={styles.tokenDisplay}>
                  <Text style={styles.tokenText}>{token}</Text>
                </View>
              ) : (
                <Pressable style={styles.generateBtn} onPress={generateToken}>
                  <Text style={styles.generateBtnText}>Buat Kode</Text>
                </Pressable>
              )}
            </View>

            <Pressable 
              style={[styles.submitBtn, { opacity: loading ? 0.7 : 1 }]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Simpan Kelas</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  infoCard: { flexDirection: 'row', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 24, gap: 12 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600' },
  input: { height: 52, borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, fontSize: 15 },
  textArea: { height: 100, paddingTop: 14, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  tokenSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 18, borderWidth: 1, marginTop: 10 },
  tokenTitle: { fontSize: 15, fontWeight: 'bold' },
  tokenSub: { fontSize: 11, marginTop: 2 },
  tokenDisplay: { backgroundColor: GREEN, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  tokenText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
  generateBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  generateBtnText: { color: '#1E293B', fontSize: 13, fontWeight: '700' },
  submitBtn: { backgroundColor: GREEN, height: 56, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default TeacherAddClassScreen;
