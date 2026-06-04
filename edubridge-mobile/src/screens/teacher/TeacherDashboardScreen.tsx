import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  Pressable, StatusBar, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import { authStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { teacherAPI, aiAPI } from '../../services/api';
import PremiumModal from '../../components/PremiumModal';
import { ActivityIndicator, Alert } from 'react-native';
import { USE_MOCK_DATA } from '../../constants';

const GREEN      = '#16A34A';
const PURPLE     = '#A78BFA';

const CHART_BARS: any[] = [];
const AT_RISK: any[] = [];
const MAX_BAR = 100;

const TeacherDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight }       = useHapticFeedback();
  const user      = authStore.getUserSync();
  const firstName = user?.name?.split(' ')[0] || 'Guru';

  const [stats, setStats] = useState({
    activeClasses: 0,
    totalStudents: 0,
    avgScore: 0,
    completedTasks: 0,
    activeRate: 0
  });
  const [chartData, setChartData] = useState(CHART_BARS);
  const [atRiskData, setAtRiskData] = useState(AT_RISK);
  const [refreshing, setRefreshing] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [aiModal, setAiModal] = useState({ visible: false, title: '', message: '' });

  const loadDashboardData = async () => {
    if (USE_MOCK_DATA) {
      setStats({
        activeClasses: 3,
        totalStudents: 78,
        avgScore: 82,
        completedTasks: 12,
        activeRate: 94
      });
      setChartData([
        { label: 'Tugas 1', value: 85 },
        { label: 'Kuis 1', value: 78 },
        { label: 'Tugas 2', value: 92 },
        { label: 'Kuis 2', value: 68 },
        { label: 'UTS', value: 88 }
      ]);
      setAtRiskData([
        {
          id: 'mock_risk_1',
          name: 'Budi Santoso',
          kelas: 'Kelas 10-A',
          avg: '62.4%',
          color: '#EF4444',
          issue: 'Nilai kuis matematika menurun dalam 3 kuis terakhir'
        },
        {
          id: 'mock_risk_2',
          name: 'Siti Aminah',
          kelas: 'Kelas 10-B',
          avg: '64.8%',
          color: '#EF4444',
          issue: 'Keaktifan membaca materi kurang dari 20% minggu ini'
        },
        {
          id: 'mock_risk_3',
          name: 'Aditya Pratama',
          kelas: 'Kelas 10-A',
          avg: '58.0%',
          color: '#EF4444',
          issue: 'Belum mengumpulkan 2 tugas terakhir'
        }
      ]);
      return;
    }
    try {
      const data = await teacherAPI.getDashboardStats();
      if (data) {
        setStats(data.summary || stats);
        if (data.chart) setChartData(data.chart);
        if (data.atRisk) setAtRiskData(data.atRisk);
      }
    } catch (error) {
      console.log('Error loading dashboard stats:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleAIInsight = async (student: any) => {
    setAnalyzingId(student.id);
    triggerLight();
    try {
      const res = await aiAPI.analyzeRisk(student.id, student.name, student.avg);
      if (res.success) {
        setAiModal({
          visible: true,
          title: `AI Insight: ${student.name}`,
          message: res.data.analysis
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal mendapatkan analisis AI.');
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GREEN]} />}>
        <View style={styles.greeting}>
          <Text style={[styles.greetTitle, { color: colors.text }]}>Halo, {user?.role === 'TEACHER' ? 'Pak/Bu' : ''} {firstName}! 👋</Text>
          <Text style={[styles.greetSub, { color: colors.textSecondary }]}>Semangat mengajar hari ini!</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ringkasan Kelas</Text>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.statsRow3}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: GREEN }]}>{stats.activeClasses}</Text>
              <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Kelas Aktif</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxMid, { borderColor: colors.border }]}>
              <Text style={[styles.statNum, { color: colors.text }]}>{stats.totalStudents}</Text>
              <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Siswa</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.text }]}>{stats.avgScore}%</Text>
              <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Rata-rata Nilai</Text>
            </View>
          </View>
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statsRow2}>
            <View style={styles.statBox2}>
              <View style={styles.badgeRow}>
                <View style={styles.greenBadge}><Ionicons name="checkmark-circle" size={18} color="#FFF" /></View>
                <View>
                  <Text style={[styles.statNumSm, { color: colors.text }]}>{stats.completedTasks} Kuis</Text>
                  <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Ter-selesai</Text>
                </View>
              </View>
            </View>
            <View style={styles.statBox2}>
              <Text style={[styles.statNum, { color: colors.text }]}>{stats.activeRate}%</Text>
              <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Siswa Aktif</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Performa Kelas</Text>
          <Pressable onPress={() => { triggerLight(); navigation.navigate('TeacherKelas'); }}>
            <Text style={[styles.seeAll, { color: GREEN }]}>Lihat Semua</Text>
          </Pressable>
        </View>
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {chartData.length === 0 ? (
            <View style={{ height: 160, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Belum ada data performa.</Text>
            </View>
          ) : (
            <View style={styles.chartBody}>
              <View style={styles.yLabels}>{[90, 70, 50, 30, 0].map(v => <Text key={v} style={[styles.yLabel, { color: colors.textSecondary }]}>{v}</Text>)}</View>
              <View style={styles.barsArea}>
                {chartData.map((bar, i) => (
                  <View key={i} style={styles.barCol}>
                    <View style={[styles.barTrack, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
                      <View style={[styles.barFill, { height: `${(bar.value / 100) * 100}%`, backgroundColor: GREEN, opacity: i === 2 ? 1 : 0.65 }]} />
                    </View>
                    <Text style={[styles.xLabel, { color: colors.textSecondary }]}>{bar.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Perlu Perhatian</Text>
        <View style={[styles.atRiskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {atRiskData.length === 0 ? (
            <View style={{ padding: 30, alignItems: 'center' }}>
              <Ionicons name="checkmark-done-circle-outline" size={48} color={GREEN} />
              <Text style={{ color: colors.textSecondary, marginTop: 10, fontSize: 13 }}>Semua siswa aman.</Text>
            </View>
          ) : atRiskData.map((s, idx) => (
            <React.Fragment key={`${s.id}_${s.kelas}`}>
              <View style={styles.atRow}>
                <Pressable 
                  style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }} 
                  onPress={() => { triggerLight(); navigation.navigate('TeacherStudentDetail', { student: s }); }}
                >
                  <View style={[styles.avatar, { backgroundColor: s.color + '25', borderColor: s.color + '50' }]}><Text style={[styles.avatarText, { color: s.color }]}>{s.name.charAt(0)}</Text></View>
                  <View style={styles.atInfo}>
                    <Text style={[styles.atName, { color: colors.text }]}>{s.name}</Text>
                    <Text style={[styles.atClass, { color: colors.textSecondary }]}>{s.kelas}</Text>
                  </View>
                </Pressable>
                
                <View style={styles.atRight}>
                  <Pressable 
                    style={[styles.aiBadge, { backgroundColor: GREEN + '10' }]}
                    onPress={() => handleAIInsight(s)}
                    disabled={analyzingId !== null}
                  >
                    {analyzingId === s.id ? (
                      <ActivityIndicator size="small" color={GREEN} />
                    ) : (
                      <>
                        <Ionicons name="sparkles" size={14} color={GREEN} />
                        <Text style={[styles.aiBadgeText, { color: GREEN }]}>Tanya AI</Text>
                      </>
                    )}
                  </Pressable>
                  <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
                    <Text style={{ fontWeight: 'bold', color: '#EF4444', fontSize: 14 }}>{s.avg}</Text>
                    <Text style={{ fontSize: 9, color: colors.textSecondary }}>Rata-rata</Text>
                  </View>
                </View>
              </View>
              {idx < atRiskData.length - 1 && <View style={[styles.rowSep, { backgroundColor: colors.border }]} />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>

      <PremiumModal
        visible={aiModal.visible}
        type="info"
        icon="sparkles"
        title={aiModal.title}
        message={aiModal.message}
        confirmText="Mengerti"
        onConfirm={() => setAiModal({ ...aiModal, visible: false })}
        minimal
        scrollable
      />
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
  atRight: { flexDirection: 'row', alignItems: 'center' },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  aiBadgeText: { fontSize: 11, fontWeight: 'bold' },
  rowSep: { height: 1, marginHorizontal: 16 },
});

export default TeacherDashboardScreen;