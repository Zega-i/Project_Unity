import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, StatusBar, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { authStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const GREEN = '#16A34A';
const GREEN_LIGHT = '#F0FDF4';
const GREEN_MID = '#DCFCE7';

const TeacherProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight, triggerMedium } = useHapticFeedback();
  const user = authStore.getUserSync();

  const name    = user?.name    || 'Pak Budi';
  const email   = user?.email   || 'budi.guru@gmail.com';
  const school  = user?.school  || 'SMA Negeri 1 Jakarta';
  const subject = user?.subject || 'Matematika';
  const initial = name.charAt(0).toUpperCase();

  const handleLogout = () => {
    triggerMedium();
    Alert.alert(
      'Keluar',
      'Apakah Anda yakin ingin keluar dari akun?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => { await authStore.clearAuth(); },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'settings',
      label: 'Pengaturan',
      icon: 'settings-outline' as const,
      iconColor: GREEN,
      iconBg: GREEN_LIGHT,
      onPress: () => { triggerLight(); navigation.navigate('TeacherSettings' as any); },
    },
    {
      id: 'help',
      label: 'Bantuan',
      icon: 'information-circle-outline' as const,
      iconColor: GREEN,
      iconBg: GREEN_LIGHT,
      onPress: () => { triggerLight(); navigation.navigate('TeacherHelp' as any); },
    },
    {
      id: 'about',
      label: 'Tentang Aplikasi',
      icon: 'information-circle-outline' as const,
      iconColor: GREEN,
      iconBg: GREEN_LIGHT,
      onPress: () => { triggerLight(); navigation.navigate('TeacherAbout' as any); },
    },
    {
      id: 'logout',
      label: 'Keluar',
      icon: 'log-out-outline' as const,
      iconColor: '#EF4444',
      iconBg: '#FEF2F2',
      onPress: handleLogout,
      isDestructive: true,
    },
  ];

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background },
      ]}
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Page Title */}
        <Text style={[styles.pageTitle, { color: colors.text }]}>Profil Saya</Text>

        {/* ── Profile Card ── */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <View style={[styles.avatarCircle, { backgroundColor: GREEN_MID }]}>
              <Text style={[styles.avatarInitial, { color: GREEN }]}>{initial}</Text>
            </View>
          </View>

          {/* Name + role */}
          <Text style={[styles.profileName, { color: colors.text }]}>{name}</Text>
          <Text style={[styles.profileRole, { color: colors.textSecondary }]}>
            Guru {subject}
          </Text>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Info Rows */}
          <View style={styles.infoTable}>
            {[
              { label: 'Email',    value: email   },
              { label: 'Sekolah', value: school  },
              { label: 'Mengajar',value: subject },
            ].map((row, i) => (
              <View key={i} style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{row.label}</Text>
                <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Menu Card ── */}
        <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <Pressable
                style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.7 }]}
                onPress={item.onPress}
              >
                {/* Icon */}
                <View style={[styles.menuIconBox, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon} size={20} color={item.iconColor} />
                </View>

                {/* Label */}
                <Text
                  style={[
                    styles.menuLabel,
                    { color: item.isDestructive ? '#EF4444' : colors.text },
                  ]}
                >
                  {item.label}
                </Text>

                {/* Chevron */}
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={item.isDestructive ? '#EF4444' : colors.textSecondary}
                />
              </Pressable>

              {/* Separator (not after last item) */}
              {index < menuItems.length - 1 && (
                <View style={[styles.menuSep, { backgroundColor: colors.border }]} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Version footer */}
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          EduBridge v1.0.0 • Guru Edition
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1 },
  scrollContent:{ paddingHorizontal: 20, paddingBottom: 50 },

  pageTitle: {
    fontSize: 22, fontWeight: 'bold', marginTop: 16, marginBottom: 20,
  },

  // Profile Card
  profileCard: {
    borderRadius: 20, borderWidth: 1, paddingBottom: 20,
    marginBottom: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
  },
  avatarWrap:   { alignItems: 'center', marginTop: 28, marginBottom: 14 },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#16A34A40',
  },
  avatarInitial:{ fontSize: 36, fontWeight: 'bold' },
  profileName:  { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  profileRole:  { fontSize: 14, textAlign: 'center', marginBottom: 20 },

  divider: { height: 1, marginHorizontal: 20, marginBottom: 16 },

  infoTable: { paddingHorizontal: 20, gap: 12 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  infoLabel: { fontSize: 14, fontWeight: '600', flex: 1 },
  infoValue: { fontSize: 14, flex: 2, textAlign: 'right' },

  // Menu Card
  menuCard: {
    borderRadius: 20, borderWidth: 1, overflow: 'hidden',
    marginBottom: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 16, gap: 14,
  },
  menuIconBox: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  menuSep:   { height: 1, marginHorizontal: 16 },

  versionText: { fontSize: 12, textAlign: 'center' },
});

export default TeacherProfileScreen;