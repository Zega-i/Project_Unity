import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  Pressable, StatusBar, Dimensions, ActivityIndicator,
  Modal, TextInput, Animated, PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { teacherAPI } from '../../services/api';
import { USE_MOCK_DATA } from '../../constants';

const { width } = Dimensions.get('window');
const GREEN = '#16A34A';

const TeacherAnalyticsScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight } = useHapticFeedback();
  
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  // Filter States
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('Semua');

  // Swipe gesture for filter modal
  const panY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showFilterModal) {
      panY.setValue(0);
    }
  }, [showFilterModal]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120) {
          Animated.timing(panY, {
            toValue: Dimensions.get('window').height,
            duration: 220,
            useNativeDriver: true,
          }).start(() => {
            setShowFilterModal(false);
          });
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const loadClasses = async () => {
    try {
      const res = await teacherAPI.getMyClasses();
      if (res.success && res.data) {
        // Only show active (non-archived) classes
        const activeClasses = res.data.filter((c: any) => !c.archived);
        setClassesList(activeClasses);
      }
    } catch (error) {
      console.log('Error loading classes list:', error);
    }
  };

  const loadData = async (classId?: string) => {
    setLoading(true);
    if (USE_MOCK_DATA) {
      setData({
        summary: {
          activeClasses: 3,
          totalStudents: 78,
          avgScore: 82,
          completedTasks: 12,
          activeRate: 94
        },
        chart: [
          { label: 'Tugas 1', value: 85 },
          { label: 'Kuis 1', value: 78 },
          { label: 'Tugas 2', value: 92 },
          { label: 'Kuis 2', value: 68 },
          { label: 'UTS', value: 88 }
        ],
        atRisk: [
          {
            id: 'mock_risk_1',
            name: 'Budi Santoso',
            kelas: 'Kelas 10-A',
            avg: '62.4%',
            color: '#EF4444',
            issue: 'Nilai kuis matematika menurun dalam 3 kuis terakhir'
          },
          {
            id: 'mock_risk_2',
            name: 'Siti Aminah',
            kelas: 'Kelas 10-B',
            avg: '64.8%',
            color: '#EF4444',
            issue: 'Keaktifan membaca materi kurang dari 20% minggu ini'
          },
          {
            id: 'mock_risk_3',
            name: 'Aditya Pratama',
            kelas: 'Kelas 10-A',
            avg: '58.0%',
            color: '#EF4444',
            issue: 'Belum mengumpulkan 2 tugas terakhir'
          }
        ]
      });
      setLoading(false);
      return;
    }
    try {
      const res = await teacherAPI.getDashboardStats(classId);
      if (res) {
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

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    loadData(selectedClass?.id);
  }, [selectedClass]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Constants.statusBarHeight }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Statistik & Insight</Text>
          {selectedClass && (
            <Pressable 
              onPress={() => { triggerLight(); setSelectedClass(null); }}
              style={styles.activeFilterBadge}
            >
              <Text style={styles.activeFilterText}>Kelas: {selectedClass.name}</Text>
              <Ionicons name="close-circle" size={14} color="#FFF" style={{ marginLeft: 4 }} />
            </Pressable>
          )}
        </View>
        <Pressable 
          onPress={() => { triggerLight(); setShowFilterModal(true); }}
          style={[styles.filterBtn, selectedClass && { backgroundColor: GREEN + '15' }]}
        >
          <Ionicons name="filter" size={20} color={selectedClass ? GREEN : colors.textSecondary} />
        </Pressable>
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
              <Text style={[styles.cardSub, { color: colors.textSecondary }]}>Minggu Ini ({selectedClass ? selectedClass.name : 'Semua Kelas'})</Text>
              
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
              <Pressable 
                style={styles.aiAction} 
                onPress={() => { 
                  triggerLight(); 
                  navigation.navigate('TeacherAIChat', { 
                    type: 'CLASS_STRATEGY',
                    classStats: data
                  }); 
                }}
              >
                <Text style={styles.aiActionText}>Tanya Strategi Detail</Text>
                <Ionicons name="arrow-forward" size={16} color={GREEN} />
              </Pressable>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowFilterModal(false)} />
          <Animated.View 
            style={[
              styles.detailModalSheet, 
              { 
                backgroundColor: colors.card, 
                height: '55%',
                transform: [{ translateY: panY }]
              }
            ]}
          >
            {/* Close button absolutely positioned on top right */}
            <Pressable 
              style={[styles.sheetClose, { position: 'absolute', top: 20, right: 24, zIndex: 10 }]} 
              onPress={() => setShowFilterModal(false)}
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>

            {/* Header Drag Zone */}
            <View {...panResponder.panHandlers} style={{ width: '100%', alignItems: 'center', paddingTop: 12 }}>
              <View style={styles.sheetHandle} />
              <View style={[styles.sheetHeader, { width: '100%', paddingRight: 40 }]}>
                <View style={[styles.sheetIconBox, { backgroundColor: GREEN + '15' }]}>
                  <Ionicons name="filter" size={26} color={GREEN} />
                </View>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>Filter Statistik</Text>
              </View>
            </View>

            {/* Search Input */}
            <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Cari kelas..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </Pressable>
              )}
            </View>

            {/* Grade Pills Scroll */}
            <View style={{ marginBottom: 12 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
                {['Semua', '7', '8', '9', '10', '11', '12'].map((grade) => {
                  const isActive = selectedGradeFilter === grade;
                  return (
                    <Pressable
                      key={grade}
                      onPress={() => { triggerLight(); setSelectedGradeFilter(grade); }}
                      style={[
                        styles.gradePill,
                        { backgroundColor: isActive ? GREEN : colors.surface, borderColor: isActive ? GREEN : colors.border }
                      ]}
                    >
                      <Text style={[styles.gradePillText, { color: isActive ? '#FFF' : colors.textSecondary }]}>
                        {grade === 'Semua' ? 'Semua Jenjang' : `Kelas ${grade}`}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Scrollable list of classes */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }} style={{ flex: 1 }}>
              {/* Option to select "Semua Kelas" / Reset Filter */}
              <Pressable 
                onPress={() => {
                  triggerLight();
                  setSelectedClass(null);
                  setShowFilterModal(false);
                }}
                style={[
                  styles.classFilterItem, 
                  !selectedClass && { backgroundColor: GREEN + '10', borderColor: GREEN + '40' },
                  { borderBottomColor: colors.border }
                ]}
              >
                <View style={[styles.classFilterIcon, { backgroundColor: !selectedClass ? GREEN + '20' : colors.surface }]}>
                  <Ionicons name="grid-outline" size={20} color={!selectedClass ? GREEN : colors.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.classFilterName, { color: !selectedClass ? GREEN : colors.text, fontWeight: !selectedClass ? 'bold' : 'normal' }]}>
                    Semua Kelas
                  </Text>
                  <Text style={[styles.classFilterDesc, { color: colors.textSecondary }]}>Tampilkan gabungan semua kelas aktif</Text>
                </View>
                {!selectedClass && <Ionicons name="checkmark" size={20} color={GREEN} />}
              </Pressable>

              {classesList
                .filter(c => {
                  const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesGrade = selectedGradeFilter === 'Semua' || String(c.grade) === selectedGradeFilter;
                  return matchesSearch && matchesGrade;
                })
                .map((c) => {
                  const isCurrent = selectedClass?.id === c.id;
                  return (
                    <Pressable 
                      key={c.id}
                      onPress={() => {
                        triggerLight();
                        setSelectedClass(c);
                        setShowFilterModal(false);
                      }}
                      style={[
                        styles.classFilterItem, 
                        isCurrent && { backgroundColor: GREEN + '10', borderColor: GREEN + '40' },
                        { borderBottomColor: colors.border }
                      ]}
                    >
                      <View style={[styles.classFilterIcon, { backgroundColor: isCurrent ? GREEN + '20' : colors.surface }]}>
                        <Ionicons name="school-outline" size={20} color={isCurrent ? GREEN : colors.textSecondary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.classFilterName, { color: isCurrent ? GREEN : colors.text, fontWeight: isCurrent ? 'bold' : 'normal' }]}>
                          {c.name}
                        </Text>
                        <Text style={[styles.classFilterDesc, { color: colors.textSecondary }]}>Jenjang {c.grade} • Kode: {c.code}</Text>
                      </View>
                      {isCurrent && <Ionicons name="checkmark" size={20} color={GREEN} />}
                    </Pressable>
                  );
                })}

              {classesList.filter(c => {
                const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesGrade = selectedGradeFilter === 'Semua' || String(c.grade) === selectedGradeFilter;
                return matchesSearch && matchesGrade;
              }).length === 0 && (
                <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                  <Ionicons name="school-outline" size={48} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                  <Text style={{ color: colors.textSecondary, marginTop: 12, fontSize: 14 }}>
                    Tidak ada kelas yang cocok.
                  </Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
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
  activeFilterBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: GREEN, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 4 },
  activeFilterText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 44, borderRadius: 12, borderWidth: 1, marginBottom: 14, marginTop: 4 },
  searchInput: { flex: 1, height: '100%', fontSize: 14, paddingVertical: 0 },
  pillsScroll: { gap: 8, paddingBottom: 4 },
  gradePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  gradePillText: { fontSize: 12, fontWeight: '600' },
  classFilterItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
  classFilterIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  classFilterName: { fontSize: 14, fontWeight: '600' },
  classFilterDesc: { fontSize: 11, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  detailModalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingBottom: 24, width: '100%' },
  sheetHandle: { width: 48, height: 5, borderRadius: 2.5, backgroundColor: '#CBD5E1', alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
  sheetIconBox: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sheetClose: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, marginLeft: 12 },
});

export default TeacherAnalyticsScreen;
