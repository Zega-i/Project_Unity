import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const GREEN = '#16A34A';

type Tab = 'overview' | 'progress' | 'aktivitas';

// ─── Mock student data ────────────────────────────────────────────────────────

interface TopicPerf  { topic: string; score: number; }
interface QuizResult { id: string; title: string; score: number; date: string; maxScore: number; }
interface Activity   { id: string; text: string; time: string; icon: string; color: string; }

const TOPIC_PERF: TopicPerf[] = [
  { topic: 'Persamaan Linear', score: 90 },
  { topic: 'Fungsi Linear',    score: 80 },
  { topic: 'SPLDV',            score: 70 },
  { topic: 'Grafik',           score: 85 },
];

const QUIZ_RESULTS: QuizResult[] = [
  { id: '1', title: 'Latihan Soal PLSV',  score: 90, maxScore: 100, date: '12 Mei 2026' },
  { id: '2', title: 'Kuis Fungsi Linear', score: 80, maxScore: 100, date: '10 Mei 2026' },
  { id: '3', title: 'Ujian SPLDV',        score: 70, maxScore: 100, date: '8 Mei 2026'  },
  { id: '4', title: 'Tugas Grafik',       score: 85, maxScore: 100, date: '5 Mei 2026'  },
];

const ACTIVITIES: Activity[] = [
  { id: '1', text: 'Mengumpulkan Tugas Analisis Fungsi',      time: '2 jam lalu',    icon: 'checkmark-circle-outline', color: GREEN      },
  { id: '2', text: 'Mengerjakan Kuis SPLDV (skor 70)',        time: 'Kemarin 14:30', icon: 'extension-puzzle-outline', color: '#6366F1'  },
  { id: '3', text: 'Membuka materi Bab 3: SPLDV',            time: 'Kemarin 11:00', icon: 'book-outline',             color: '#F59E0B'  },
  { id: '4', text: 'Bertanya di Diskusi: "cara mencari x?"', time: '2 hari lalu',   icon: 'chatbubble-outline',       color: '#EC4899'  },
  { id: '5', text: 'Login & belajar selama 45 menit',         time: '3 hari lalu',   icon: 'time-outline',             color: '#06B6D4'  },
];

// ─── Sub-tabs ─────────────────────────────────────────────────────────────────

