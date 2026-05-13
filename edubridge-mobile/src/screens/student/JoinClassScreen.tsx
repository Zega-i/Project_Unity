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

const PURPLE = '#7C3AED';

const JoinClassScreen = () => {
  const navigation = useNavigation<any>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const user = authStore.getUserSync();

  const handleJoin = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Silakan masukkan kode kelas (token)');
      return;
    }
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
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="close" size={26} color="#1E293B" />
          </Pressable>
          <Text style={styles.headerTitle}>Gabung Kelas</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Illustration Section - Open Door */}
          <View style={styles.illustrationBox}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1541178735423-479332dfa93b?q=80&w=2070&auto=format&fit=crop' }} 
              style={styles.doorImage} 
              resizeMode="contain"
            />
          </View>

          {/* User Preview */}
          <View style={styles.userCard}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'S'}</Text>
            </View>
            <View>
              <Text style={styles.userName}>{user?.name || 'Siswa'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
            <View style={styles.switchBtn}>
              <Text style={styles.switchText}>Ganti</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Kode Kelas</Text>
          <Text style={styles.instruction}>
            Masukkan kode kelas yang diberikan oleh gurumu di bawah ini untuk bergabung.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Contoh: abc-123-xyz"
            placeholderTextColor="#94A3B8"
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.tipsContainer}>
            <Text style={styles.tipTitle}>Cara menggunakan kode kelas:</Text>
            <Text style={styles.tipItem}>• Gunakan akun yang sudah terdaftar</Text>
            <Text style={styles.tipItem}>• Masukkan kode kelas (token) dengan benar</Text>
            <Text style={styles.tipItem}>• Pastikan kode memiliki 6-8 karakter tanpa spasi</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 60 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  content: { flex: 1, paddingHorizontal: 24 },
  illustrationBox: { alignItems: 'center', marginVertical: 20 },
  doorImage: { width: 140, height: 140, borderRadius: 20 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9' },
  avatarBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  userName: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  userEmail: { fontSize: 12, color: '#64748B', marginTop: 2 },
  switchBtn: { marginLeft: 'auto', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  switchText: { fontSize: 12, color: PURPLE, fontWeight: '600' },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  instruction: { fontSize: 13, color: '#64748B', lineHeight: 20, marginBottom: 20 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 2, borderColor: '#E2E8F0', paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, color: '#1E293B', fontWeight: '500' },
  tipsContainer: { marginTop: 30, marginBottom: 20 },
  tipTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  tipItem: { fontSize: 13, color: '#64748B', marginBottom: 8 },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  joinBtn: { backgroundColor: PURPLE, borderRadius: 14, paddingVertical: 16, alignItems: 'center', shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  joinBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default JoinClassScreen;
