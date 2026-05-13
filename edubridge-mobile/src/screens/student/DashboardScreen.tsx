import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, Image, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { authStore } from '../../store/authStore';
import { authAPI } from '../../services/api';

const PURPLE = '#7C3AED';

const DashboardScreen = () => {
  const navigation = useNavigation<any>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async () => {
    try {
      const res = await authAPI.getProfile();
      const profile = res.data || res;
      setUser(profile);
      await authStore.setAuth(await authStore.getToken() || '', profile);
    } catch {
      const cached = authStore.getUserSync();
      if (cached) setUser(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const recommendations = [
    { id: '1', title: 'Persamaan Linear', subject: 'Matematika', level: 'Dasar', duration: '15 Menit', progress: 60, color: '#6366F1', icon: '📐' },
    { id: '2', title: 'Hukum Newton', subject: 'Fisika', level: 'Menengah', duration: '20 Menit', progress: 40, color: '#F59E0B', icon: '⚡' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  const firstName = user?.name?.split(' ')[0] || 'Siswa';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View>
            <Text style={styles.greeting}>Halo, {firstName}! 👋</Text>
            <Text style={styles.subGreeting}>Semangat belajar hari ini!</Text>
          </View>
        </View>
        <Pressable style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={24} color="#1E293B" />
          <View style={styles.notifDot} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PURPLE} />}
      >
        {/* Ringkasan Belajar Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <View style={styles.circularProgress}>
              <View style={styles.innerCircle}>
                <Text style={styles.progressPercent}>75%</Text>
              </View>
            </View>
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.summaryTitle}>Ringkasan Belajarmu</Text>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatVal}>7</Text>
              <Text style={styles.summaryStatLabel}>Mata Pelajaran</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatVal}>12</Text>
              <Text style={styles.summaryStatLabel}>Streak Belajar</Text>
            </View>
          </View>
        </View>

        {/* Rekomendasi Belajar Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rekomendasi Belajar</Text>
            <Pressable>
              <Text style={styles.seeAllText}>Lihat Semua</Text>
            </Pressable>
          </View>

          {recommendations.map((item) => (
            <Pressable key={item.id} style={styles.recCard}>
              <View style={[styles.recIconBox, { backgroundColor: item.color + '15' }]}>
                <Text style={styles.recIcon}>{item.icon}</Text>
              </View>
              <View style={styles.recInfo}>
                <Text style={styles.recTitle}>{item.subject} - {item.title}</Text>
                <Text style={styles.recSub}>{item.level} • {item.duration}</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${item.progress}%`, backgroundColor: item.color }]} />
                </View>
              </View>
              <Text style={styles.recPercent}>{item.progress}%</Text>
            </Pressable>
          ))}
        </View>

        {/* Menu Cepat Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Menu Cepat</Text>
          <View style={styles.menuGrid}>
            {[
              { label: 'AI Tutor', icon: 'chatbubbles-outline', color: PURPLE, screen: 'AITutor' },
              { label: 'Quiz', icon: 'help-circle-outline', color: '#10B981', screen: 'Quiz' },
              { label: 'Materi', icon: 'book-outline', color: '#F59E0B', screen: 'Kelas' },
              { label: 'Tugas', icon: 'document-text-outline', color: '#3B82F6', screen: 'Kelas' },
            ].map((menu, idx) => (
              <Pressable
                key={idx}
                style={styles.menuItem}
                onPress={() => navigation.navigate(menu.screen)}
              >
                <View style={[styles.menuIconBox, { backgroundColor: menu.color + '10' }]}>
                  <Ionicons name={menu.icon as any} size={26} color={menu.color} />
                </View>
                <Text style={styles.menuLabel}>{menu.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  profileInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 24 },
  greeting: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  subGreeting: { fontSize: 13, color: '#64748B', marginTop: 2 },
  notifBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  notifDot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#FFFFFF' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  summaryCard: {
    backgroundColor: PURPLE,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  summaryLeft: { marginRight: 24 },
  circularProgress: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 6,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercent: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  summaryRight: { flex: 1 },
  summaryTitle: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 12, fontWeight: '500' },
  summaryStatItem: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 4 },
  summaryStatVal: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  summaryStatLabel: { fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#1E293B' },
  seeAllText: { fontSize: 13, fontWeight: '600', color: PURPLE },
  recCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  recIcon: { fontSize: 22 },
  recInfo: { flex: 1 },
  recTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  recSub: { fontSize: 11, color: '#94A3B8', marginBottom: 10 },
  progressBarBg: { height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 2 },
  recPercent: { fontSize: 14, fontWeight: 'bold', color: '#64748B', marginLeft: 12 },
  menuGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  menuItem: { alignItems: 'center', flex: 1 },
  menuIconBox: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  menuLabel: { fontSize: 12, fontWeight: '600', color: '#475569' },
});

export default DashboardScreen;