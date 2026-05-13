import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Switch,
  SafeAreaView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';

const PURPLE = '#7C3AED';

const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', onPress: () => {} },
      { text: 'Keluar', onPress: () => navigation.navigate('Login'), style: 'destructive' },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#1E293B" />
          </Pressable>
          <Text style={styles.headerTitle}>Pengaturan</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Learning Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferensi Pembelajaran</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="notifications-outline" size={20} color={PURPLE} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Notifikasi Pembelajaran</Text>
                <Text style={styles.settingDesc}>Reminder untuk quiz dan materi baru</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#E2E8F0', true: PURPLE + '40' }}
              thumbColor={notifications ? PURPLE : '#94A3B8'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FEFCE8' }]}>
                <Ionicons name="volume-high-outline" size={20} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.settingLabel}>Suara & Haptic</Text>
                <Text style={styles.settingDesc}>Suara saat menjawab soal</Text>
              </View>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#E2E8F0', true: '#F59E0B40' }}
              thumbColor={soundEnabled ? '#F59E0B' : '#94A3B8'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="download-outline" size={20} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.settingLabel}>Mode Offline</Text>
                <Text style={styles.settingDesc}>Belajar tanpa koneksi internet</Text>
              </View>
            </View>
            <Switch
              value={offlineMode}
              onValueChange={setOfflineMode}
              trackColor={{ false: '#E2E8F0', true: '#3B82F640' }}
              thumbColor={offlineMode ? '#3B82F6' : '#94A3B8'}
            />
          </View>
        </View>

        {/* Display Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tampilan</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="moon-outline" size={20} color="#8B5CF6" />
              </View>
              <View>
                <Text style={styles.settingLabel}>Mode Gelap</Text>
                <Text style={styles.settingDesc}>Lebih nyaman untuk mata</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#E2E8F0', true: '#8B5CF640' }}
              thumbColor={darkMode ? '#8B5CF6' : '#94A3B8'}
            />
          </View>
        </View>

        {/* Help & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bantuan & Dukungan</Text>

          <Pressable style={styles.menuItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="help-circle-outline" size={20} color="#10B981" />
              </View>
              <View>
                <Text style={styles.settingLabel}>Pusat Bantuan</Text>
                <Text style={styles.settingDesc}>FAQ dan tutorial</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </Pressable>

          <Pressable style={styles.menuItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="mail-outline" size={20} color="#EF4444" />
              </View>
              <View>
                <Text style={styles.settingLabel}>Hubungi Kami</Text>
                <Text style={styles.settingDesc}>support@edubridge.com</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </Pressable>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Akun</Text>

          <Pressable style={styles.menuItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FDF2F8' }]}>
                <Ionicons name="key-outline" size={20} color="#EC4899" />
              </View>
              <View>
                <Text style={styles.settingLabel}>Ganti Password</Text>
                <Text style={styles.settingDesc}>Ubah password akun Anda</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </Pressable>

          <Pressable style={styles.menuItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="document-text-outline" size={20} color={PURPLE} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Kebijakan Privasi</Text>
                <Text style={styles.settingDesc}>Syarat & ketentuan penggunaan</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </Pressable>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Pressable style={styles.dangerBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
            <Text style={styles.dangerBtnText}>Keluar dari Akun</Text>
          </Pressable>
        </View>

        {/* Version */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>EduBridge v1.0.0</Text>
          <Text style={styles.versionDesc}>Build 2026.05.14</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 90 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  section: { marginBottom: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },

  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  settingDesc: { fontSize: 12, color: '#94A3B8', marginTop: 2 },

  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9' },

  dangerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EF4444', borderRadius: 14, padding: 16, gap: 10 },
  dangerBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

  footer: { alignItems: 'center', paddingVertical: 24 },
  versionText: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  versionDesc: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
});

export default SettingsScreen;
