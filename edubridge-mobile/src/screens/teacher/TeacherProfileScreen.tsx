import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable,
  StatusBar, Modal, Image, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authStore } from '../../store/authStore';
import { authAPI } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import PremiumModal from '../../components/PremiumModal';
import { EditProfilePictureModal } from '../student/EditProfilePictureModal';

const GREEN = '#16A34A';
const GREEN_LIGHT = '#D1FAE5';

const TeacherProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight, triggerMedium } = useHapticFeedback();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editAvatarVisible, setEditAvatarVisible] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editSchool, setEditSchool] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editNip, setEditNip] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);

  const fetchProfile = async () => {
    try {
      const cached = authStore.getUserSync();
      if (cached?.name) {
        const savedAvatar = cached.id ? await AsyncStorage.getItem(`avatar_teacher_${cached.id}`) : null;
        setUser({ ...cached, avatar: savedAvatar || cached.avatar });
      }

      const res = await authAPI.getProfile();
      if (res && res.id) {
        const savedAvatar = await AsyncStorage.getItem(`avatar_teacher_${res.id}`);
        const merged = { ...res, avatar: savedAvatar || res.avatar };
        setUser(merged);
        const token = await authStore.getToken();
        await authStore.setAuth(token || '', merged);
      }
    } catch {
      const cached = authStore.getUserSync();
      if (cached) {
        const savedAvatar = cached.id ? await AsyncStorage.getItem(`avatar_teacher_${cached.id}`) : null;
        setUser({ ...cached, avatar: savedAvatar || cached.avatar });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const openEditProfile = () => {
    setEditName(user?.name || '');
    setEditSchool(user?.school || '');
    setEditSubject(user?.subjectTaught || user?.subject || '');
    setEditPhone(user?.phone || '');
    setEditNip(user?.nip || '');
    setEditProfileVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setAlertModal({
        visible: true,
        type: 'warning',
        title: 'Perhatian',
        message: 'Nama tidak boleh kosong',
      });
      return;
    }

    setSavingProfile(true);
    try {
      triggerMedium();
      const res = await authAPI.updateProfile({
        name: editName,
        school: editSchool,
        subjectTaught: editSubject,
        phone: editPhone,
        nip: editNip,
      });

      if (res.success) {
        const updated = { ...user, ...res.data };
        setUser(updated);
        const token = await authStore.getToken();
        await authStore.setAuth(token || '', updated);
        setEditProfileVisible(false);
        triggerLight();
        setAlertModal({
          visible: true,
          type: 'success',
          title: 'Sukses',
          message: 'Profil berhasil diperbarui',
        });
      }
    } catch (err) {
      setAlertModal({
        visible: true,
        type: 'error',
        title: 'Gagal',
        message: 'Gagal memperbarui profil. Coba lagi.',
      });
      console.error('Update profile error:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarSelected = async (imageBase64: string, fileName: string) => {
    setUploadingAvatar(true);
    try {
      triggerLight();
      const res = await authAPI.uploadAvatar(imageBase64, fileName);

      if (res.success) {
        const avatarUrl = res.data?.avatarUrl || res.data?.avatar;
        const updated = { ...user, avatar: avatarUrl };
        setUser(updated);

        const token = await authStore.getToken();
        await authStore.setAuth(token || '', updated);

        if (user?.id) {
          await AsyncStorage.setItem(`avatar_teacher_${user.id}`, avatarUrl);
        }

        triggerLight();
        setAlertModal({
          visible: true,
          type: 'success',
          title: 'Sukses',
          message: 'Foto profil berhasil diubah',
        });
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      setAlertModal({
        visible: true,
        type: 'error',
        title: 'Gagal',
        message: 'Gagal mengubah foto profil',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const confirmLogout = () => {
    setLogoutVisible(false);
    authStore.clearAuth();
  };

  const menuItems = [
    { id: 'Settings',  label: 'Pengaturan',      icon: 'settings-outline' },
    { id: 'Help',      label: 'Pusat Bantuan',    icon: 'help-circle-outline' },
    { id: 'About',     label: 'Tentang Aplikasi', icon: 'information-circle-outline' },
  ];

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    );
  }

  const displayName = user?.name || 'Nama Guru';
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Profil</Text>
          <Pressable
            style={[styles.editBtn, { backgroundColor: GREEN + '14', borderColor: GREEN }]}
            onPress={() => { triggerLight(); openEditProfile(); }}
          >
            <Ionicons name="pencil" size={16} color={GREEN} />
            <Text style={[styles.editBtnText, { color: GREEN }]}>Edit</Text>
          </Pressable>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Avatar */}
          <Pressable
            style={styles.avatarWrapper}
            onPress={() => { triggerLight(); setEditAvatarVisible(true); }}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>{initials}</Text>
              </View>
            )}
            {/* Edit badge */}
            <View style={styles.avatarBadge}>
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="camera" size={14} color="#FFF" />
              )}
            </View>
          </Pressable>

          <Text style={[styles.userName, { color: colors.text }]}>{displayName}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || ''}</Text>

          {/* Role badge */}
          <View style={styles.roleBadge}>
            <Ionicons name="school" size={13} color={GREEN} />
            <Text style={styles.roleText}>Guru</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { icon: 'school-outline', label: 'Sekolah', value: user?.school || 'Belum diatur' },
            { icon: 'book-outline', label: 'Mata Pelajaran', value: user?.subjectTaught || user?.subject || 'Belum diatur' },
            { icon: 'id-card-outline', label: 'NIP / ID Guru', value: user?.nip || '-' },
            { icon: 'call-outline', label: 'Nomor Telepon', value: user?.phone || '-' },
          ].map((item, idx, arr) => (
            <View key={item.label}>
              <View style={styles.infoRow}>
                <View style={[styles.infoIconBox, { backgroundColor: GREEN + '14' }]}>
                  <Ionicons name={item.icon as any} size={18} color={GREEN} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{item.value}</Text>
                </View>
              </View>
              {idx < arr.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            </View>
          ))}
        </View>

        {/* Menu Card */}
        <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {menuItems.map((item, i) => (
            <React.Fragment key={item.id}>
              <Pressable
                style={styles.menuItem}
                onPress={() => { triggerLight(); navigation.navigate(item.id); }}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIconBox, { backgroundColor: colors.surface || colors.background }]}>
                    <Ionicons name={item.icon as any} size={20} color={colors.text} />
                  </View>
                  <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </Pressable>
              {i < menuItems.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            </React.Fragment>
          ))}
        </View>

        {/* Logout Button */}
        <Pressable
          style={styles.logoutBtn}
          onPress={() => { triggerMedium(); setLogoutVisible(true); }}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Keluar Akun</Text>
        </Pressable>

      </ScrollView>

      {/* Edit Avatar Modal */}
      <EditProfilePictureModal
        visible={editAvatarVisible}
        currentAvatar={user?.avatar}
        onClose={() => setEditAvatarVisible(false)}
        onImageSelected={handleAvatarSelected}
        loading={uploadingAvatar}
        accentColor={GREEN}
      />

      {/* Edit Profile Modal */}
      <Modal visible={editProfileVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.editModalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.editModalContainer, { backgroundColor: colors.card }]}>
            {/* Handle */}
            <View style={styles.modalHandle} />

            <View style={styles.editModalHeader}>
              <Text style={[styles.editModalTitle, { color: colors.text }]}>Edit Profil</Text>
              <Pressable onPress={() => setEditProfileVisible(false)} disabled={savingProfile}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { label: 'Nama Lengkap', value: editName, setter: setEditName, placeholder: 'Nama lengkap guru', icon: 'person-outline', required: true },
                { label: 'Sekolah', value: editSchool, setter: setEditSchool, placeholder: 'Nama sekolah', icon: 'school-outline' },
                { label: 'Mata Pelajaran', value: editSubject, setter: setEditSubject, placeholder: 'Contoh: Matematika', icon: 'book-outline' },
                { label: 'NIP', value: editNip, setter: setEditNip, placeholder: 'Nomor Induk Pegawai', icon: 'id-card-outline' },
                { label: 'Nomor Telepon', value: editPhone, setter: setEditPhone, placeholder: '+62 8xx-xxxx-xxxx', icon: 'call-outline', keyboard: 'phone-pad' },
              ].map((field) => (
                <View key={field.label} style={styles.fieldWrapper}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    {field.label}{field.required ? <Text style={{ color: '#EF4444' }}> *</Text> : ''}
                  </Text>
                  <View style={[styles.fieldInputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Ionicons name={field.icon as any} size={18} color={GREEN} style={{ marginLeft: 12 }} />
                    <TextInput
                      style={[styles.fieldInput, { color: colors.text }]}
                      value={field.value}
                      onChangeText={field.setter}
                      placeholder={field.placeholder}
                      placeholderTextColor={colors.textSecondary}
                      keyboardType={field.keyboard as any}
                      editable={!savingProfile}
                    />
                  </View>
                </View>
              ))}

              <Pressable
                style={[styles.saveBtn, savingProfile && styles.saveBtnDisabled]}
                onPress={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#FFF" />
                    <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                style={[styles.cancelModalBtn, { borderColor: colors.border }]}
                onPress={() => setEditProfileVisible(false)}
                disabled={savingProfile}
              >
                <Text style={[styles.cancelModalText, { color: colors.textSecondary }]}>Batal</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Logout Confirm Modal */}
      <PremiumModal
        visible={logoutVisible}
        type="error"
        icon="log-out"
        title="Keluar Akun?"
        message="Apakah Anda yakin ingin keluar dari akun EduBridge Anda? Sesi Anda akan dihentikan."
        confirmText="Ya, Keluar"
        cancelText="Batal"
        onConfirm={confirmLogout}
        onCancel={() => setLogoutVisible(false)}
      />

      {alertModal && (
        <PremiumModal
          visible={alertModal.visible}
          type={alertModal.type}
          title={alertModal.title}
          message={alertModal.message}
          onConfirm={() => setAlertModal(null)}
          accentColor={GREEN}
          minimal
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: 20, paddingBottom: 60 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, marginBottom: 20 },
  pageTitle: { fontSize: 24, fontWeight: 'bold' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  editBtnText: { fontSize: 14, fontWeight: '700' },

  profileCard: { borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, marginBottom: 16 },
  avatarWrapper: { position: 'relative', marginBottom: 14 },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  avatarBadge: { position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: 14, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: '#FFF' },
  userName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  userEmail: { fontSize: 13, marginBottom: 10 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#D1FAE5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  roleText: { fontSize: 12, fontWeight: '700', color: GREEN },

  infoCard: { borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 14 },
  infoIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: 'bold' },
  divider: { height: 1, marginVertical: 2 },

  menuCard: { borderRadius: 20, paddingHorizontal: 12, borderWidth: 1, marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '600' },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: '#EF4444', gap: 10, marginTop: 4 },
  logoutText: { fontSize: 15, fontWeight: 'bold', color: '#EF4444' },

  // Edit Profile Modal
  editModalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  editModalContainer: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36, maxHeight: '90%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', alignSelf: 'center', marginBottom: 16 },
  editModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  editModalTitle: { fontSize: 18, fontWeight: '700' },
  fieldWrapper: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  fieldInputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1.5, height: 48 },
  fieldInput: { flex: 1, paddingHorizontal: 12, fontSize: 15, height: '100%' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: GREEN, borderRadius: 14, paddingVertical: 16, gap: 8, marginTop: 10, marginBottom: 10 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  cancelModalBtn: { paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1 },
  cancelModalText: { fontSize: 15, fontWeight: '600' },
});

export default TeacherProfileScreen;