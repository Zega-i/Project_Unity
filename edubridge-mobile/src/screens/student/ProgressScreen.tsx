import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const PURPLE = '#7C3AED';

const ProgressScreen = () => {
  const weeklyStats = [
    { day: 'Sen', score: 85 },
    { day: 'Sel', score: 90 },
    { day: 'Rab', score: 78 },
    { day: 'Kam', score: 92 },
    { day: 'Jum', score: 88 },
    { day: 'Sab', score: 95 },
    { day: 'Min', score: 80 },
  ];

  const subjects = [
    { name: 'Matematika', percentage: 85 },
    { name: 'Fisika', percentage: 78 },
    { name: 'Biologi', percentage: 92 },
    { name: 'B. Inggris', percentage: 88 },
  ];

  const maxScore = 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Weekly Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skor Mingguan</Text>
          <View style={styles.weeklyChart}>
            {weeklyStats.map((stat, idx) => (
              <View key={idx} style={styles.chartColumn}>
                <LinearGradient
                  colors={[PURPLE, '#5B21B6']}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                  style={[
                    styles.bar,
                    { height: (stat.score / maxScore) * 200 },
                  ]}
                />
                <Text style={styles.barLabel}>{stat.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Subject Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performa Mata Pelajaran</Text>
          {subjects.map((subject, idx) => (
            <View key={idx} style={styles.subjectItem}>
              <View style={styles.subjectHeader}>
                <Text style={styles.subjectName}>{subject.name}</Text>
                <Text style={styles.subjectPercentage}>{subject.percentage}%</Text>
              </View>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={[PURPLE, '#5B21B6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.progressFill,
                    { width: `${subject.percentage}%` },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistik</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>42</Text>
              <Text style={styles.statLabel}>Quiz Selesai</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>87%</Text>
              <Text style={styles.statLabel}>Rata-rata</Text>
            </View>
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
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  weeklyChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 220,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 30,
    borderRadius: 6,
    marginBottom: 10,
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  subjectItem: {
    marginBottom: 16,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  subjectPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: PURPLE,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PURPLE,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
});

export default ProgressScreen;