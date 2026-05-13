import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, Image, ActivityIndicator, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { authStore } from '../../store/authStore';
import { authAPI } from '../../services/api';

const PURPLE = '#7C3AED';

const ProfileScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const fetchProfile = async () => {
    try {
      // Pertama cek dari cache
      const cachedUser = authStore.getUserSync();
      console.log('[ProfileScreen] Cached user:', cachedUser?.name);
      if (cachedUser?.name) {
        setUser(cachedUser);
      }

      // Fetch fresh data dari API
      const res = await authAPI.getProfile();
      console.log('[ProfileScreen] API response:', res?.name, res?.school);
      if (res && res.id) {
        setUser(res);
        const token = await authStore.getToken();
        await authStore.setAuth(token || '', res);
      }
    } catch (err) {
      console.log('[ProfileScreen] Fetch error:', err);
      // Fallback ke cached data
      const cachedUser = authStore.getUserSync();
      setUser(cachedUser);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAction = async () => {
    setLogoutModalVisible(false);
    await authStore.logout();
    // No need to navigate, AppNavigator will switch stack based on auth state
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={PURPLE} />
    </View>
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Profil Saya</Text>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2080&auto=format&fit=crop' }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
          <Text style={styles.userRole}>{user?.role === 'TEACHER' ? 'Guru' : 'Siswa'}</Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email || '-'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Kelas</Text>
            <Text style={styles.infoValue}>{user?.className || user?.grade || '-'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Sekolah</Text>
            <Text style={styles.infoValue}>{user?.school || '-'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Tanggal Lahir</Text>
            <Text style={styles.infoValue}>{formatDate(user?.dateOfBirth)}</Text>
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.menuCard}>
          {[
            { label: 'Pengaturan', icon: 'settings-outline', color: '#64748B' },
            { label: 'Bantuan', icon: 'information-circle-outline', color: '#64748B' },
            { label: 'Tentang Aplikasi', icon: 'alert-circle-outline', color: '#64748B' },
          ].map((item, idx) => (
            <Pressable key={idx} style={styles.menuItem}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </Pressable>
          ))}
          <Pressable
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={() => setLogoutModalVisible(true)}
          >
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text style={[styles.menuLabel, { color: '#EF4444' }]}>Keluar</Text>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </Pressable>
        </View>
      </ScrollView>

      {/* Modern Logout Modal */}
      <Modal visible={logoutModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.warningIcon}>
              <Ionicons name="warning-outline" size={32} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Konfirmasi Keluar</Text>
            <Text style={styles.modalSub}>Apakah Anda yakin ingin keluar dari akun ini?</Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.cancelText}>Batal</Text>
              </Pressable>
              <Pressable
                style={styles.confirmBtn}
                onPress={handleLogoutAction}
              >
                <Text style={styles.confirmText}>Keluar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 25, paddingTop: 20, paddingBottom: 90 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 30 },
  avatarSection: { alignItems: 'center', marginBottom: 40 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F1F5F9', padding: 4, marginBottom: 16, overflow: 'hidden' },
  avatar: { width: '100%', height: '100%', borderRadius: 50 },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 6 },
  userRole: { fontSize: 14, color: '#94A3B8' },
  infoSection: { marginBottom: 40 },
  infoItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  infoValue: { fontSize: 14, color: '#1E293B', fontWeight: '600' },
  menuCard: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  menuLabel: { flex: 1, marginLeft: 16, fontSize: 15, fontWeight: '600', color: '#1E293B' },

  /* Modal Styles */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#FFFFFF', width: '85%', borderRadius: 24, padding: 24, alignItems: 'center' },
  warningIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  modalSub: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  modalActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', marginRight: 12 },
  cancelText: { color: '#64748B', fontWeight: 'bold', fontSize: 15 },
  confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#EF4444', alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});

export default ProfileScreen;