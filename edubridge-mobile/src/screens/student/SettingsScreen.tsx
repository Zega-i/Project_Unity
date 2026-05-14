import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Switch,
  SafeAreaView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { useTheme } from '../../contexts/ThemeContext';
import { useHaptic } from '../../contexts/HapticContext';
import { authStore } from '../../store/authStore';

const PURPLE = '#7C3AED';

const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const { triggerMedium } = useHapticFeedback();
  const { isDarkMode, toggleDarkMode, colors } = useTheme();
  const { isHapticEnabled, toggleHaptic } = useHaptic();
  const [notifications, setNotifications] = useState(true);

  const handleNotificationToggle = async (newValue: boolean) => {
    triggerMedium();
    setNotifications(newValue);
  };

  const handleDarkModeToggle = async (newValue: boolean) => {
    triggerMedium();
    toggleDarkMode();
  };

  const handleHapticToggle = async (newValue: boolean) => {
    triggerMedium();
    toggleHaptic();
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Pengaturan</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Learning Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferensi Pembelajaran</Text>

          <View style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="notifications-outline" size={20} color={PURPLE} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Notifikasi Pembelajaran</Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Reminder untuk quiz dan materi baru</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.border, true: PURPLE + '40' }}
              thumbColor={notifications ? PURPLE : colors.disabled}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FEFCE8' }]}>
                <Ionicons name="phone-portrait-outline" size={20} color="#F59E0B" />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Haptic Feedback</Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Getaran saat mengklik atau mengetik</Text>
              </View>
            </View>
            <Switch
              value={isHapticEnabled}
              onValueChange={handleHapticToggle}
              trackColor={{ false: colors.border, true: '#F59E0B40' }}
              thumbColor={isHapticEnabled ? '#F59E0B' : colors.disabled}
            />
          </View>
        </View>

        {/* Display Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Tampilan</Text>

          <View style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="moon-outline" size={20} color="#8B5CF6" />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Mode Gelap</Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Lebih nyaman untuk mata</Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: colors.border, true: '#8B5CF640' }}
              thumbColor={isDarkMode ? '#8B5CF6' : colors.disabled}
            />
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Keamanan Akun</Text>

          <Pressable style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => { triggerMedium(); navigation.navigate('ChangePassword' as any); }}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FDF2F8' }]}>
                <Ionicons name="key-outline" size={20} color="#EC4899" />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Ganti Password</Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Ubah password akun Anda</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>

          <Pressable style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => { triggerMedium(); navigation.navigate('PrivacyData' as any); }}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Privasi & Data</Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Kelola pengaturan data Anda</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Version Info */}
        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: colors.text }]}>EduBridge v1.0.0</Text>
          <Text style={[styles.versionDesc, { color: colors.textSecondary }]}>Build 2026.05.14 • Proudly Made for Students</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, marginBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
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
