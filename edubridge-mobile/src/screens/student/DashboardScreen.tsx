import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const PURPLE = '#7C3AED';

const DashboardScreen = () => {
  const userName = 'Agusta';
  const stats = [
    { label: 'Materi Selesai', value: '12', icon: '📚' },
    { label: 'Rata-rata Nilai', value: '85%', icon: '⭐' },
    { label: 'Streak Belajar', value: '7 Hari', icon: '🔥' },
    { label: 'XP Points', value: '120', icon: '💎' },
  ];

  const recommendations = [
    { id: 1, title: 'Rumus Trigonometri', subject: 'Matematika', progress: 45 },
    { id: 2, title: 'Hukum Newton', subject: 'Fisika', progress: 60 },
  ];

  const subjects = [
    { id: 1, name: 'Matematika', color: '#FF6B6B', lessons: 12 },
    { id: 2, name: 'Fisika', color: '#4ECDC4', lessons: 8 },
    { id: 3, name: 'Biologi', color: '#45B7D1', lessons: 10 },
    { id: 4, name: 'B. Inggris', color: '#FFA07A', lessons: 15 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Greeting Header */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Halo, {userName}! 👋</Text>
          <Text style={styles.motivationText}>Semangat belajar hari ini!</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, idx) => (
            <View key={idx} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rekomendasi Belajar</Text>
          {recommendations.map((rec) => (
            <Pressable key={rec.id} style={styles.recommendCard}>
              <View>
                <Text style={styles.recommendTitle}>{rec.title}</Text>
                <Text style={styles.recommendSubject}>{rec.subject}</Text>
              </View>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={[PURPLE, '#5B21B6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${rec.progress}%` }]}
                />
              </View>
              <Text style={styles.progressText}>{rec.progress}%</Text>
            </Pressable>
          ))}
        </View>

        {/* Subjects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mata Pelajaran</Text>
          <View style={styles.subjectsGrid}>
            {subjects.map((subject) => (
              <Pressable key={subject.id} style={[styles.subjectCard, { backgroundColor: subject.color }]}>
                <Text style={styles.subjectName}>{subject.name}</Text>
                <Text style={styles.subjectLessons}>{subject.lessons} Materi</Text>
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
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  greeting: {
    marginBottom: 30,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  motivationText: {
    fontSize: 14,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  statCard: {
    width: '48%',
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#ddd',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  recommendCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: PURPLE,
  },
  recommendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  recommendSubject: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    color: PURPLE,
    fontWeight: 'bold',
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  subjectCard: {
    width: '48%',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subjectLessons: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
});

export default DashboardScreen;