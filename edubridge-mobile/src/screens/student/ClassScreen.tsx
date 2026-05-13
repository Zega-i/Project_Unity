import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { classAPI } from '../../services/api';

const PURPLE = '#7C3AED';

const ClassScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'aktif' | 'selesai'>('aktif');
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);

  const fetchClasses = async () => {
    try {
      const res = await classAPI.getMyClasses();
      setClasses(res.data || res);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color="#1E293B" />
          </Pressable>
          <Text style={styles.headerTitle}>Kelas Saya</Text>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={24} color="#1E293B" />
          </Pressable>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
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
          {classes.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: '#94A3B8' }}>Belum bergabung di kelas mana pun.</Text>
            </View>
          ) : classes.map((cls) => (
            <Pressable 
              key={cls.id} 
              style={styles.classCard}
              onPress={() => navigation.navigate('SubjectModules', { classId: cls.id, className: cls.name })}
            >
              <View style={styles.classCardTop}>
                <View style={styles.classIconBox}>
                  <Text style={styles.classEmoji}>{cls.icon || '📗'}</Text>
                </View>
                <View style={styles.classInfo}>
                  <Text style={styles.className}>{cls.name}</Text>
                  <Text style={styles.teacherName}>{cls.teacher?.name || 'Guru'}</Text>
                </View>
                <Text style={styles.progressPercent}>{cls.progress || 0}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${cls.progress || 0}%` }]} />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Join Class Button */}
        <Pressable 
          style={styles.joinBtn} 
          onPress={() => navigation.navigate('JoinClass')}
        >
          <View style={styles.joinIconBox}>
            <Ionicons name="add" size={30} color={PURPLE} />
          </View>
          <View>
            <Text style={styles.joinTitle}>Gabung Kelas Baru</Text>
            <Text style={styles.joinSub}>Masukkan kode kelas</Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  iconBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 100,
    marginHorizontal: 20,
    padding: 6,
    marginBottom: 30,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 100 },
  tabActive: { backgroundColor: PURPLE, shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#94A3B8' },
  tabTextActive: { color: '#FFFFFF' },
  classList: { paddingHorizontal: 20 },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  classCardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  classIconBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  classEmoji: { fontSize: 24 },
  classInfo: { flex: 1 },
  className: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  teacherName: { fontSize: 13, color: '#94A3B8' },
  progressPercent: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  progressBarBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: PURPLE, borderRadius: 3 },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
  },
  joinIconBox: { marginRight: 16 },
  joinTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  joinSub: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 30 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 20, textAlign: 'center' },
  modalInput: { backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, fontSize: 16, textAlign: 'center', fontWeight: 'bold', marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalBtnCancel: { flex: 1, padding: 16, alignItems: 'center' },
  modalBtnCancelText: { color: '#94A3B8', fontWeight: '600' },
  modalBtnJoin: { flex: 1, backgroundColor: PURPLE, padding: 16, borderRadius: 12, alignItems: 'center' },
  modalBtnJoinText: { color: '#FFFFFF', fontWeight: 'bold' },
});

export default ClassScreen;
