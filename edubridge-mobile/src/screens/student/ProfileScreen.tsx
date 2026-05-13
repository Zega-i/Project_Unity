import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { authStore } from '../../store/authStore';
import { authAPI } from '../../services/api';

const PURPLE = '#7C3AED';

const ProfileScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async () => {
    try {
      const cached = authStore.getUserSync();
      if (cached) setUser(cached);
      const res = await authAPI.getProfile();
      const profile = res.data || res;
      setUser(profile);
      await authStore.setAuth(await authStore.getToken() || '', profile);
    } catch {
      const cached = authStore.getUserSync();
      if (cached) setUser(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Keluar', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => authStore.clearAuth() },
    ]);
  };

  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const menuItems = [
    { icon: 'notifications-outline', label: 'Notifikasi', color: '#6366F1' },
    { icon: 'shield-checkmark-outline', label: 'Privasi & Keamanan', color: '#10B981' },
    { icon: 'help-circle-outline', label: 'Bantuan & Dukungan', color: '#F59E0B' },
    { icon: 'information-circle-outline', label: 'Tentang Aplikasi', color: '#3B82F6' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PURPLE} />}
      >
        {/* Header Gradient */}
        <LinearGradient colors={[PURPLE, '#5B21B6']} style={styles.headerGrad}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Nama Siswa'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user?.role === 'TEACHER' ? '👩‍🏫 Guru' : `🎓 Siswa Kelas ${user?.grade || '-'}`}
            </Text>
          </View>
        </LinearGradient>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            {[
              { icon: 'mail-outline', label: 'Email', value: user?.email || '-', color: PURPLE },
              { icon: 'school-outline', label: 'Kelas', value: user?.grade ? `Kelas ${user.grade}` : '-', color: '#10B981' },
              { icon: 'person-outline', label: 'Role', value: user?.role === 'TEACHER' ? 'Guru' : 'Siswa', color: '#F59E0B' },
            ].map((item, i) => (
              <View key={i} style={[styles.infoRow, i < 2 && styles.infoRowBorder]}>
                <View style={[styles.infoIconBox, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Pengaturan</Text>
          <View style={styles.menuCard}>
            {menuItems.map((item, i) => (
              <Pressable key={i} style={[styles.menuItem, i < menuItems.length - 1 && styles.menuItemBorder]}>
                <View style={[styles.menuIconBox, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Logout */}
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Keluar dari Akun</Text>
        </Pressable>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerGrad: { alignItems: 'center', paddingTop: 40, paddingBottom: 40, paddingHorizontal: 20 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  roleText: { fontSize: 13, color: '#fff', fontWeight: '600' },
  infoSection: { paddingHorizontal: 20, marginTop: 20, marginBottom: 20 },
  infoCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#94A3B8', marginBottom: 3 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  menuSection: { paddingHorizontal: 20, marginBottom: 20 },
  menuSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  menuCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: '#334155' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginHorizontal: 20, backgroundColor: '#FFF1F2', borderRadius: 14, paddingVertical: 16, borderWidth: 1, borderColor: '#FECDD3' },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
});

export default ProfileScreen;