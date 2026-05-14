import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const GREEN = '#16A34A';

type Tab = 'overview' | 'progress' | 'aktivitas';

const TOPIC_PERF = [
  { topic: 'Persamaan Linear', score: 90 },
  { topic: 'Fungsi Linear',    score: 80 },
  { topic: 'SPLDV',            score: 70 },
  { topic: 'Grafik',           score: 85 },
];

const OverviewTab = ({ colors, student }: any) => (
  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
    <View style={styles.statsRow}>
      {[
        { label: 'Rata-rata Nilai', value: `${student.avgScore}` },
        { label: 'Posisi di Kelas', value: '5 / 120' },
        { label: 'Kehadiran',       value: '95%' },
      ].map((s, i) => (
        <View key={i} style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }, i === 1 && styles.statBoxMid]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{s.value}</Text>
        </View>
      ))}
    </View>
    <Text style={[styles.subTitle, { color: colors.text }]}>Performa per Topik</Text>
    <View style={[styles.topicCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {TOPIC_PERF.map((t, i) => (
        <View key={i} style={{ marginBottom: i < TOPIC_PERF.length - 1 ? 16 : 0 }}>
          <View style={styles.topicHeader}><Text style={[styles.topicName, { color: colors.text }]}>{t.topic}</Text><Text style={[styles.topicScore, { color: GREEN }]}>{t.score}%</Text></View>
          <View style={[styles.topicBarBg, { backgroundColor: colors.border }]}><View style={[styles.topicBarFill, { width: `${t.score}%`, backgroundColor: GREEN }]} /></View>
        </View>
      ))}
    </View>
    <View style={[styles.aiCard, { backgroundColor: GREEN + '12', borderColor: GREEN + '30' }]}>
      <View style={styles.aiHeader}><Ionicons name="sparkles" size={16} color={GREEN} /><Text style={[styles.aiTitle, { color: GREEN }]}>Rekomendasi AI</Text></View>
      <Text style={[styles.aiText, { color: colors.text }]}>{student.firstName} perlu latihan lebih pada topik SPLDV dan Penerapan Persamaan.</Text>
    </View>
    <Pressable style={[styles.ctaBtn, { backgroundColor: GREEN }]}><Text style={styles.ctaText}>Buat Rencana Belajar</Text></Pressable>
  </ScrollView>
);

const TeacherStudentDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight } = useHapticFeedback();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const name = route.params?.name || 'Dika Pratama';
  const className = route.params?.className || 'Matematika 10A';
  const avgScore = route.params?.avgScore || 85;
  const avatarColor = route.params?.avatarColor || '#6366F1';
  const firstName = name.split(' ')[0];
  const initials = name.split(' ').map((w: string) => w[0]).slice(0, 2).join('');
  const student = { name, firstName, className, avgScore, avatarColor };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.header}><Pressable style={styles.backBtn} onPress={() => { triggerLight(); navigation.goBack(); }}><Ionicons name="arrow-back" size={22} color={colors.text} /></Pressable></View>
      <View style={[styles.profileRow, { borderBottomColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: avatarColor + '20', borderColor: avatarColor + '50' }]}><Text style={[styles.avatarText, { color: avatarColor }]}>{initials}</Text></View>
        <View><Text style={[styles.profileName, { color: colors.text }]}>{name}</Text><Text style={[styles.profileClass, { color: colors.textSecondary }]}>{className}</Text></View>
      </View>
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        {['overview', 'progress', 'aktivitas'].map(t => (
          <Pressable key={t} style={[styles.tabBtn, activeTab === t && { borderColor: GREEN, borderWidth: 1.5, backgroundColor: GREEN + '08' }]} onPress={() => { triggerLight(); setActiveTab(t as Tab); }}>
            <Text style={[styles.tabText, { color: activeTab === t ? GREEN : colors.textSecondary }]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
          </Pressable>
        ))}
      </View>
      {activeTab === 'overview' && <OverviewTab colors={colors} student={student} />}
      {activeTab !== 'overview' && <View style={styles.emptyState}><Text style={{ color: colors.textSecondary }}>Segera hadir</Text></View>}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingBottom: 18, borderBottomWidth: 1 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  avatarText: { fontSize: 20, fontWeight: 'bold' },
  profileName: { fontSize: 18, fontWeight: 'bold' },
  profileClass: { fontSize: 14, marginTop: 3 },
  tabBar: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 },
  tabBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  tabText: { fontSize: 14, fontWeight: '700' },
  tabScroll: { paddingHorizontal: 20, paddingBottom: 50 },
  statsRow: { flexDirection: 'row', marginTop: 20, marginBottom: 20 },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 16, borderWidth: 1, borderRadius: 14 },
  statBoxMid: { marginHorizontal: 10 },
  statLabel: { fontSize: 11, fontWeight: '500', textAlign: 'center', marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  subTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  topicCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  topicHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  topicName: { fontSize: 14, fontWeight: '600' },
  topicScore: { fontSize: 14, fontWeight: '700' },
  topicBarBg: { height: 6, borderRadius: 3 },
  topicBarFill: { height: '100%', borderRadius: 3 },
  aiCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 20, gap: 8 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiTitle: { fontSize: 13, fontWeight: '700' },
  aiText: { fontSize: 14, lineHeight: 21 },
  ctaBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  ctaText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  emptyState: { alignItems: 'center', marginTop: 80 },
});

export default TeacherStudentDetailScreen;