const OverviewTab = ({ colors, student }: any) => (
  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
    {/* Stats */}
    <View style={styles.statsRow}>
      {[
        { label: 'Rata-rata Nilai', value: `${student.avgScore}` },
        { label: 'Posisi di Kelas', value: `${student.rank} / ${student.total}` },
        { label: 'Kehadiran',       value: `${student.attendance}%` },
      ].map((s, i) => (
        <View
          key={i}
          style={[
            styles.statBox,
            { backgroundColor: colors.card, borderColor: colors.border },
            i === 1 && styles.statBoxMid,
          ]}
        >
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{s.value}</Text>
        </View>
      ))}
    </View>

    {/* Performa per Topik */}
    <Text style={[styles.subTitle, { color: colors.text }]}>Performa per Topik</Text>
    <View style={[styles.topicCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {TOPIC_PERF.map((t, i) => (
        <View key={i} style={[styles.topicRow, i < TOPIC_PERF.length - 1 && { marginBottom: 16 }]}>
          <View style={styles.topicHeader}>
            <Text style={[styles.topicName, { color: colors.text }]}>{t.topic}</Text>
            <Text style={[styles.topicScore, { color: GREEN }]}>{t.score}%</Text>
          </View>
          <View style={[styles.topicBarBg, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.topicBarFill,
                {
                  width: `${t.score}%`,
                  backgroundColor: t.score >= 80 ? GREEN : t.score >= 70 ? '#F59E0B' : '#EF4444',
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>

    {/* AI Recommendation */}
    <View style={[styles.aiCard, { backgroundColor: GREEN + '12', borderColor: GREEN + '30' }]}>
      <View style={styles.aiHeader}>
        <Ionicons name="sparkles" size={16} color={GREEN} />
        <Text style={[styles.aiTitle, { color: GREEN }]}>Rekomendasi AI</Text>
      </View>
      <Text style={[styles.aiText, { color: colors.text }]}>
        {student.firstName} perlu latihan lebih pada topik{' '}
        <Text style={{ fontWeight: '700' }}>SPLDV</Text> dan{' '}
        <Text style={{ fontWeight: '700' }}>Penerapan Persamaan</Text>.
      </Text>
    </View>

    {/* CTA */}
    <Pressable
      style={({ pressed }) => [
        styles.ctaBtn,
        { backgroundColor: GREEN, opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={() => Alert.alert('Rencana Belajar', 'Fitur sedang dikembangkan')}
    >
      <Text style={styles.ctaText}>Buat Rencana Belajar</Text>
    </Pressable>
  </ScrollView>
);

const ProgressTab = ({ colors }: any) => (
  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
    <Text style={[styles.subTitle, { color: colors.text }]}>Riwayat Nilai</Text>
    {QUIZ_RESULTS.map((q, i) => {
      const color = q.score >= 80 ? GREEN : q.score >= 70 ? '#F59E0B' : '#EF4444';
      return (
        <View
          key={q.id}
          style={[styles.quizRow, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={[styles.quizScoreCircle, { backgroundColor: color + '15', borderColor: color + '40' }]}>
            <Text style={[styles.quizScoreText, { color }]}>{q.score}</Text>
          </View>
          <View style={styles.quizInfo}>
            <Text style={[styles.quizTitle, { color: colors.text }]}>{q.title}</Text>
            <Text style={[styles.quizDate, { color: colors.textSecondary }]}>{q.date}</Text>
          </View>
          <View style={[styles.quizBar, { backgroundColor: color + '15' }]}>
            <View style={[styles.quizBarFill, { width: `${q.score}%`, backgroundColor: color }]} />
          </View>
        </View>
      );
    })}
  </ScrollView>
);

const AktivitasTab = ({ colors }: any) => (
  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
    <Text style={[styles.subTitle, { color: colors.text }]}>Aktivitas Terbaru</Text>
    <View style={[styles.actCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {ACTIVITIES.map((act, i) => (
        <React.Fragment key={act.id}>
          <View style={styles.actRow}>
            <View style={[styles.actIcon, { backgroundColor: act.color + '15' }]}>
              <Ionicons name={act.icon as any} size={18} color={act.color} />
            </View>
            <View style={styles.actBody}>
              <Text style={[styles.actText, { color: colors.text }]}>{act.text}</Text>
              <Text style={[styles.actTime, { color: colors.textSecondary }]}>{act.time}</Text>
            </View>
          </View>
          {i < ACTIVITIES.length - 1 && (
            <View style={[styles.actSep, { backgroundColor: colors.border }]} />
          )}
        </React.Fragment>
      ))}
    </View>
  </ScrollView>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const TeacherStudentDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route      = useRoute<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight }       = useHapticFeedback();

  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Route params (passed from student list)
  const name         = route.params?.name         || 'Dika Pratama';
  const className    = route.params?.className    || 'Matematika 10A';
  const avgScore     = route.params?.avgScore     || 85;
  const avatarColor  = route.params?.avatarColor  || '#6366F1';

  const firstName = name.split(' ')[0];
  const initials  = name.split(' ').map((w: string) => w[0]).slice(0, 2).join('');

  const student = { name, firstName, className, avgScore, rank: 5, total: 120, attendance: 95, avatarColor };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview',  label: 'Overview'  },
    { key: 'progress',  label: 'Progress'  },
    { key: 'aktivitas', label: 'Aktivitas' },
  ];

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background },
      ]}
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* ── Header ── */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable style={styles.backBtn} onPress={() => { triggerLight(); navigation.goBack(); }}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Profile Card ── */}
      <View style={[styles.profileRow, { borderBottomColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: avatarColor + '20', borderColor: avatarColor + '50' }]}>
          <Text style={[styles.avatarText, { color: avatarColor }]}>{initials}</Text>
        </View>
        <View>
          <Text style={[styles.profileName, { color: colors.text }]}>{name}</Text>
          <Text style={[styles.profileClass, { color: colors.textSecondary }]}>{className}</Text>
        </View>
      </View>

      {/* ── Tab Switcher (pill style) ── */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        {TABS.map(tab => {
          const active = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              style={[
                styles.tabBtn,
                active && { borderColor: GREEN, borderWidth: 1.5, backgroundColor: GREEN + '08' },
                !active && { borderColor: 'transparent', borderWidth: 1.5 },
              ]}
              onPress={() => { triggerLight(); setActiveTab(tab.key); }}
            >
              <Text style={[styles.tabText, { color: active ? GREEN : colors.textSecondary }]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── Tab Content ── */}
      {activeTab === 'overview'  && <OverviewTab  colors={colors} student={student} />}
      {activeTab === 'progress'  && <ProgressTab  colors={colors} />}
      {activeTab === 'aktivitas' && <AktivitasTab colors={colors} />}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  // Profile
  profileRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingBottom: 18, borderBottomWidth: 1,
  },
  avatar:     { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  avatarText: { fontSize: 20, fontWeight: 'bold' },
  profileName:  { fontSize: 18, fontWeight: 'bold' },
  profileClass: { fontSize: 14, marginTop: 3 },

  // Tab bar (pill style)
  tabBar: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1,
  },
  tabBtn: {
    paddingHorizontal: 18, paddingVertical: 8,
    borderRadius: 20,
  },
  tabText: { fontSize: 14, fontWeight: '700' },

  tabScroll: { paddingHorizontal: 20, paddingBottom: 50 },

  // Stats
  statsRow: { flexDirection: 'row', marginTop: 20, marginBottom: 20 },
  statBox: {
    flex: 1, alignItems: 'center', paddingVertical: 16,
    borderWidth: 1, borderRadius: 14,
  },
  statBoxMid: { marginHorizontal: 10 },
  statLabel:  { fontSize: 11, fontWeight: '500', textAlign: 'center', marginBottom: 6 },
  statValue:  { fontSize: 22, fontWeight: 'bold' },

  subTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },

  // Topic performance
  topicCard: {
    borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  topicRow:    {},
  topicHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  topicName:   { fontSize: 14, fontWeight: '600' },
  topicScore:  { fontSize: 14, fontWeight: '700' },
  topicBarBg:  { height: 6, borderRadius: 3 },
  topicBarFill:{ height: '100%', borderRadius: 3 },

  // AI card
  aiCard: {
    borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 20, gap: 8,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiTitle:  { fontSize: 13, fontWeight: '700' },
  aiText:   { fontSize: 14, lineHeight: 21 },

  // CTA
  ctaBtn: {
    borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    shadowColor: GREEN, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 6,
  },
  ctaText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  // Progress tab
  quizRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10, gap: 12,
  },
  quizScoreCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  quizScoreText:   { fontSize: 16, fontWeight: 'bold' },
  quizInfo:  { flex: 1 },
  quizTitle: { fontSize: 13, fontWeight: '600' },
  quizDate:  { fontSize: 11, marginTop: 3 },
  quizBar:   { width: 60, height: 6, borderRadius: 3, overflow: 'hidden' },
  quizBarFill: { height: '100%' },

  // Activity tab
  actCard: {
    borderRadius: 16, borderWidth: 1, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  actRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  actIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actBody: { flex: 1 },
  actText: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  actTime: { fontSize: 11, marginTop: 3 },
  actSep:  { height: 1, marginHorizontal: 14 },
});

export default TeacherStudentDetailScreen;
