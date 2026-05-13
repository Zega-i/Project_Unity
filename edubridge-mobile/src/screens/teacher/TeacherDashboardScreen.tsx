import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const PURPLE = '#7C3AED';

const TeacherDashboardScreen = () => {
  const stats = [
    { label: 'Kelas Diampu', value: '3', icon: '📚' },
    { label: 'Total Siswa', value: '90', icon: '👥' },
    { label: 'Rata-rata Nilai', value: '78%', icon: '⭐' },
    { label: 'Perlu Perhatian', value: '12', icon: '⚠️' },
  ];

  const atRiskStudents = [
    { id: 1, name: 'Budi Santoso', risk: 75, class: 'X IPA 1' },
    { id: 2, name: 'Siti Nurhaliza', risk: 68, class: 'X IPA 2' },
    { id: 3, name: 'Ahmad Ridho', risk: 82, class: 'X IPS 1' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Halo, Bu Siti! 👋</Text>
          <Text style={styles.greetingSubtext}>Kelola kelas Anda dengan efektif</Text>
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

        {/* At-Risk Students */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Siswa Perlu Perhatian</Text>
          <FlatList
            data={atRiskStudents}
            renderItem={({ item }) => (
              <View style={styles.studentCard}>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{item.name}</Text>
                  <Text style={styles.studentClass}>{item.class}</Text>
                </View>
                <View style={styles.riskBadge}>
                  <Text style={styles.riskText}>{item.risk}%</Text>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
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
  greeting: {
    marginBottom: 30,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  greetingSubtext: {
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
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#ddd',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  studentCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  studentClass: {
    fontSize: 12,
    color: '#999',
  },
  riskBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  riskText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default TeacherDashboardScreen;