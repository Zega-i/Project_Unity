import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';

const PURPLE = '#7C3AED';
const LIGHT_PURPLE = '#F5F3FF';

const DashboardScreen = () => {
  const user = authStore.getUserSync();
  const userName = user?.name?.split(' ')[0] || 'Siswa';
  
  const stats = [
    { label: 'Materi Selesai', value: '12', icon: '📚' },
    { label: 'Rata-rata Nilai', value: '85%', icon: '⭐' },
    { label: 'Streak Belajar', value: '7 Hari', icon: '🔥' },
    { label: 'XP Points', value: '120', icon: '💎' },
  ];

  const recommendations = [
    { id: 1, title: 'Persamaan Kuadrat', subject: 'Matematika', class: 'Kelas 10', progress: 45 },
    { id: 2, title: 'Sistem Pernapasan Manusia', subject: 'Biologi', class: 'Kelas 8', progress: 0 },
  ];

  const subjects = [
    { id: 1, name: 'Matematika', icon: 'calculator', color: '#7C3AED', class: 'Kelas 10' },
    { id: 2, name: 'Fisika', icon: 'flask', color: '#7C3AED', class: 'Kelas 10' },
    { id: 3, name: 'Biologi', icon: 'leaf', color: '#7C3AED', class: 'Kelas 9' },
    { id: 4, name: 'B. Inggris', icon: 'language', color: '#7C3AED', class: 'Kelas 9' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header with Search and Profile */}
        <View style={styles.headerRow}>
          <Text style={styles.appTitle}>EduBridge AI</Text>
          <View style={styles.headerIcons}>
            <Pressable style={styles.iconBtn}>
              <Ionicons name="search-outline" size={24} color="#666" />
            </Pressable>
            <Pressable style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={24} color="#666" />
            </Pressable>
          </View>
        </View>

        {/* Greeting Banner */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Halo, {userName}! 👋</Text>
          <Text style={styles.greetingSub}>Semangat belajar hari ini!</Text>
        </View>

        {/* Stats Banner Card */}
        <LinearGradient
          colors={[PURPLE, '#5B21B6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.statsBanner}
        >
          <View style={styles.statsBannerLeft}>
            <Text style={styles.bannerTitle}>Ringkasan Belajarmu</Text>
            <View style={styles.statsGrid}>
              {stats.map((stat, idx) => (
                <View key={idx} style={styles.statItem}>
                  <Text style={styles.statIcon}>{stat.icon}</Text>
                  <View>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
          {/* Illustration placeholder - could be an image of the robot */}
          <View style={styles.robotContainer}>
            <Ionicons name="hardware-chip-outline" size={60} color="rgba(255,255,255,0.3)" />
          </View>
        </LinearGradient>

        {/* Recommendations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rekomendasi Belajar Untukmu</Text>
          </View>
          {recommendations.map((rec) => (
            <Pressable key={rec.id} style={styles.recommendCard}>
              <View style={styles.recommendInfo}>
                <View style={styles.recIconBg}>
                  <Ionicons name="book-outline" size={24} color={PURPLE} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recTitle}>{rec.title}</Text>
                  <Text style={styles.recSubject}>{rec.subject} • {rec.class}</Text>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${rec.progress}%` }]} />
                    </View>
                    <Text style={styles.progressPct}>{rec.progress}%</Text>
                  </View>
                </View>
                <Pressable style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>
                    {rec.progress > 0 ? 'Lanjut Belajar' : 'Mulai Belajar'}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Subjects */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mata Pelajaran</Text>
            <Pressable><Text style={styles.seeAll}>Lihat Semua</Text></Pressable>
          </View>
          <View style={styles.subjectsGrid}>
            {subjects.map((subject) => (
              <Pressable key={subject.id} style={styles.subjectCard}>
                <View style={[styles.subjectIconBg, { backgroundColor: LIGHT_PURPLE }]}>
                  <Ionicons name={subject.icon as any} size={28} color={PURPLE} />
                </View>
                <Text style={styles.subjectName}>{subject.name}</Text>
                <Text style={styles.subjectClass}>{subject.class}</Text>
              </Pressable>
            ))}
          </View>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: PURPLE,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  greetingSection: {
    marginBottom: 20,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  greetingSub: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  statsBanner: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    overflow: 'hidden',
  },
  statsBannerLeft: {
    flex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
    gap: 8,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
  },
  robotContainer: {
    position: 'absolute',
    right: -10,
    bottom: -10,
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
  recommendCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  recommendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: LIGHT_PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  recSubject: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: PURPLE,
    borderRadius: 3,
  },
  progressPct: {
    fontSize: 10,
    fontWeight: 'bold',
    color: PURPLE,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: LIGHT_PURPLE,
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: PURPLE,
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  subjectCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  subjectIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subjectClass: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
});

export default DashboardScreen;