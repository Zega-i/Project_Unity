import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  Pressable, StatusBar, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { teacherAPI } from '../../services/api';
import { ActivityIndicator } from 'react-native';

const { width } = Dimensions.get('window');
const GREEN = '#16A34A';

const TeacherAnalyticsScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight } = useHapticFeedback();
  
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      // Assuming we can use the same dashboard stats for now or a specific one if available
      const res = await teacherAPI.getDashboardStats();
      if (res && res.atRisk?.length > 0) {
        setData(res);
      } else {
        setData(null);
      }
    } catch (error) {
      console.log('Analytics load error:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Constants.statusBarHeight }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Statistik & Insight</Text>
        <Pressable style={styles.filterBtn}><Ionicons name="filter" size={20} color={GREEN} /></Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator color={GREEN} style={{ marginTop: 100 }} />
        ) : !data ? (
          <View style={{ alignItems: 'center', marginTop: 80, paddingHorizontal: 40 }}>
            <Ionicons name="bar-chart-outline" size={80} color={colors.border} />
            <Text style={[styles.cardTitle, { color: colors.text, marginTop: 20, textAlign: 'center' }]}>Belum Ada Analitik</Text>
            <Text style={[styles.cardSub, { color: colors.textSecondary, textAlign: 'center' }]}>
              Data performa dan insight akan muncul di sini setelah Anda membuat kelas dan siswa mulai mengerjakan tugas.
            </Text>
          </View>
        ) : (
          <>
            {/* Attendance Donut Section */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Ringkasan Kehadiran</Text>
              <Text style={[styles.cardSub, { color: colors.textSecondary }]}>Minggu Ini (Semua Kelas)</Text>
              
              <View style={styles.donutRow}>
                <View style={styles.donutContainer}>
                  <View style={[styles.donutInner, { borderColor: GREEN }]}>
                    <Text style={[styles.donutPercent, { color: colors.text }]}>{data.summary?.activeRate || 0}%</Text>
                    <Text style={[styles.donutLabel, { color: colors.textSecondary }]}>Aktif</Text>
                  </View>
                </View>
                
                <View style={styles.legend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: GREEN }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>Siswa: {data.summary?.totalStudents || 0}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Needs Attention Section */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Siswa Perlu Perhatian</Text>
            {data.atRisk?.map((s: any, i: number) => (
              <Pressable 
                key={i} 
                style={[styles.studentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => { triggerLight(); navigation.navigate('TeacherStudentDetail', { student: s }); }}
              >
                <View style={[styles.avatar, { backgroundColor: s.color + '25' }]}><Text style={[styles.avatarText, { color: s.color }]}>{s.name[0]}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: colors.text }]}>{s.name}</Text>
                  <Text style={[styles.issue, { color: colors.textSecondary }]}>Rata-rata: {s.avg}</Text>
                </View>
                <View style={[styles.actionBtn, { backgroundColor: '#EF4444' + '15' }]}><Text style={[styles.actionText, { color: '#EF4444' }]}>Perhatian</Text></View>
              </Pressable>
            ))}

            {/* AI Strategist Section */}
            <View style={[styles.aiCard, { backgroundColor: GREEN, borderColor: GREEN }]}>
              <View style={styles.aiHeader}>
                <Ionicons name="sparkles" size={20} color="#FFF" />
                <Text style={styles.aiTitle}>AI Strategist</Text>
              </View>
              <Text style={styles.aiContent}>
                AI sedang menganalisis data kelas Anda untuk memberikan strategi pengajaran terbaik.
              </Text>
              <Pressable style={styles.aiAction} onPress={() => { triggerLight(); navigation.navigate('TeacherAI'); }}>
                <Text style={styles.aiActionText}>Tanya Strategi Detail</Text>
                <Ionicons name="arrow-forward" size={16} color={GREEN} />
              </Pressable>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  filterBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20 },
  card: { padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  cardSub: { fontSize: 12, marginBottom: 24 },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 30 },
  donutContainer: { width: 120, height: 120, borderRadius: 60, borderWidth: 12, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  donutInner: { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 12, alignItems: 'center', justifyContent: 'center' },
  donutPercent: { fontSize: 24, fontWeight: 'bold' },
  donutLabel: { fontSize: 10, fontWeight: '600' },
  legend: { flex: 1, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 13, fontWeight: '500' },
  reportBtn: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 28, gap: 16 },
  reportTitle: { fontSize: 16, fontWeight: 'bold' },
  reportSub: { fontSize: 11 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  studentCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: 'bold' },
  name: { fontSize: 15, fontWeight: 'bold' },
  issue: { fontSize: 12 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  actionText: { fontSize: 11, fontWeight: 'bold' },
  aiCard: { padding: 24, borderRadius: 28, marginBottom: 20, elevation: 8, shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  aiTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  aiContent: { fontSize: 14, color: '#FFF', lineHeight: 22, marginBottom: 20, opacity: 0.9 },
  aiAction: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  aiActionText: { color: GREEN, fontWeight: 'bold', fontSize: 14 },
});

export default TeacherAnalyticsScreen;
