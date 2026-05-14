import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { authAPI } from '../../services/api';
import { authStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';

const PURPLE = '#7C3AED';


const ProgressScreen = () => {
  const { colors } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  const hasClass = !!(user?.className || user?.class);

  // Always show empty state until real progress data is available from the API
  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Progress Belajar</Text>
      </View>
      <View style={styles.emptyState}>
        <Ionicons name="bar-chart-outline" size={60} color={PURPLE + '40'} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Belum Ada Progress</Text>
        <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
          {hasClass
            ? 'Data progressmu akan muncul setelah kamu mulai mengerjakan materi dan kuis.'
            : 'Bergabung ke kelas terlebih dahulu untuk melihat progress belajarmu.'}
        </Text>
      </View>
    </SafeAreaView>
  );

};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 90 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  emptyDesc:  { fontSize: 14, textAlign: 'center', lineHeight: 21 },
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