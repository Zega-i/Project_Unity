import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, ActivityIndicator, RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';

const PURPLE = '#7C3AED';

interface Recommendation {
  id: string;
  title: string;
  subject: string;
  level: string;
  duration: string;
  progress: number;
  color: string;
  icon: string;
  importance: number; // 1-3: high, medium, low
}

const RecommendationsScreen = () => {
  const navigation = useNavigation<any>();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    { id: '1', title: 'Persamaan Linear', subject: 'Matematika', level: 'Dasar', duration: '15 Min', progress: 60, color: '#6366F1', icon: '📐', importance: 1 },
    { id: '2', title: 'Hukum Newton', subject: 'Fisika', level: 'Menengah', duration: '20 Min', progress: 40, color: '#F59E0B', icon: '⚡', importance: 1 },
    { id: '3', title: 'Fungsi Kuadrat', subject: 'Matematika', level: 'Menengah', duration: '25 Min', progress: 35, color: '#8B5CF6', icon: '📊', importance: 2 },
    { id: '4', title: 'Fotosintesis', subject: 'Biologi', level: 'Dasar', duration: '18 Min', progress: 20, color: '#10B981', icon: '🌱', importance: 2 },
    { id: '5', title: 'Sejarah Peradaban', subject: 'Sejarah', level: 'Menengah', duration: '30 Min', progress: 50, color: '#EF4444', icon: '📜', importance: 3 },
    { id: '6', title: 'Grammar Bahasa Inggris', subject: 'Bahasa Inggris', level: 'Dasar', duration: '22 Min', progress: 45, color: '#06B6D4', icon: '📚', importance: 2 },
  ]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      // TODO: Fetch from API when backend is ready
      // For now, using mock data
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecommendations();
    setRefreshing(false);
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const getImportanceLabel = (importance: number) => {
    switch (importance) {
      case 1:
        return { label: 'Prioritas Tinggi', color: '#EF4444' };
      case 2:
        return { label: 'Prioritas Sedang', color: '#F59E0B' };
      case 3:
        return { label: 'Prioritas Rendah', color: '#94A3B8' };
      default:
        return { label: 'Lainnya', color: '#94A3B8' };
    }
  };

  const sortedRecommendations = [...recommendations].sort((a, b) => a.importance - b.importance);

  if (loading && recommendations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Semua Rekomendasi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PURPLE]} />
        }
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={PURPLE} />
          <Text style={styles.infoText}>
            Rekomendasi didasarkan pada analisis AI terhadap performa belajarmu
          </Text>
        </View>

        {/* Recommendations List */}
        <View style={styles.recomList}>
          {sortedRecommendations.map((item) => {
            const importanceInfo = getImportanceLabel(item.importance);
            return (
              <Pressable key={item.id} style={styles.recomCard}>
                <View style={[styles.recomIconBox, { backgroundColor: item.color + '10' }]}>
                  <Text style={styles.recomIconText}>{item.icon}</Text>
                </View>

                <View style={styles.recomInfo}>
                  <View style={styles.headerRow}>
                    <Text style={styles.recomSubject}>{item.subject}</Text>
                    <View style={[styles.importanceBadge, { backgroundColor: importanceInfo.color + '20' }]}>
                      <Text style={[styles.importanceText, { color: importanceInfo.color }]}>
                        {importanceInfo.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.recomTitle}>{item.title}</Text>
                  <Text style={styles.recomLevel}>{item.level}</Text>

                  <View style={styles.recomFooter}>
                    <Ionicons name="time-outline" size={14} color="#94A3B8" />
                    <Text style={styles.recomTime}>{item.duration}</Text>
                    <View style={styles.miniProgressBg}>
                      <View style={[styles.miniProgressFill, { width: `${item.progress}%`, backgroundColor: item.color }]} />
                    </View>
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              </Pressable>
            );
          })}
        </View>

        {/* Empty State */}
        {sortedRecommendations.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={48} color={PURPLE} />
            <Text style={styles.emptyStateTitle}>Tidak ada rekomendasi</Text>
            <Text style={styles.emptyStateDesc}>
              Bergabunglah dengan kelas untuk mendapatkan rekomendasi belajar
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 40 },

  infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: PURPLE + '10', borderRadius: 16, padding: 16, marginBottom: 24, gap: 12 },
  infoText: { flex: 1, fontSize: 13, color: '#1E293B', fontWeight: '500', lineHeight: 18 },

  recomList: { gap: 12 },
  recomCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F1F5F9', flexDirection: 'row', alignItems: 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 1 },
  recomIconBox: { width: 60, height: 60, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  recomIconText: { fontSize: 28 },
  recomInfo: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  recomSubject: { fontSize: 11, color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase' },
  importanceBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  importanceText: { fontSize: 10, fontWeight: '700' },
  recomTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginVertical: 4 },
  recomLevel: { fontSize: 12, color: '#64748B', marginBottom: 8 },
  recomFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  recomTime: { fontSize: 12, color: '#94A3B8', marginLeft: 4, marginRight: 10 },
  miniProgressBg: { flex: 1, height: 4, backgroundColor: '#F1F5F9', borderRadius: 2 },
  miniProgressFill: { height: '100%', borderRadius: 2 },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyStateTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginTop: 16 },
  emptyStateDesc: { fontSize: 14, color: '#94A3B8', marginTop: 8, textAlign: 'center' },
});

export default RecommendationsScreen;
