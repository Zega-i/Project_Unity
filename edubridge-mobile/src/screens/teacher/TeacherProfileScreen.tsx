import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  Pressable, StatusBar, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { authStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const GREEN = '#16A34A';

const TeacherProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight, triggerMedium } = useHapticFeedback();
  const user = authStore.getUserSync();

  const [logoutVisible, setLogoutVisible] = useState(false);

  const handleLogout = () => {
    triggerMedium();
    setLogoutVisible(true);
  };

  const confirmLogout = () => {
    setLogoutVisible(false);
    authStore.clearAuth();
  };

  const menuItems = [
    { id: 'Settings',     label: 'Pengaturan',      icon: 'settings-outline' },
    { id: 'HelpCenter',   label: 'Pusat Bantuan',    icon: 'help-circle-outline' },
    { id: 'About',        label: 'Tentang Aplikasi', icon: 'information-circle-outline' },
  ];

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Profil</Text>
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.avatarCircle}><Text style={styles.avatarInitial}>{user?.name?.charAt(0) || 'G'}</Text></View>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'Nama Guru'}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || 'guru@edubridge.com'}</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={20} color={GREEN} />
            <View>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Sekolah</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{user?.school || 'Belum diatur'}</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <Ionicons name="book-outline" size={20} color={GREEN} />
            <View>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Mata Pelajaran</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{user?.subject || 'Belum diatur'}</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <Ionicons name="id-card-outline" size={20} color={GREEN} />
            <View>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>NIP / ID Guru</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{user?.nip || '-'}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {menuItems.map((item, i) => (
            <React.Fragment key={item.id}>
              <Pressable style={styles.menuItem} onPress={() => { triggerLight(); navigation.navigate(item.id as any); }}>
                <View style={styles.menuLeft}><Ionicons name={item.icon as any} size={22} color={colors.text} /><Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text></View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </Pressable>
              {i < menuItems.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            </React.Fragment>
          ))}
        </View>
          <Pressable 
            style={[styles.logoutBtn, { borderColor: '#EF4444' }]} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text style={styles.logoutText}>Keluar Akun</Text>
          </Pressable>
        </ScrollView>

        {/* Custom Logout Modal */}
        <Modal
          visible={logoutVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setLogoutVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
              <View style={[styles.modalIconCircle, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="log-out-outline" size={32} color="#EF4444" />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Keluar Akun?</Text>
              <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
                Apakah Anda yakin ingin keluar dari akun EduBridge Anda?
              </Text>
              <View style={styles.modalActions}>
                <Pressable 
                  style={[styles.modalBtn, { backgroundColor: colors.surface }]} 
                  onPress={() => setLogoutVisible(false)}
                >
                  <Text style={[styles.modalBtnText, { color: colors.text }]}>Batal</Text>
                </Pressable>
                <Pressable 
                  style={[styles.modalBtn, { backgroundColor: GREEN }]} 
                  onPress={confirmLogout}
                >
                  <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Keluar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 50 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 10, marginBottom: 20 },
  profileCard: { borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, marginBottom: 16 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarInitial: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  userName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  userEmail: { fontSize: 14 },
  infoCard: { borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 16, gap: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  infoLabel: { fontSize: 11, fontWeight: '600' },
  infoValue: { fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  divider: { height: 1 },
  menuCard: { borderRadius: 20, paddingHorizontal: 16, borderWidth: 1, marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuLabel: { fontSize: 15, fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, borderWidth: 1, gap: 10, marginTop: 10 },
  logoutText: { fontSize: 15, fontWeight: 'bold', color: '#EF4444' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '85%', borderRadius: 28, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  modalIconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  modalMessage: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  modalBtnText: { fontSize: 15, fontWeight: '700' },
});

export default TeacherProfileScreen;