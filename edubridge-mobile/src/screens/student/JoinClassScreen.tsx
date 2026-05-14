import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  SafeAreaView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
  Image, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { classAPI } from '../../services/api';
import { authStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const PURPLE = '#7C3AED';

const JoinClassScreen = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { triggerLight, triggerMedium } = useHapticFeedback();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const user = authStore.getUserSync();

  const handleJoin = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Silakan masukkan kode kelas (token)');
      return;
    }
    triggerMedium();
    setLoading(true);
    try {
      const res = await classAPI.joinClass(code.trim());
      Alert.alert('Selamat! 🎉', res.message || 'Anda berhasil bergabung ke kelas baru.', [
        { text: 'Buka Kelas', onPress: () => navigation.navigate('Kelas') }
      ]);
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Kode kelas salah atau Anda sudah terdaftar.';
      Alert.alert('Gagal Bergabung', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => { triggerLight(); navigation.goBack(); }} style={styles.backBtn}>
            <Ionicons name="close" size={26} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Gabung Kelas</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Illustration Section */}
          <View style={styles.illustrationBox}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1541178735423-479332dfa93b?q=80&w=2070&auto=format&fit=crop' }}
              style={styles.doorImage}
              resizeMode="contain"
            />
          </View>

          {/* User Preview */}
          <View style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'S'}</Text>
            </View>
            <View>
              <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'Siswa'}</Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
            </View>
            <View style={[styles.switchBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={styles.switchText}>Ganti</Text>
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.text }]}>Kode Kelas</Text>
          <Text style={[styles.instruction, { color: colors.textSecondary }]}>
            Masukkan kode kelas yang diberikan oleh gurumu di bawah ini untuk bergabung.
          </Text>

          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Contoh: abc-123-xyz"
            placeholderTextColor={colors.placeholder}
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.tipsContainer}>
            <Text style={[styles.tipTitle, { color: colors.text }]}>Cara menggunakan kode kelas:</Text>
            <Text style={[styles.tipItem, { color: colors.textSecondary }]}>• Gunakan akun yang sudah terdaftar</Text>
            <Text style={[styles.tipItem, { color: colors.textSecondary }]}>• Masukkan kode kelas (token) dengan benar</Text>
            <Text style={[styles.tipItem, { color: colors.textSecondary }]}>• Pastikan kode memiliki 6-8 karakter tanpa spasi</Text>
          </View>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Pressable
            style={[styles.joinBtn, loading && { opacity: 0.7 }]}
            onPress={handleJoin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.joinBtnText}>Gabung ke Kelas</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 60, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, paddingHorizontal: 24 },
  illustrationBox: { alignItems: 'center', marginVertical: 20 },
  doorImage: { width: 140, height: 140, borderRadius: 20 },
  userCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1 },
  avatarBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  userName: { fontSize: 15, fontWeight: 'bold' },
  userEmail: { fontSize: 12, marginTop: 2 },
  switchBtn: { marginLeft: 'auto', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  switchText: { fontSize: 12, color: PURPLE, fontWeight: '600' },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  instruction: { fontSize: 13, lineHeight: 20, marginBottom: 20 },
  input: { borderRadius: 12, borderWidth: 2, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, fontWeight: '500' },
  tipsContainer: { marginTop: 30, marginBottom: 20 },
  tipTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  tipItem: { fontSize: 13, marginBottom: 8 },
  footer: { padding: 24, borderTopWidth: 1 },
  joinBtn: { backgroundColor: PURPLE, borderRadius: 14, paddingVertical: 16, alignItems: 'center', shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  joinBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default JoinClassScreen;
