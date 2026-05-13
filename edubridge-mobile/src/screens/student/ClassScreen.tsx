import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
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
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kelas Saya</Text>
          <Pressable style={styles.searchBtn}>
            <Ionicons name="search-outline" size={24} color="#1E293B" />
          </Pressable>
        </View>

        {/* Tab Pills */}
        <View style={styles.tabContainer}>
          <Pressable 
            style={[styles.tab, activeTab === 'aktif' && styles.tabActive]}
            onPress={() => setActiveTab('aktif')}
          >
            <Text style={[styles.tabText, activeTab === 'aktif' && styles.tabTextActive]}>Sedang Aktif</Text>
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  searchBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 14, padding: 4, marginBottom: 25 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#94A3B8' },
  tabTextActive: { color: PURPLE },
  classList: { gap: 16 },
  classCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 1 },
  classCardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  classIconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  classEmoji: { fontSize: 24 },
  classInfo: { flex: 1 },
  className: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  teacherName: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  progressPercent: { fontSize: 14, fontWeight: 'bold', color: PURPLE },
  progressBarBg: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4 },
  progressBarFill: { height: '100%', backgroundColor: PURPLE, borderRadius: 4 },
  joinBtn: { marginTop: 30, flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  joinIconBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  joinTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  joinSub: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
});

export default ClassScreen;
