import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  Pressable, Dimensions, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { teacherAPI } from '../../services/api';

const GREEN = '#16A34A';

const TeacherStudentDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight } = useHapticFeedback();
  const { student } = route.params || {};
  const [activeTab, setActiveTab] = React.useState('Overview');
  const [performance, setPerformance] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchPerformance = async () => {
    if (!student?.id) {
      console.log('[TeacherStudentDetailScreen] Cannot fetch performance: student.id is missing', student);
      return;
    }
    console.log('[TeacherStudentDetailScreen] Fetching performance for student ID:', student.id, 'class name:', student.kelas);
    setLoading(true);
    try {
      const res = await teacherAPI.getStudentPerformance(student.id, student.kelas);
      console.log('[TeacherStudentDetailScreen] API response:', JSON.stringify(res, null, 2));
      if (res.success) {
        setPerformance(res.data);
      } else {
        console.log('[TeacherStudentDetailScreen] API returned success=false:', res);
      }
    } catch (error) {
      console.log('[TeacherStudentDetailScreen] Error fetching student performance:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPerformance();
  }, [student?.id]);

  const rawAvg = performance ? performance.avg : student?.avg;
  const displayAvg = rawAvg !== undefined
    ? (typeof rawAvg === 'string' && rawAvg.includes('%') ? rawAvg : `${rawAvg}%`)
    : '0%';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Constants.statusBarHeight }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profil Siswa</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section at the TOP */}
        <View style={styles.topProfile}>
          <View style={[styles.avatar, { backgroundColor: (student?.color || GREEN) + '15' }]}>
            <Text style={[styles.avatarText, { color: student?.color || GREEN }]}>{student?.name?.charAt(0) || 'S'}</Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{student?.name || 'Nama Siswa'}</Text>
          <Text style={[styles.class, { color: colors.textSecondary }]}>{student?.kelas || 'Kelas tidak diketahui'}</Text>
        </View>

        {/* Tabs Below Profile */}
        <View style={[styles.tabHeader, { borderBottomColor: colors.border }]}>
          {['Overview', 'Aktivitas'].map((tab) => (
            <Pressable 
              key={tab} 
              style={[styles.tab, activeTab === tab && { borderBottomColor: GREEN, borderBottomWidth: 3 }]}
              onPress={() => { triggerLight(); setActiveTab(tab); }}
            >
              <Text style={[styles.tabLabelText, { color: activeTab === tab ? GREEN : colors.textSecondary }]}>{tab}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.tabContent}>
          {loading ? (
            <ActivityIndicator color={GREEN} style={{ marginTop: 40 }} />
          ) : activeTab === 'Overview' ? (
            <>
              <View style={styles.statsGrid}>
                <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rerata Skor</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>{displayAvg}</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Peringkat</Text>
                  <Text style={[styles.statValue, { color: colors.text, fontSize: 18 }]}>
                    {performance?.rank || 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Performance Merged into Overview */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Analisis Performa Kuis</Text>
                {(performance?.topicAnalysis || [
                  { label: 'Belum Ada Kuis', val: 0, col: '#EF4444' }
                ]).map((t: any, i: number) => (
                  <View key={i} style={styles.topicRow}>
                    <View style={styles.topicLabelRow}>
                      <Text style={[styles.topicLabel, { color: colors.text }]} numberOfLines={1}>{t.label}</Text>
                      <Text style={[styles.topicVal, { color: t.col }]}>{t.val}%</Text>
                    </View>
                    <View style={[styles.barTrack, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
                      <View style={[styles.barFill, { width: `${t.val}%`, backgroundColor: t.col }]} />
                    </View>
                  </View>
                ))}
              </View>

              <View style={[styles.aiSection, { backgroundColor: isDarkMode ? '#064E3B' : '#F0FDF4', borderColor: isDarkMode ? '#065F46' : '#BBF7D0' }]}>
                <View style={styles.aiHeader}>
                  <Ionicons name="sparkles" size={20} color={isDarkMode ? '#34D399' : GREEN} />
                  <Text style={[styles.aiTitle, { color: isDarkMode ? '#34D399' : GREEN }]}>AI Rekomendasi</Text>
                </View>
                <Text style={[styles.aiText, { color: isDarkMode ? '#D1FAE5' : '#166534' }]}>
                  {performance?.aiRecommendation || 'Siswa belum memiliki rekomendasi.'}
                </Text>
                <Pressable 
                  style={styles.aiAction} 
                  onPress={() => { 
                    triggerLight(); 
                    navigation.navigate('TeacherAIChat', { 
                      studentName: student?.name, 
                      recommendation: performance?.aiRecommendation,
                      performanceData: performance
                    }); 
                  }}
                >
                  <Text style={styles.aiActionText}>Tanya AI Assistant</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Aktivitas Belajar</Text>
              {performance?.activityHistory && performance.activityHistory.length > 0 ? (
                performance.activityHistory.map((h: any, i: number) => (
                  <View key={i} style={[styles.historyRow, i < performance.activityHistory.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                    <View style={[styles.historyIconWrap, { backgroundColor: colors.surface }]}>
                      <Ionicons 
                        name={h.type === 'MATERIAL' ? 'document-text-outline' : 'help-circle-outline'} 
                        size={18} 
                        color={h.type === 'MATERIAL' ? '#3B82F6' : GREEN} 
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.historyTitle, { color: colors.text }]} numberOfLines={1}>{h.t}</Text>
                      <Text style={[styles.historyDate, { color: colors.textSecondary }]}>{h.d}</Text>
                    </View>
                    <Text style={[
                      styles.historyScore, 
                      { color: (h.type === 'MATERIAL' || parseFloat(h.s) >= 75) ? GREEN : '#EF4444' }
                    ]}>
                      {h.s}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: colors.textSecondary, textAlign: 'center', marginVertical: 20 }}>Belum ada riwayat aktivitas belajar.</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { paddingBottom: 40 },
  topProfile: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { fontSize: 36, fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  class: { fontSize: 16, fontWeight: '500' },
  tabHeader: { flexDirection: 'row', justifyContent: 'center', borderBottomWidth: 1, marginBottom: 20 },
  tab: { paddingVertical: 14, marginHorizontal: 30 },
  tabLabelText: { fontSize: 15, fontWeight: '700' },
  tabContent: { paddingHorizontal: 20 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statBox: { flex: 1, padding: 16, borderRadius: 20, alignItems: 'center' },
  statLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  card: { padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 0.5 },
  topicRow: { marginBottom: 18 },
  topicLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  topicLabel: { fontSize: 14, fontWeight: '600' },
  topicVal: { fontSize: 14, fontWeight: 'bold' },
  barTrack: { height: 10, borderRadius: 5, width: '100%' },
  barFill: { height: '100%', borderRadius: 5 },
  aiSection: { padding: 24, borderRadius: 24, borderWidth: 1 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  aiTitle: { fontSize: 16, fontWeight: 'bold' },
  aiText: { fontSize: 14, lineHeight: 22 },
  aiAction: { backgroundColor: GREEN, paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginTop: 20 },
  aiActionText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  historyIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  historyTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  historyDate: { fontSize: 11 },
  historyScore: { fontSize: 14, fontWeight: 'bold' },
});

export default TeacherStudentDetailScreen;
