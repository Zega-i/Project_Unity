import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useFocusEffect } from '@react-navigation/native';
import { authAPI } from '../../services/api';
import { authStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';

const PURPLE = '#7C3AED';
const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const WEEK_DATA = [0, 0, 0, 0, 0, 0, 0];
const BAR_MAX_H = 100;

const ProgressScreen = () => {
  const { colors } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  const hasClass = !!(user?.className || user?.['class']);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PURPLE]} />}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Progress Belajar</Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          {[
            { icon: 'book-outline',    color: '#6366F1', val: '0', label: 'Materi Dibaca' },
            { icon: 'trophy-outline',  color: '#F59E0B', val: '0', label: 'Kuis Selesai'  },
            { icon: 'stats-chart',     color: '#10B981', val: '0%', label: 'Skor Rata-rata' },
          ].map((item, idx) => (
            <View key={idx} style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.summaryIconBox, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
              </View>
              <Text style={[styles.summaryVal, { color: colors.text }]}>{item.val}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Weekly Bar Chart */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Aktivitas 7 Hari</Text>
          <View style={[styles.barChart, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {WEEK_DATA.map((val, idx) => {
              const barH = val === 0 ? 4 : Math.max(4, (val / 10) * BAR_MAX_H);
              const barColor = val === 0 ? colors.border : PURPLE;
              return (
                <View key={idx} style={styles.barColumn}>
                  <Text style={[styles.barValue, { color: colors.textSecondary }]}>{val > 0 ? val : ''}</Text>
                  <View style={[styles.bar, { height: barH, backgroundColor: barColor }]} />
                  <Text style={[styles.barDay, { color: colors.textSecondary }]}>{DAYS[idx]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Subject Progress */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Progress per Mata Pelajaran</Text>
          <View style={[styles.emptySubject, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="bar-chart-outline" size={40} color={PURPLE + '40'} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Belum Ada Data</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              {hasClass
                ? 'Data progressmu akan muncul setelah kamu mulai mengerjakan materi dan kuis.'
                : 'Bergabung ke kelas terlebih dahulu untuk melihat progress belajarmu.'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 90 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },

  summaryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  summaryCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1 },
  summaryIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  summaryVal: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  summaryLabel: { fontSize: 10, textAlign: 'center' },

  section: { paddingHorizontal: 20, marginBottom: 28 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },

  barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', borderRadius: 16, padding: 16, height: 160, borderWidth: 1 },
  barColumn: { alignItems: 'center', flex: 1 },
  barValue: { fontSize: 9, marginBottom: 4 },
  bar: { width: 22, borderRadius: 6, marginBottom: 6 },
  barDay: { fontSize: 11, fontWeight: '600' },

  emptySubject: { borderRadius: 16, borderWidth: 1, padding: 28, alignItems: 'center', gap: 10 },
  emptyTitle: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
});

export default ProgressScreen;
