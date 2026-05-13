import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { authAPI } from '../../services/api';
import { authStore } from '../../store/authStore';

const PURPLE = '#7C3AED';

const subjects = [
  { name: 'Matematika', icon: '📐', color: '#6366F1', percentage: 75 },
  { name: 'Fisika', icon: '⚡', color: '#F59E0B', percentage: 60 },
  { name: 'Biologi', icon: '🧬', color: '#10B981', percentage: 40 },
  { name: 'Bahasa Inggris', icon: '📚', color: '#3B82F6', percentage: 80 },
];

const weeklyStats = [
  { day: 'Sen', score: 85 }, { day: 'Sel', score: 90 },
  { day: 'Rab', score: 78 }, { day: 'Kam', score: 92 },
  { day: 'Jum', score: 88 }, { day: 'Sab', score: 95 }, { day: 'Min', score: 80 },
];

const dailyStats = [
  { time: '08:00', score: 80 }, { time: '10:30', score: 85 },
  { time: '13:00', score: 75 }, { time: '15:45', score: 88 },
  { time: '18:00', score: 92 }, { time: '20:15', score: 78 },
];

const ProgressScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('Minggu Ini');
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);

  const loadData = async () => {
    try {
      const cached = authStore.getUserSync();
      if (cached) setUser(cached);
      const res = await authAPI.getProfile();
      setUser(res.data || res);
    } catch {
      const cached = authStore.getUserSync();
      if (cached) setUser(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const maxScore = Math.max(...weeklyStats.map(s => s.score));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PURPLE} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Progress Belajar</Text>
          <Pressable
            style={styles.periodBtn}
            onPress={() => setShowPeriodMenu(!showPeriodMenu)}
          >
            <Text style={styles.periodBtnText}>{selectedPeriod}</Text>
            <Ionicons
              name={showPeriodMenu ? "chevron-up" : "chevron-down"}
              size={14}
              color={PURPLE}
            />
          </Pressable>
        </View>

        {/* Period Menu */}
        {showPeriodMenu && (
          <View style={styles.periodMenu}>
            {['Hari Ini', 'Minggu Ini', 'Bulan Ini'].map((period) => (
              <Pressable
                key={period}
                style={[styles.periodMenuItem, selectedPeriod === period && styles.periodMenuItemActive]}
                onPress={() => {
                  setSelectedPeriod(period);
                  setShowPeriodMenu(false);
                }}
              >
                <Text style={[styles.periodMenuText, selectedPeriod === period && styles.periodMenuTextActive]}>
                  {period}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          {[
            { icon: 'ribbon-outline', val: '75%', label: 'Rata-rata Nilai', color: PURPLE },
            { icon: 'time-outline', val: '12 Jam', label: 'Waktu Belajar', color: '#F59E0B' },
            { icon: 'checkmark-circle-outline', val: '8', label: 'Quiz Dikerjakan', color: '#10B981' },
          ].map((item, i) => (
            <View key={i} style={styles.summaryCard}>
              <View style={[styles.summaryIconBox, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={[styles.summaryVal, { color: item.color }]}>{item.val}</Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Activity Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedPeriod === 'Hari Ini' ? 'Aktivitas Hari Ini' : 'Aktivitas Mingguan'}
          </Text>
          <View style={styles.barChart}>
            {(selectedPeriod === 'Hari Ini' ? dailyStats : weeklyStats).map((stat, idx) => {
              const data = selectedPeriod === 'Hari Ini' ? stat as typeof dailyStats[0] : stat as typeof weeklyStats[0];
              const maxVal = selectedPeriod === 'Hari Ini' ? Math.max(...dailyStats.map(s => s.score)) : maxScore;
              const label = selectedPeriod === 'Hari Ini' ? (data as any).time : (data as any).day;

              return (
                <View key={idx} style={styles.barColumn}>
                  <Text style={styles.barValue}>{data.score}%</Text>
                  <LinearGradient
                    colors={[PURPLE, '#5B21B6']}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    style={[styles.bar, { height: (data.score / maxVal) * 120 }]}
                  />
                  <Text style={styles.barDay}>{label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Subject Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performa per Mata Pelajaran</Text>
          {subjects.map((subj, idx) => (
            <View key={idx} style={styles.subjectCard}>
              <View style={[styles.subjectIconBox, { backgroundColor: subj.color + '15' }]}>
                <Text style={styles.subjectIcon}>{subj.icon}</Text>
              </View>
              <View style={styles.subjectInfo}>
                <View style={styles.subjectHeader}>
                  <Text style={styles.subjectName}>{subj.name}</Text>
                  <Text style={[styles.subjectPct, { color: subj.color }]}>{subj.percentage}%</Text>
                </View>
                <View style={styles.subjBarBg}>
                  <View style={[styles.subjBarFill, { width: `${subj.percentage}%`, backgroundColor: subj.color }]} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 90 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  periodBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EDE9FE', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  periodBtnText: { fontSize: 13, fontWeight: '600', color: PURPLE },
  periodMenu: { backgroundColor: '#FFFFFF', borderRadius: 12, marginHorizontal: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  periodMenuItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  periodMenuItemActive: { backgroundColor: '#EDE9FE' },
  periodMenuText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  periodMenuTextActive: { color: PURPLE, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  summaryCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  summaryIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  summaryVal: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  summaryLabel: { fontSize: 10, color: '#64748B', textAlign: 'center' },
  section: { paddingHorizontal: 20, marginBottom: 28 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 16, padding: 16, height: 180, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  barColumn: { alignItems: 'center', flex: 1 },
  barValue: { fontSize: 9, color: '#64748B', marginBottom: 4 },
  bar: { width: 24, borderRadius: 6, marginBottom: 6 },
  barDay: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  subjectCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  subjectIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  subjectIcon: { fontSize: 20 },
  subjectInfo: { flex: 1 },
  subjectHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  subjectName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  subjectPct: { fontSize: 14, fontWeight: 'bold' },
  subjBarBg: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  subjBarFill: { height: '100%', borderRadius: 3 },
});

export default ProgressScreen;