import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  Pressable, StatusBar, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { authStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { useNavigation } from '@react-navigation/native';

const GREEN  = '#16A34A';
const PURPLE = '#A78BFA'; // softer purple for chart bars

// ─── Mock data ────────────────────────────────────────────────────────────────

const CHART_BARS = [
  { label: 'Sen', value: 78 },
  { label: 'Sel', value: 85 },
  { label: 'Rab', value: 90 },
  { label: 'Kam', value: 70 },
  { label: 'Jum', value: 83 },
  { label: 'Sab', value: 55 },
  { label: 'Min', value: 72 },
];
const MAX_BAR = Math.max(...CHART_BARS.map(b => b.value));

const AT_RISK = [
  { id: '1', name: 'Dika Pratama',   kelas: 'Matematika 10A', avg: 60, color: '#6366F1' },
  { id: '2', name: 'Siti Nurhaliza', kelas: 'Fisika 10A',      avg: 65, color: '#EC4899' },
  { id: '3', name: 'Budi Santoso',   kelas: 'Biologi 10A',     avg: 55, color: '#F59E0B' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const TeacherDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight }       = useHapticFeedback();
  const user      = authStore.getUserSync();
  const firstName = user?.name?.split(' ')[0] || 'Budi';

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 800));
    setRefreshing(false);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background },
      ]}
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GREEN]} />}
      >

        {/* ── Greeting ─────────────────────────────────────── */}
        <View style={styles.greeting}>
          <Text style={[styles.greetTitle, { color: colors.text }]}>
            Halo, {firstName}! 👋
          </Text>
          <Text style={[styles.greetSub, { color: colors.textSecondary }]}>
            Semangat mengajar hari ini!
          </Text>
        </View>

        {/* ── Ringkasan Kelas ──────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ringkasan Kelas</Text>

        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Row 1: 3 stats */}
          <View style={styles.statsRow3}>
            {/* Kelas Aktif */}
            <View style={[styles.statBox, { borderColor: colors.border }]}>
              <Text style={[styles.statNum, { color: '#EF4444' }]}>5</Text>
              <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Kelas Aktif</Text>
            </View>

            {/* Siswa */}
            <View style={[styles.statBox, styles.statBoxMid, { borderColor: colors.border }]}>
              <Text style={[styles.statNum, { color: colors.text }]}>120</Text>
              <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Siswa</Text>
            </View>

            {/* Rata-rata Nilai */}
            <View style={[styles.statBox, { borderColor: colors.border }]}>
              <Text style={[styles.statNum, { color: colors.text }]}>82%</Text>
              <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Rata-rata Nilai</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

          {/* Row 2: badge + siswa aktif */}
          <View style={styles.statsRow2}>
            {/* Tugas Dinilai badge */}
            <View style={[styles.statBox2, { borderColor: colors.border }]}>
              <View style={styles.badgeRow}>
                <View style={styles.greenBadge}>
                  <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                </View>
                <View>
                  <Text style={[styles.statNumSm, { color: colors.text }]}>1 Tugas</Text>
                  <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Ter-selesai</Text>
                </View>
              </View>
            </View>

            {/* Siswa Aktif */}
            <View style={[styles.statBox2, { borderColor: colors.border }]}>
              <Text style={[styles.statNum, { color: colors.text }]}>95%</Text>
              <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Siswa Aktif</Text>
            </View>
          </View>
        </View>

        {/* ── Performa Kelas ───────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
            Performa Kelas
          </Text>
          <Pressable onPress={() => triggerLight()}>
            <Text style={[styles.seeAll, { color: GREEN }]}>Lihat Semua</Text>
          </Pressable>
        </View>

        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Y-axis labels + bars */}
          <View style={styles.chartBody}>
            {/* Y labels */}
            <View style={styles.yLabels}>
              {[90, 70, 50, 30, 0].map(v => (
                <Text key={v} style={[styles.yLabel, { color: colors.textSecondary }]}>{v}</Text>
              ))}
            </View>

            {/* Bars */}
            <View style={styles.barsArea}>
              {CHART_BARS.map((bar, i) => {
                const pct = (bar.value / MAX_BAR) * 100;
                return (
                  <View key={i} style={styles.barCol}>
                    <View style={[styles.barTrack, { backgroundColor: colors.surface }]}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${pct}%`,
                            backgroundColor: PURPLE,
                            opacity: i === 2 ? 1 : 0.65,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.xLabel, { color: colors.textSecondary }]}>{bar.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Perlu Perhatian ──────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Perlu Perhatian</Text>

        <View style={[styles.atRiskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {AT_RISK.map((s, idx) => (
            <React.Fragment key={s.id}>
              <Pressable
                style={({ pressed }) => [
                  styles.atRow,
                  pressed && { backgroundColor: colors.surface },
                ]}
                onPress={() => triggerLight()}
              >
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: s.color + '25', borderColor: s.color + '50' }]}>
                  <Text style={[styles.avatarText, { color: s.color }]}>
                    {s.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                  </Text>
                </View>

                {/* Info */}
                <View style={styles.atInfo}>
                  <Text style={[styles.atName, { color: colors.text }]}>{s.name}</Text>
                  <Text style={[styles.atClass, { color: colors.textSecondary }]}>{s.kelas}</Text>
                </View>

                {/* Score + chevron */}
                <View style={styles.atRight}>
                  <Text style={[styles.atScore, { color: colors.textSecondary }]}>
                    Rata-rata <Text style={{ fontWeight: 'bold', color: '#EF4444' }}>{s.avg}</Text>
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                </View>
              </Pressable>

              {idx < AT_RISK.length - 1 && (
                <View style={[styles.rowSep, { backgroundColor: colors.border }]} />
              )}
            </React.Fragment>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll:    { paddingHorizontal: 20, paddingBottom: 100 },

  // Greeting
  greeting:   { marginTop: 14, marginBottom: 22 },
  greetTitle: { fontSize: 22, fontWeight: 'bold' },
  greetSub:   { fontSize: 13, marginTop: 4 },

  // Sections
  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 12 },
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seeAll:       { fontSize: 13, fontWeight: '700' },

  // ── Summary card ──
  summaryCard: {
    borderRadius: 20, borderWidth: 1, marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  statsRow3: { flexDirection: 'row' },
  statBox: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 20, paddingHorizontal: 8,
  },
  statBoxMid: {
    borderLeftWidth: 1, borderRightWidth: 1,
  },
  statNum:    { fontSize: 26, fontWeight: 'bold' },
  statNumSm:  { fontSize: 16, fontWeight: 'bold' },
  statLbl:    { fontSize: 11, fontWeight: '500', marginTop: 4, textAlign: 'center' },
  rowDivider: { height: 1 },
  statsRow2:  { flexDirection: 'row' },
  statBox2: {
    flex: 1, paddingVertical: 16, paddingHorizontal: 16,
    justifyContent: 'center',
  },
  badgeRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  greenBadge:{
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center',
  },

  // ── Chart ──
  chartCard: {
    borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  chartBody: { flexDirection: 'row', height: 160 },
  yLabels:   { justifyContent: 'space-between', paddingVertical: 0, marginRight: 8, paddingBottom: 20 },
  yLabel:    { fontSize: 10, fontWeight: '500', textAlign: 'right', width: 24 },
  barsArea:  { flex: 1, flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 0 },
  barCol:    { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barTrack:  {
    width: 20, height: 130,
    justifyContent: 'flex-end', overflow: 'hidden',
    borderRadius: 6,
  },
  barFill:  { width: '100%', borderRadius: 6 },
  xLabel:   { fontSize: 9, fontWeight: '600', marginTop: 6 },

  // ── At-risk ──
  atRiskCard: {
    borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginBottom: 30,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  atRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  avatar:   {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, marginRight: 12,
  },
  avatarText: { fontSize: 15, fontWeight: 'bold' },
  atInfo:   { flex: 1 },
  atName:   { fontSize: 15, fontWeight: '600' },
  atClass:  { fontSize: 12, marginTop: 2 },
  atRight:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  atScore:  { fontSize: 13 },
  rowSep:   { height: 1, marginHorizontal: 16 },
});

export default TeacherDashboardScreen;