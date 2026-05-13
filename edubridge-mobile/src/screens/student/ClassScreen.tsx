import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, TextInput, Alert, Modal, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const PURPLE = '#7C3AED';

// Static class data (will be replaced when class API endpoints are added to backend)
const STATIC_CLASSES = [
  { id: '1', name: 'Matematika 10A', teacher: 'Pak Budi', progress: 75, color: '#6366F1', icon: '📐' },
  { id: '2', name: 'Fisika 10A', teacher: 'Pak Budi', progress: 60, color: '#F59E0B', icon: '⚡' },
  { id: '3', name: 'Biologi 10A', teacher: 'Bu Rina', progress: 40, color: '#10B981', icon: '🧬' },
  { id: '4', name: 'Bahasa Inggris 10A', teacher: 'Bu Rina', progress: 80, color: '#3B82F6', icon: '📚' },
];

const ClassScreen = () => {
  const [activeTab, setActiveTab] = useState<'aktif' | 'selesai'>('aktif');
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!classCode.trim()) {
      Alert.alert('Error', 'Masukkan kode kelas terlebih dahulu');
      return;
    }
    setJoining(true);
    // Simulate join class
    await new Promise(r => setTimeout(r, 1000));
    setJoining(false);
    setJoinModalVisible(false);
    setClassCode('');
    Alert.alert('Berhasil', 'Permintaan bergabung telah dikirim ke guru!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kelas Saya</Text>
          <Pressable style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color="#1E293B" />
          </Pressable>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, activeTab === 'aktif' && styles.tabActive]}
            onPress={() => setActiveTab('aktif')}
          >
            <Text style={[styles.tabText, activeTab === 'aktif' && styles.tabTextActive]}>Aktif</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'selesai' && styles.tabActive]}
            onPress={() => setActiveTab('selesai')}
          >
            <Text style={[styles.tabText, activeTab === 'selesai' && styles.tabTextActive]}>Selesai</Text>
          </Pressable>
        </View>

        {/* Class List */}
        <View style={styles.classList}>
          {STATIC_CLASSES.map((cls) => (
            <Pressable key={cls.id} style={styles.classCard}>
              <View style={[styles.classIconBox, { backgroundColor: cls.color + '15' }]}>
                <Text style={styles.classIcon}>{cls.icon}</Text>
              </View>
              <View style={styles.classInfo}>
                <Text style={styles.className}>{cls.name}</Text>
                <Text style={styles.classTeacher}>{cls.teacher}</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${cls.progress}%`, backgroundColor: cls.color }]} />
                </View>
              </View>
              <Text style={[styles.classProgress, { color: cls.color }]}>{cls.progress}%</Text>
            </Pressable>
          ))}
        </View>

        {/* Join Class Button */}
        <Pressable style={styles.joinBtn} onPress={() => setJoinModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={22} color={PURPLE} />
          <View style={styles.joinBtnText}>
            <Text style={styles.joinBtnTitle}>Gabung Kelas Baru</Text>
            <Text style={styles.joinBtnSub}>Masukkan kode kelas</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </Pressable>
      </ScrollView>

      {/* Join Modal */}
      <Modal visible={joinModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Gabung Kelas</Text>
            <Text style={styles.modalSub}>Masukkan kode kelas yang diberikan oleh guru</Text>
            <TextInput
              style={styles.codeInput}
              placeholder="Contoh: MAT-10A-2026"
              value={classCode}
              onChangeText={setClassCode}
              autoCapitalize="characters"
              placeholderTextColor="#94A3B8"
            />
            <View style={styles.modalBtns}>
              <Pressable style={styles.cancelBtn} onPress={() => setJoinModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Batal</Text>
              </Pressable>
              <Pressable style={styles.submitBtn} onPress={handleJoin} disabled={joining}>
                {joining ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitBtnText}>Gabung</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#F1F5F9', borderRadius: 10, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#94A3B8' },
  tabTextActive: { color: PURPLE },
  classList: { paddingHorizontal: 20 },
  classCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  classIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  classIcon: { fontSize: 24 },
  classInfo: { flex: 1 },
  className: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  classTeacher: { fontSize: 12, color: '#64748B', marginBottom: 8 },
  progressBarBg: { height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 2 },
  classProgress: { fontSize: 14, fontWeight: 'bold', marginLeft: 12 },
  joinBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginHorizontal: 20, marginTop: 8, marginBottom: 30, borderWidth: 2, borderColor: PURPLE + '30', borderStyle: 'dashed' },
  joinBtnText: { flex: 1, marginLeft: 12 },
  joinBtnTitle: { fontSize: 14, fontWeight: '700', color: PURPLE },
  joinBtnSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  modalSub: { fontSize: 14, color: '#64748B', marginBottom: 20 },
  codeInput: { backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, fontWeight: '600', color: '#1E293B', letterSpacing: 2, marginBottom: 20 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#64748B' },
  submitBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: PURPLE, alignItems: 'center' },
  submitBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});

export default ClassScreen;
