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
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

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

const monthlyStats = [
  { week: 'Ming 1', score: 72 },
  { week: 'Ming 2', score: 78 },
  { week: 'Ming 3', score: 85 },
  { week: 'Ming 4', score: 81 },
];

const ProgressScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const { triggerLight } = useHapticFeedback();
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
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PURPLE} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Progress Belajar</Text>
          <Pressable
            style={[styles.periodBtn, { backgroundColor: colors.primaryLight }]}
            onPress={() => { triggerLight(); setShowPeriodMenu(!showPeriodMenu); }}
          >
            <Text style={[styles.periodBtnText, { color: colors.primary }]}>{selectedPeriod}</Text>
            <Ionicons
              name={showPeriodMenu ? "chevron-up" : "chevron-down"}
              size={14}
              color={colors.primary}
            />
          </Pressable>
        </View>

        {/* Period Menu */}
        {showPeriodMenu && (
          <View style={[styles.periodMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {['Hari Ini', 'Minggu Ini', 'Bulan Ini'].map((period) => (
              <Pressable
                key={period}
                style={[styles.periodMenuItem, { borderBottomColor: colors.border }, selectedPeriod === period && [styles.periodMenuItemActive, { backgroundColor: colors.primaryLight }]]}
                onPress={() => { triggerLight(); setSelectedPeriod(period); setShowPeriodMenu(false); }}
              >
                <Text style={[styles.periodMenuText, { color: colors.textSecondary }, selectedPeriod === period && [styles.periodMenuTextActive, { color: colors.primary }]]}>
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
            <View key={i} style={[styles.summaryCard, { backgroundColor: colors.card }]}>
              <View style={[styles.summaryIconBox, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={[styles.summaryVal, { color: item.color }]}>{item.val}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Activity Chart */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {selectedPeriod === 'Hari Ini' ? 'Aktivitas Hari Ini' : selectedPeriod === 'Minggu Ini' ? 'Aktivitas Mingguan' : 'Aktivitas Bulanan'}
          </Text>
          <View style={[styles.barChart, { backgroundColor: colors.card }]}>
            {(selectedPeriod === 'Hari Ini' ? dailyStats : selectedPeriod === 'Minggu Ini' ? weeklyStats : monthlyStats).map((stat, idx) => {
              let data: any;
              let maxVal: number;
              let label: string;

              if (selectedPeriod === 'Hari Ini') {
                data = stat;
                maxVal = Math.max(...dailyStats.map(s => s.score));
                label = (data as any).time;
              } else if (selectedPeriod === 'Minggu Ini') {
                data = stat;
                maxVal = maxScore;
                label = (data as any).day;
              } else {
                data = stat;
                maxVal = Math.max(...monthlyStats.map(s => s.score));
                label = (data as any).week;
              }

              return (
                <View key={idx} style={styles.barColumn}>
                  <Text style={[styles.barValue, { color: colors.textSecondary }]}>{data.score}%</Text>
                  <LinearGradient
                    colors={[PURPLE, '#5B21B6']}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    style={[styles.bar, { height: (data.score / maxVal) * 120 }]}
                  />
                  <Text style={[styles.barDay, { color: colors.textSecondary }]}>{label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Subject Performance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Performa per Mata Pelajaran</Text>
          {subjects.map((subj, idx) => (
            <View key={idx} style={[styles.subjectCard, { backgroundColor: colors.card }]}>
              <View style={[styles.subjectIconBox, { backgroundColor: subj.color + '15' }]}>
                <Text style={styles.subjectIcon}>{subj.icon}</Text>
              </View>
              <View style={styles.subjectInfo}>
                <View style={styles.subjectHeader}>
                  <Text style={[styles.subjectName, { color: colors.text }]}>{subj.name}</Text>
                  <Text style={[styles.subjectPct, { color: subj.color }]}>{subj.percentage}%</Text>
                </View>
                <View style={[styles.subjBarBg, { backgroundColor: colors.border }]}>
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
  container: { flex: 1 },
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