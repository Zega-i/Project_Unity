import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { authStore } from '../../store/authStore';

const PURPLE = '#7C3AED';

const ProfileScreen = () => {
  const user = {
    name: 'Agusta Rossi',
    email: 'agusta@edubridge.com',
    role: 'Siswa',
    grade: 'X IPA',
    school: 'SMA Maju Jaya',
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            await authStore.clearAuth();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileRole}>{user.role}</Text>
          </View>
        </View>

        {/* Profile Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Profil</Text>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{user.email}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Kelas</Text>
            <Text style={styles.detailValue}>{user.grade}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Sekolah</Text>
            <Text style={styles.detailValue}>{user.school}</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pengaturan</Text>
          <Pressable style={styles.settingItem}>
            <Text style={styles.settingLabel}>Notifikasi</Text>
            <Text style={styles.settingIcon}>→</Text>
          </Pressable>
          <Pressable style={styles.settingItem}>
            <Text style={styles.settingLabel}>Privasi</Text>
            <Text style={styles.settingIcon}>→</Text>
          </Pressable>
          <Pressable style={styles.settingItem}>
            <Text style={styles.settingLabel}>Bantuan</Text>
            <Text style={styles.settingIcon}>→</Text>
          </Pressable>
        </View>

        {/* Logout Button */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Keluar</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  avatarText: {
    fontSize: 48,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  detailItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  settingIcon: {
    fontSize: 16,
    color: PURPLE,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;