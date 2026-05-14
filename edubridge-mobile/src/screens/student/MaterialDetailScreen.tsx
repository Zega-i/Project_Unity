import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  Pressable, StatusBar, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const PURPLE = '#7C3AED';

const MaterialDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useTheme();
  const { triggerLight, triggerMedium } = useHapticFeedback();
  const { material } = route.params;

  const [expandedSections, setExpandedSections] = useState<string[]>(['content']);

  const toggleSection = (id: string) => {
    triggerLight();
    setExpandedSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // Mock data for linked assignments
  const linkedAssignments = [
    { id: 'a1', title: 'Latihan Soal ' + material.title, duration: '20m', status: 'Pending' },
    { id: 'a2', title: 'Tugas Proyek Mandiri', duration: '2h', status: 'Pending' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Constants.statusBarHeight }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{material.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner/Subject Info */}
        <View style={[styles.subjectTag, { backgroundColor: PURPLE + '15' }]}>
          <Text style={[styles.subjectText, { color: PURPLE }]}>{material.subject}</Text>
        </View>

        {/* Content Section (Accordion) */}
        <Pressable 
          style={[styles.sectionHeader, { borderBottomColor: colors.border }]} 
          onPress={() => toggleSection('content')}
        >
          <View style={styles.sectionTitleRow}>
            <Ionicons name="book-outline" size={20} color={PURPLE} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Materi Pembelajaran</Text>
          </View>
          <Ionicons 
            name={expandedSections.includes('content') ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={colors.textSecondary} 
          />
        </Pressable>

        {expandedSections.includes('content') && (
          <View style={styles.sectionBody}>
            <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
              Materi ini mencakup pemahaman mendalam tentang {material.title}. 
              Silakan pelajari video dan bacaan di bawah ini dengan seksama sebelum mengerjakan tugas.
            </Text>
            {/* Placeholder for real content (Video/Text) */}
            <View style={[styles.contentPlaceholder, { backgroundColor: colors.surface }]}>
              <Ionicons name="play-circle" size={48} color={PURPLE} />
              <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Video Materi</Text>
            </View>
          </View>
        )}

        {/* Assignments Section (The Sync Request) */}
        <Pressable 
          style={[styles.sectionHeader, { borderBottomColor: colors.border, marginTop: 10 }]} 
          onPress={() => toggleSection('tasks')}
        >
          <View style={styles.sectionTitleRow}>
            <Ionicons name="clipboard-outline" size={20} color="#EF4444" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tugas & Latihan Terkait</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{linkedAssignments.length}</Text>
            </View>
          </View>
          <Ionicons 
            name={expandedSections.includes('tasks') ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={colors.textSecondary} 
          />
        </Pressable>

        {expandedSections.includes('tasks') && (
          <View style={styles.sectionBody}>
            {linkedAssignments.map((task) => (
              <Pressable 
                key={task.id} 
                style={[styles.taskItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => { triggerMedium(); navigation.navigate('Assignments'); }}
              >
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
                  <Text style={[styles.taskMeta, { color: colors.textSecondary }]}>Estimasi: {task.duration}</Text>
                </View>
                <View style={styles.startBtn}>
                  <Text style={styles.startBtnText}>Buka</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Action Footer */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable style={styles.completeBtn} onPress={() => { triggerMedium(); navigation.goBack(); }}>
          <Text style={styles.completeBtnText}>Tandai Selesai Pelajari</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  subjectTag: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 20 },
  subjectText: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  countBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  countText: { fontSize: 10, color: '#EF4444', fontWeight: 'bold' },
  sectionBody: { paddingVertical: 15, gap: 12 },
  bodyText: { fontSize: 14, lineHeight: 22 },
  contentPlaceholder: { height: 180, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  taskItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  taskMeta: { fontSize: 12 },
  startBtn: { backgroundColor: PURPLE, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  startBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1 },
  completeBtn: { backgroundColor: PURPLE, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  completeBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default MaterialDetailScreen;
