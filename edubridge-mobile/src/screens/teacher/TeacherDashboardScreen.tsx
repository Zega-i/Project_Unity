import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authStore } from '../../store/authStore';

const PURPLE = '#7C3AED';
const LIGHT_PURPLE = '#F5F3FF';

const TeacherDashboardScreen = () => {
  const user = authStore.getUserSync();
  const userName = user?.name?.split(' ')[0] || 'Guru';

  const stats = [
    { label: 'Kelas Diampu', value: '3', icon: 'school-outline', color: '#7C3AED' },
    { label: 'Total Siswa', value: '90', icon: 'people-outline', color: '#7C3AED' },
    { label: 'Rata-rata Nilai', value: '78%', icon: 'stats-chart-outline', color: '#7C3AED' },
    { label: 'Siswa Perhatian', value: '12', icon: 'alert-circle-outline', color: '#EF4444' },
  ];

  const classPerformance = [
    { name: 'Kelas 10A', value: 80 },
    { name: 'Kelas 10B', value: 75 },
    { name: 'Kelas 9A', value: 70 },
  ];

  const atRiskStudents = [
    { id: 1, name: 'Adityo Pratama', class: 'Kelas 10A', score: '45%' },
    { id: 2, name: 'Siti Aisyah', class: 'Kelas 10B', score: '50%' },
    { id: 3, name: 'Budi Santoso', class: 'Kelas 9A', score: '55%' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingTitle}>Halo, Bu {userName}! 👋</Text>
            <Text style={styles.greetingSub}>Berikut ringkasan kelas yang Anda ampu.</Text>
          </View>
          <View style={styles.headerIcons}>
            <Pressable style={styles.iconBtn}>
              <Ionicons name="search-outline" size={24} color="#666" />
            </Pressable>
            <Pressable style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={24} color="#666" />
            </Pressable>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, idx) => (
            <View key={idx} style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: idx === 3 ? '#FEF2F2' : LIGHT_PURPLE }]}>
                <Ionicons name={stat.icon as any} size={24} color={idx === 3 ? '#EF4444' : PURPLE} />
              </View>
              <View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Class Performance Chart (Simulated) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performa Kelas</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartSub}>Rata-rata skor harian</Text>
            </View>
            <View style={styles.chartArea}>
              {classPerformance.map((item, idx) => (
                <View key={idx} style={styles.chartCol}>
                  <View style={styles.barContainer}>
                    <View style={[styles.barFill, { height: `${item.value}%` }]} />
                    <Text style={styles.barPct}>{item.value}%</Text>
                  </View>
                  <Text style={styles.barLabel}>{item.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Students Needing Attention */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Siswa Perlu Perhatian</Text>
            <Pressable><Text style={styles.seeAll}>Lihat Semua</Text></Pressable>
          </View>
          {atRiskStudents.map((student) => (
            <View key={student.id} style={styles.studentCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentClass}>{student.class}</Text>
              </View>
              <Text style={styles.scoreText}>{student.score}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  greetingSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  seeAll: {
    color: PURPLE,
    fontSize: 12,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 2,
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartSub: {
    fontSize: 12,
    color: '#94a3b8',
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 150,
    alignItems: 'flex-end',
  },
  chartCol: {
    alignItems: 'center',
    width: '25%',
  },
  barContainer: {
    width: 40,
    height: '100%',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    backgroundColor: PURPLE,
    width: '100%',
    borderRadius: 8,
  },
  barPct: {
    position: 'absolute',
    top: -20,
    fontSize: 10,
    fontWeight: 'bold',
    color: PURPLE,
    width: '100%',
    textAlign: 'center',
  },
  barLabel: {
    marginTop: 10,
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: LIGHT_PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: PURPLE,
    fontWeight: 'bold',
    fontSize: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  studentClass: {
    fontSize: 12,
    color: '#94a3b8',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EF4444',
  },
});

export default TeacherDashboardScreen;