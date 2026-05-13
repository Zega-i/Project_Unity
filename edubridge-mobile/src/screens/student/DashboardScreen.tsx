import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { authStore } from '../../store/authStore';
import { authAPI } from '../../services/api';

const PURPLE = '#7C3AED';
const PURPLE_DARK = '#5B21B6';

const DashboardScreen = () => {
  const navigation = useNavigation<any>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async () => {
    try {
      const cached = authStore.getUserSync();
      if (cached) setUser(cached);
      const res = await authAPI.getProfile();
      const profile = res.data || res;
      setUser(profile);
    } catch {
      const cached = authStore.getUserSync();
      if (cached) setUser(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const recommendations = [
    { subject: 'Matematika - Persamaan Linear', progress: 65, icon: '📐', color: '#6366F1' },
    { subject: 'Fisika - Hukum Newton', progress: 45, icon: '⚡', color: '#F59E0B' },
  ];

  const quickMenus = [
    { label: 'AI Tutor', icon: 'chatbubbles', color: PURPLE, screen: 'AITutor' },
    { label: 'Quiz', icon: 'help-circle', color: '#10B981', screen: 'Quiz' },
    { label: 'Kelas', icon: 'library', color: '#F59E0B', screen: 'Kelas' },
    { label: 'Progres', icon: 'bar-chart', color: '#3B82F6', screen: 'Progress' },
  ];

  const firstName = user?.name?.split(' ')[0] || 'Siswa';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PURPLE} />}
      >
        {/* Header */}
        <LinearGradient colors={[PURPLE, PURPLE_DARK]} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Halo, {firstName}! 👋</Text>
              <Text style={styles.subGreeting}>Semangat belajar hari ini</Text>
            </View>
            <Pressable style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </Pressable>
          </View>

          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.circleProgress}>
              <Text style={styles.circlePercent}>75%</Text>
              <Text style={styles.circleLabel}>Progress</Text>
            </View>
            <View style={styles.summaryStats}>
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatValue}>7</Text>
                <Text style={styles.summaryStatLabel}>Mata Pelajaran</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatValue}>12</Text>
                <Text style={styles.summaryStatLabel}>Streak Belajar</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Rekomendasi Belajar */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Rekomendasi Belajar</Text>
              <Pressable>
                <Text style={styles.seeAll}>Lihat Semua</Text>
              </Pressable>
            </View>
            {recommendations.map((rec, idx) => (
              <View key={idx} style={styles.recCard}>
                <View style={[styles.recIconBox, { backgroundColor: rec.color + '20' }]}>
                  <Text style={styles.recIcon}>{rec.icon}</Text>
                </View>
                <View style={styles.recInfo}>
                  <Text style={styles.recTitle}>{rec.subject}</Text>
                  <Text style={styles.recSub}>Menunggu • {rec.progress} Menit</Text>
                  <View style={styles.recBarBg}>
                    <View style={[styles.recBarFill, { width: `${rec.progress}%`, backgroundColor: rec.color }]} />
                  </View>
                </View>
                <Text style={styles.recPercent}>{rec.progress}%</Text>
              </View>
            ))}
          </View>

          {/* Menu Cepat */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Menu Cepat</Text>
            <View style={styles.quickGrid}>
              {quickMenus.map((menu, idx) => (
                <Pressable
                  key={idx}
                  style={styles.quickItem}
                  onPress={() => navigation.navigate(menu.screen)}
                >
                  <View style={[styles.quickIconBox, { backgroundColor: menu.color + '15' }]}>
                    <Ionicons name={menu.icon as any} size={28} color={menu.color} />
                  </View>
                  <Text style={styles.quickLabel}>{menu.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 20, paddingBottom: 30, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  subGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  summaryCard: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center' },
  circleProgress: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center', marginRight: 20 },
  circlePercent: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  circleLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)' },
  summaryStats: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  summaryStatItem: { alignItems: 'center' },
  summaryStatValue: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  summaryStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  summaryDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.3)' },
  body: { paddingHorizontal: 20, paddingTop: 24 },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  seeAll: { fontSize: 13, color: PURPLE, fontWeight: '600' },
  recCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  recIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  recIcon: { fontSize: 22 },
  recInfo: { flex: 1 },
  recTitle: { fontSize: 13, fontWeight: '600', color: '#1E293B', marginBottom: 2 },
  recSub: { fontSize: 11, color: '#94A3B8', marginBottom: 6 },
  recBarBg: { height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, overflow: 'hidden' },
  recBarFill: { height: '100%', borderRadius: 2 },
  recPercent: { fontSize: 13, fontWeight: 'bold', color: '#64748B', marginLeft: 10 },
  quickGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  quickItem: { alignItems: 'center', flex: 1 },
  quickIconBox: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickLabel: { fontSize: 12, fontWeight: '600', color: '#334155' },
});

export default DashboardScreen;