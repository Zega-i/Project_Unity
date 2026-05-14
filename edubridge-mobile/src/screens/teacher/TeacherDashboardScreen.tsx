import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  Pressable, StatusBar, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { authStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const GREEN      = '#16A34A';
const PURPLE     = '#A78BFA';

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
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GREEN]} />}>
        <View style={styles.greeting}>
          <Text style={[styles.greetTitle, { color: colors.text }]}>Halo, Pak {firstName}! 👋</Text>
          <Text style={[styles.greetSub, { color: colors.textSecondary }]}>Semangat mengajar hari ini!</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ringkasan Kelas</Text>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.statsRow3}>
            <View style={styles.statBox}><Text style={[styles.statNum, { color: '#EF4444' }]}>5</Text><Text style={styles.statLbl}>Kelas Aktif</Text></View>
            <View style={[styles.statBox, styles.statBoxMid, { borderColor: colors.border }]}><Text style={styles.statNum}>120</Text><Text style={styles.statLbl}>Siswa</Text></View>
            <View style={styles.statBox}><Text style={styles.statNum}>82%</Text><Text style={styles.statLbl}>Rata-rata Nilai</Text></View>
          </View>
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statsRow2}>
            <View style={styles.statBox2}><View style={styles.badgeRow}><View style={styles.greenBadge}><Ionicons name="checkmark-circle" size={18} color="#FFF" /></View><View><Text style={styles.statNumSm}>1 Tugas</Text><Text style={styles.statLbl}>Ter-selesai</Text></View></View></View>
            <View style={styles.statBox2}><Text style={styles.statNum}>95%</Text><Text style={styles.statLbl}>Siswa Aktif</Text></View>
          </View>
        </View>

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Performa Kelas</Text><Pressable onPress={() => triggerLight()}><Text style={[styles.seeAll, { color: GREEN }]}>Lihat Semua</Text></Pressable></View>
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.chartBody}>
            <View style={styles.yLabels}>{[90, 70, 50, 30, 0].map(v => <Text key={v} style={styles.yLabel}>{v}</Text>)}</View>
            <View style={styles.barsArea}>
              {CHART_BARS.map((bar, i) => (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barTrack}><View style={[styles.barFill, { height: `${(bar.value / MAX_BAR) * 100}%`, backgroundColor: PURPLE, opacity: i === 2 ? 1 : 0.65 }]} /></View>
                  <Text style={styles.xLabel}>{bar.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Perlu Perhatian</Text>
        <View style={[styles.atRiskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {AT_RISK.map((s, idx) => (
            <React.Fragment key={s.id}>
              <Pressable style={styles.atRow} onPress={() => { triggerLight(); navigation.navigate('TeacherStudentDetail', { name: s.name, className: s.kelas, avgScore: s.avg, avatarColor: s.color }); }}>
                <View style={[styles.avatar, { backgroundColor: s.color + '25', borderColor: s.color + '50' }]}><Text style={[styles.avatarText, { color: s.color }]}>{s.name.charAt(0)}</Text></View>
                <View style={styles.atInfo}><Text style={styles.atName}>{s.name}</Text><Text style={styles.atClass}>{s.kelas}</Text></View>
                <View style={styles.atRight}><Text style={styles.atScore}>Rata-rata <Text style={{ fontWeight: 'bold', color: '#EF4444' }}>{s.avg}</Text></Text><Ionicons name="chevron-forward" size={16} color="#999" /></View>
              </Pressable>
              {idx < AT_RISK.length - 1 && <View style={[styles.rowSep, { backgroundColor: colors.border }]} />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  greeting: { marginTop: 14, marginBottom: 22 },
  greetTitle: { fontSize: 22, fontWeight: 'bold' },
  greetSub: { fontSize: 13, marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seeAll: { fontSize: 13, fontWeight: '700' },
  summaryCard: { borderRadius: 20, borderWidth: 1, marginBottom: 24, overflow: 'hidden' },
  statsRow3: { flexDirection: 'row' },
  statBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  statBoxMid: { borderLeftWidth: 1, borderRightWidth: 1 },
  statNum: { fontSize: 26, fontWeight: 'bold' },
  statNumSm: { fontSize: 16, fontWeight: 'bold' },
  statLbl: { fontSize: 11, fontWeight: '500', marginTop: 4, color: '#666' },
  rowDivider: { height: 1 },
  statsRow2: { flexDirection: 'row' },
  statBox2: { flex: 1, paddingVertical: 16, paddingHorizontal: 16 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  greenBadge: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center' },
  chartCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 24 },
  chartBody: { flexDirection: 'row', height: 160 },
  yLabels: { justifyContent: 'space-between', marginRight: 8, paddingBottom: 20 },
  yLabel: { fontSize: 10, color: '#666' },
  barsArea: { flex: 1, flexDirection: 'row', alignItems: 'flex-end' },
  barCol: { flex: 1, alignItems: 'center' },
  barTrack: { width: 20, height: 130, justifyContent: 'flex-end', borderRadius: 6, backgroundColor: '#F1F5F9' },
  barFill: { width: '100%', borderRadius: 6 },
  xLabel: { fontSize: 9, marginTop: 6, color: '#666' },
  atRiskCard: { borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginBottom: 30 },
  atRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, marginRight: 12 },
  avatarText: { fontSize: 15, fontWeight: 'bold' },
  atInfo: { flex: 1 },
  atName: { fontSize: 15, fontWeight: '600' },
  atClass: { fontSize: 12, color: '#666' },
  atRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  atScore: { fontSize: 13, color: '#666' },
  rowSep: { height: 1, marginHorizontal: 16 },
});

export default TeacherDashboardScreen;