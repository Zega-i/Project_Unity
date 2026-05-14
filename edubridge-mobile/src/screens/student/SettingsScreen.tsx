import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Switch,
  SafeAreaView,
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

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#1E293B" />
          </Pressable>
          <Text style={styles.headerTitle}>Pengaturan</Text>
          <View style={{ width: 40 }} />
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

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Keamanan Akun</Text>

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
              <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" />
              </View>
              <View>
                <Text style={styles.settingLabel}>Privasi & Data</Text>
                <Text style={styles.settingDesc}>Kelola pengaturan data Anda</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </Pressable>
        </View>

        {/* Version Info */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>EduBridge v1.0.0</Text>
          <Text style={styles.versionDesc}>Build 2026.05.14 • Proudly Made for Students</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, marginBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#64748B', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 14 },
  iconBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  settingDesc: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  footer: { alignItems: 'center', marginTop: 40, paddingBottom: 20 },
  versionText: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  versionDesc: { fontSize: 11, color: '#94A3B8', marginTop: 6 },
});

export default SettingsScreen;
