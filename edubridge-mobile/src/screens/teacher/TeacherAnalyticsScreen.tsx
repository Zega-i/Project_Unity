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

const { width } = Dimensions.get('window');
const GREEN = '#16A34A';

const TeacherAnalyticsScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight } = useHapticFeedback();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Constants.statusBarHeight }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Statistik & Insight</Text>
        <Pressable style={styles.filterBtn}><Ionicons name="filter" size={20} color={GREEN} /></Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Attendance Donut Section */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Ringkasan Kehadiran</Text>
          <Text style={[styles.cardSub, { color: colors.textSecondary }]}>Minggu Ini (Semua Kelas)</Text>
          
          <View style={styles.donutRow}>
            <View style={styles.donutContainer}>
              <View style={[styles.donutInner, { borderColor: GREEN }]}>
                <Text style={[styles.donutPercent, { color: colors.text }]}>92%</Text>
                <Text style={[styles.donutLabel, { color: colors.textSecondary }]}>Hadir</Text>
              </View>
            </View>
            
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: GREEN }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Hadir: 118</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Izin: 6</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Sakit: 4</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Alpha: 0</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Button: Download Report */}
        <Pressable 
          style={[styles.reportBtn, { backgroundColor: GREEN + '15', borderColor: GREEN + '30' }]}
          onPress={() => triggerLight()}
        >
          <Ionicons name="document-text" size={24} color={GREEN} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.reportTitle, { color: GREEN }]}>Laporan Lengkap</Text>
            <Text style={[styles.reportSub, { color: GREEN }]}>Unduh laporan performa kelas (PDF)</Text>
          </View>
          <Ionicons name="download-outline" size={20} color={GREEN} />
        </Pressable>

        {/* Needs Attention Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Siswa Perlu Perhatian</Text>
        {[
          { id: 'at-1', name: 'Rina Amelia', kelas: '10A - MTK', avg: 65, issue: 'Nilai turun di Matematika', color: '#EF4444' },
          { id: 'at-2', name: 'Dika Pratama', kelas: '11B - FIS', avg: 58, issue: 'Aktivitas rendah di Fisika', color: '#F59E0B' },
        ].map((s, i) => (
          <Pressable 
            key={i} 
            style={[styles.studentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => { triggerLight(); navigation.navigate('TeacherStudentDetail', { student: s }); }}
          >
            <View style={[styles.avatar, { backgroundColor: colors.surface }]}><Text style={[styles.avatarText, { color: colors.text }]}>{s.name[0]}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.text }]}>{s.name}</Text>
              <Text style={[styles.issue, { color: colors.textSecondary }]}>{s.issue}</Text>
            </View>
            <View style={[styles.actionBtn, { backgroundColor: s.color + '15' }]}><Text style={[styles.actionText, { color: s.color }]}>Perhatian</Text></View>
          </Pressable>
        ))}

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
});

export default TeacherAnalyticsScreen;
