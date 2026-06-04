import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, ActivityIndicator, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { classAPI } from '../../services/api';

const PURPLE = '#7C3AED';

const formatDeadline = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const SubjectModulesScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useTheme();
  const { triggerLight } = useHapticFeedback();
  const insets = useSafeAreaInsets();
  const { classId, className } = route.params || {};
  const sheetBottomPadding = Math.max(24, insets.bottom + 16);

  const [activeTab, setActiveTab] = useState<'materi' | 'tugas' | 'kuis'>('materi');
  const [materials, setMaterials] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [completedQuizIds, setCompletedQuizIds] = useState<Set<string>>(new Set());
  const [isClassArchived, setIsClassArchived] = useState(false);

  const loadData = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const [detailRes, assignRes, quizRes, stored] = await Promise.all([
        classAPI.getClassDetail(classId),
        classAPI.getClassAssignments(classId),
        classAPI.getClassQuizzes(classId),
        AsyncStorage.getItem('@completed_quizzes'),
      ]);
      setIsClassArchived(!!detailRes.data?.archived);
      setMaterials(detailRes.data?.materials || []);
      setAssignments(assignRes.data || []);
      setQuizzes(quizRes.data || []);
      if (stored) setCompletedQuizIds(new Set(JSON.parse(stored)));
    } catch {
      setMaterials([]);
      setAssignments([]);
      setQuizzes([]);
      setIsClassArchived(false);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const tabs = [
    { id: 'materi', label: 'Materi', icon: 'book-outline', count: materials.length },
    { id: 'tugas', label: 'Tugas', icon: 'clipboard-outline', count: assignments.length },
    { id: 'kuis', label: 'Kuis', icon: 'extension-puzzle-outline', count: quizzes.length },
  ];

  const renderEmpty = (label: string) => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open-outline" size={52} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>Belum Ada {label}</Text>
      <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
        {label} akan muncul setelah guru menambahkannya ke kelas ini.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Constants.statusBarHeight }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {className || 'Detail Kelas'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        {tabs.map(tab => (
          <Pressable
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && [styles.tabActive, { borderBottomColor: PURPLE }]]}
            onPress={() => { triggerLight(); setActiveTab(tab.id as any); }}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.id ? PURPLE : colors.textSecondary}
            />
            <Text style={[styles.tabText, { color: activeTab === tab.id ? PURPLE : colors.textSecondary }]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: activeTab === tab.id ? PURPLE : colors.border }]}>
                <Text style={[styles.tabBadgeText, { color: activeTab === tab.id ? '#fff' : colors.textSecondary }]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={PURPLE} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* MATERI */}
          {activeTab === 'materi' && (
            materials.length === 0 ? renderEmpty('Materi') :
            materials.map(m => (
              <Pressable
                key={m.id}
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => { triggerLight(); navigation.navigate('MaterialDetail', { material: m, isClassArchived }); }}
              >
                <View style={[styles.iconBox, { backgroundColor: PURPLE + '15' }]}>
                  <Ionicons name="document-text" size={22} color={PURPLE} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{m.title}</Text>
                  <Text style={[styles.cardSub, { color: colors.textSecondary }]}>{m.type || 'MATERI'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </Pressable>
            ))
          )}

          {/* TUGAS */}
          {activeTab === 'tugas' && (
            assignments.length === 0 ? renderEmpty('Tugas') :
            assignments.map(a => (
              <Pressable
                key={a.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  isClassArchived && { opacity: 0.5 }
                ]}
                onPress={() => {
                  if (isClassArchived) return;
                  triggerLight();
                  setSelectedAssignment({ ...a, className });
                }}
              >
                <View style={[styles.iconBox, { backgroundColor: '#F59E0B' + '15' }]}>
                  <Ionicons name="clipboard" size={22} color="#F59E0B" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{a.title}</Text>
                  <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
                    Deadline: {formatDeadline(a.deadline)} • {a.points || 100} Poin
                  </Text>
                </View>
                {!isClassArchived && <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />}
              </Pressable>
            ))
          )}

          {/* KUIS */}
          {activeTab === 'kuis' && (
            quizzes.length === 0 ? renderEmpty('Kuis') :
            quizzes.map(q => {
              const isDone = completedQuizIds.has(q.id);
              return (
                <Pressable
                  key={q.id}
                  style={[
                    styles.card,
                    { 
                      backgroundColor: isDone ? colors.surface : colors.card, 
                      borderColor: colors.border, 
                      opacity: isClassArchived ? 0.5 : (isDone ? 0.7 : 1) 
                    },
                  ]}
                  onPress={() => {
                    if (isClassArchived) return;
                    triggerLight();
                    setSelectedQuiz({ ...q, className });
                  }}
                >
                  <View style={[styles.iconBox, { backgroundColor: (isDone ? '#10B981' : '#10B981') + '15' }]}>
                    <Ionicons name={isDone ? 'checkmark-done' : 'extension-puzzle'} size={22} color="#10B981" />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{q.title}</Text>
                    <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
                      {q.questionsCount || q._count?.questions || 0} Soal • {q.timeLimit || 15} Menit
                    </Text>
                  </View>
                  {isDone ? (
                    <View style={[styles.doneBadge, { backgroundColor: '#10B981' + '20' }]}>
                      <Text style={[styles.doneBadgeText, { color: '#10B981' }]}>Selesai</Text>
                    </View>
                  ) : (
                    !isClassArchived && <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                  )}
                </Pressable>
              );
            })
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Assignment Detail Modal */}
      <Modal
        visible={!!selectedAssignment}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedAssignment(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedAssignment(null)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.card, paddingBottom: sheetBottomPadding }]} onPress={e => e.stopPropagation()}>
            {selectedAssignment && (
              <AssignmentSheet assignment={selectedAssignment} colors={colors} onClose={() => setSelectedAssignment(null)} />
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Quiz Detail Modal */}
      <Modal
        visible={!!selectedQuiz}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedQuiz(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedQuiz(null)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.card, paddingBottom: sheetBottomPadding }]} onPress={e => e.stopPropagation()}>
            {selectedQuiz && (
              <QuizSheet
                quiz={selectedQuiz}
                isDone={completedQuizIds.has(selectedQuiz.id)}
                colors={colors}
                onClose={() => setSelectedQuiz(null)}
                onStart={() => {
                  setSelectedQuiz(null);
                  navigation.navigate('Quiz', { initialQuiz: selectedQuiz });
                }}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const getDeadlineStatus = (dateStr: string) => {
  if (!dateStr) return { label: '-', color: '#94A3B8', urgent: false };
  const now = new Date();
  const deadline = new Date(dateStr);
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: 'Sudah lewat', color: '#EF4444', urgent: true };
  if (diffDays === 0) return { label: 'Hari ini!', color: '#EF4444', urgent: true };
  if (diffDays <= 3) return { label: `${diffDays} hari lagi`, color: '#F59E0B', urgent: true };
  return { label: `${diffDays} hari lagi`, color: '#10B981', urgent: false };
};

const AssignmentSheet = ({ assignment, colors, onClose }: { assignment: any; colors: any; onClose: () => void }) => {
  const status = getDeadlineStatus(assignment.deadline);
  return (
    <View style={{ width: '100%', flexShrink: 1 }}>
      <View style={styles.sheetHandle} />
      <View style={styles.sheetHeader}>
        <View style={[styles.sheetIconBox, { backgroundColor: (status.urgent ? status.color : PURPLE) + '15' }]}>
          <Ionicons name="clipboard" size={26} color={status.urgent ? status.color : PURPLE} />
        </View>
        <Pressable style={styles.sheetClose} onPress={onClose}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flexShrink: 1 }} contentContainerStyle={{ paddingBottom: 8 }}>
        {assignment.className && (
          <View style={[styles.classBadge, { backgroundColor: PURPLE + '12' }]}>
            <Text style={[styles.classBadgeText, { color: PURPLE }]}>{assignment.className}</Text>
          </View>
        )}

        <Text style={[styles.sheetTitle, { color: colors.text }]}>{assignment.title}</Text>

        <View style={styles.infoGrid}>
          <View style={[styles.infoCard, { backgroundColor: status.color + '12', borderColor: status.color + '30' }]}>
            <Ionicons name="calendar-outline" size={18} color={status.color} />
            <Text style={[styles.infoCardLabel, { color: colors.textSecondary }]}>Sisa Waktu</Text>
            <Text style={[styles.infoCardValue, { color: status.color }]}>{status.label}</Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: PURPLE + '12', borderColor: PURPLE + '30' }]}>
            <Ionicons name="star" size={18} color={PURPLE} />
            <Text style={[styles.infoCardLabel, { color: colors.textSecondary }]}>Poin</Text>
            <Text style={[styles.infoCardValue, { color: PURPLE }]}>{assignment.points || 100}</Text>
          </View>
        </View>

        <View style={[styles.deadlineRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="time-outline" size={15} color={colors.textSecondary} />
          <Text style={[styles.deadlineText, { color: colors.text }]}>{formatDeadline(assignment.deadline)}</Text>
        </View>

        <View style={styles.descSection}>
          <Text style={[styles.descLabel, { color: colors.textSecondary }]}>Instruksi</Text>
          <Text style={[styles.descText, { color: colors.text }]}>
            {assignment.description || 'Kerjakan tugas ini sesuai petunjuk guru. Pastikan mengumpulkan sebelum deadline.'}
          </Text>
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>

      <View style={[styles.sheetFooter, { borderTopColor: colors.border }]}>
        <Pressable style={[styles.closeBtn, { backgroundColor: PURPLE }]} onPress={onClose}>
          <Text style={styles.closeBtnText}>Mengerti</Text>
        </Pressable>
      </View>
    </View>
  );
};

const QuizSheet = ({
  quiz, isDone, colors, onClose, onStart,
}: {
  quiz: any; isDone: boolean; colors: any; onClose: () => void; onStart: () => void;
}) => {
  const { isDarkMode } = useTheme();
  const questionCount = quiz.questionsCount || quiz._count?.questions || quiz.questions?.length || 0;
  const timeLimit = quiz.timeLimit || 15;
  const [details, setDetails] = useState<{ score: number; totalQuestions: number; correctAnswers: number; completedAt?: string } | null>(null);

  useEffect(() => {
    if (isDone) {
      AsyncStorage.getItem('@completed_quiz_details').then(stored => {
        if (stored) {
          const map = JSON.parse(stored);
          if (map[quiz.id]) {
            setDetails(map[quiz.id]);
          }
        }
      });
    }
  }, [quiz.id, isDone]);

  return (
    <View style={{ width: '100%', flexShrink: 1 }}>
      <View style={[styles.sheetHandle, { backgroundColor: isDarkMode ? '#475569' : '#CBD5E1' }]} />
      <View style={styles.sheetHeader}>
        <View style={[styles.sheetIconBox, { backgroundColor: (isDone ? '#10B981' : '#10B981') + '15' }]}>
          <Ionicons name={isDone ? 'checkmark-done' : 'extension-puzzle'} size={26} color="#10B981" />
        </View>
        <Pressable style={styles.sheetClose} onPress={onClose}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flexShrink: 1 }} contentContainerStyle={{ paddingBottom: 8 }}>
        {quiz.className && (
          <View style={[styles.classBadge, { backgroundColor: PURPLE + '12' }]}>
            <Text style={[styles.classBadgeText, { color: PURPLE }]}>{quiz.className}</Text>
          </View>
        )}

        <Text style={[styles.sheetTitle, { color: colors.text }]}>{quiz.title}</Text>

        {isDone ? (
          <View style={styles.completedContainer}>
            <View style={[styles.trophyWrapper, { backgroundColor: '#F59E0B' + '15' }]}>
              <Text style={styles.trophyEmoji}>🏆</Text>
            </View>

            <Text style={[styles.completedHeader, { color: colors.text }]}>Hasil Kuis Kamu</Text>

            {/* Check quiz settings from teacher */}
            {quiz.showResult === false ? (
              <View style={[styles.scoreBadgeContainer, { backgroundColor: colors.surface, borderColor: colors.border, paddingVertical: 20 }]}>
                <Ionicons name="eye-off-outline" size={32} color={colors.textSecondary} style={{ marginBottom: 8 }} />
                <Text style={[styles.doneNoticeText, { color: colors.text, textAlign: 'center', fontWeight: 'bold' }]}>
                  Nilai Disembunyikan
                </Text>
                <Text style={[styles.quizInfoText, { color: colors.textSecondary, textAlign: 'center', marginTop: 4, paddingHorizontal: 12 }]}>
                  Guru menonaktifkan tampilan hasil untuk kuis ini. Hasil pengerjaan kamu sudah tercatat dengan aman.
                </Text>
              </View>
            ) : quiz.autoGrade === false ? (
              <View style={[styles.scoreBadgeContainer, { backgroundColor: colors.surface, borderColor: colors.border, paddingVertical: 20 }]}>
                <Ionicons name="time-outline" size={32} color="#F59E0B" style={{ marginBottom: 8 }} />
                <Text style={[styles.doneNoticeText, { color: colors.text, textAlign: 'center', fontWeight: 'bold' }]}>
                  Menunggu Penilaian
                </Text>
                <Text style={[styles.quizInfoText, { color: colors.textSecondary, textAlign: 'center', marginTop: 4, paddingHorizontal: 12 }]}>
                  Kuis ini memerlukan pemeriksaan manual oleh guru sebelum nilaimu ditampilkan.
                </Text>
              </View>
            ) : (
              <View style={[styles.scoreBadgeContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.scoreRow}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>SKOR AKHIR</Text>
                    <Text style={[styles.scoreValue, { color: '#10B981' }]}>
                      {details ? `${details.score}%` : 'Selesai'}
                    </Text>
                  </View>
                  <View style={[styles.scoreDivider, { backgroundColor: colors.border }]} />
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>BENAR</Text>
                    <Text style={[styles.scoreValue, { color: PURPLE }]}>
                      {details ? `${details.correctAnswers} / ${details.totalQuestions}` : '-'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={[styles.doneNotice, { backgroundColor: '#10B981' + '12', borderColor: '#10B981' + '30', marginTop: 16 }]}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={[styles.doneNoticeText, { color: '#10B981' }]}>
                Kuis ini sudah kamu kerjakan. Hasil telah terkirim dan tercatat di pantauan guru.
              </Text>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.infoGrid}>
              <View style={[styles.infoCard, { backgroundColor: PURPLE + '12', borderColor: PURPLE + '30' }]}>
                <Ionicons name="help-circle-outline" size={18} color={PURPLE} />
                <Text style={[styles.infoCardLabel, { color: colors.textSecondary }]}>Jumlah Soal</Text>
                <Text style={[styles.infoCardValue, { color: PURPLE }]}>{questionCount} Soal</Text>
              </View>
              <View style={[styles.infoCard, { backgroundColor: '#F59E0B' + '12', borderColor: '#F59E0B' + '30' }]}>
                <Ionicons name="time-outline" size={18} color="#F59E0B" />
                <Text style={[styles.infoCardLabel, { color: colors.textSecondary }]}>Batas Waktu</Text>
                <Text style={[styles.infoCardValue, { color: '#F59E0B' }]}>{timeLimit} Menit</Text>
              </View>
            </View>

            <View style={[styles.quizInfoRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="information-circle-outline" size={15} color={colors.textSecondary} />
              <Text style={[styles.quizInfoText, { color: colors.textSecondary }]}>
                Kerjakan dengan jujur. Kuis hanya bisa dikerjakan satu kali.
              </Text>
            </View>
          </>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      <View style={[styles.sheetFooter, { borderTopColor: colors.border }]}>
        {isDone ? (
          <Pressable style={[styles.closeBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]} onPress={onClose}>
            <Text style={[styles.closeBtnText, { color: colors.text }]}>Tutup</Text>
          </Pressable>
        ) : (
          <Pressable style={[styles.closeBtn, { backgroundColor: '#10B981' }]} onPress={onStart}>
            <Ionicons name="play-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.closeBtnText}>Mulai Kuis</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 6, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomWidth: 2 },
  tabText: { fontSize: 13, fontWeight: '600' },
  tabBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10 },
  tabBadgeText: { fontSize: 10, fontWeight: 'bold' },
  scrollContent: { padding: 16 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 10, gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  cardSub: { fontSize: 12 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 10, marginTop: 80 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold' },
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  doneBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  doneBadgeText: { fontSize: 11, fontWeight: 'bold' },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingBottom: 24, maxHeight: '85%', width: '100%', flexShrink: 1 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 14 },
  sheetIconBox: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  sheetClose: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  classBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 10 },
  classBadgeText: { fontSize: 12, fontWeight: 'bold' },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', lineHeight: 26, marginBottom: 14 },
  infoGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  infoCard: { flex: 1, borderRadius: 14, padding: 12, borderWidth: 1, alignItems: 'center', gap: 4 },
  infoCardLabel: { fontSize: 11 },
  infoCardValue: { fontSize: 14, fontWeight: 'bold' },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 14 },
  deadlineText: { fontSize: 13, fontWeight: '600' },
  descSection: { marginBottom: 8 },
  descLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  descText: { fontSize: 14, lineHeight: 21 },
  sheetFooter: { borderTopWidth: 1, paddingTop: 14 },
  closeBtn: { flexDirection: 'row', borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  doneNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 14 },
  doneNoticeText: { fontSize: 13, fontWeight: '600', flex: 1, lineHeight: 19 },
  quizInfoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 14 },
  quizInfoText: { fontSize: 12, flex: 1, lineHeight: 18 },
  completedContainer: { alignItems: 'center', marginVertical: 10, width: '100%' },
  trophyWrapper: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  trophyEmoji: { fontSize: 36 },
  completedHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  scoreBadgeContainer: { width: '100%', borderRadius: 16, borderWidth: 1, padding: 16, alignItems: 'center' },
  scoreRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', alignItems: 'center' },
  scoreLabel: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 4 },
  scoreValue: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  scoreDivider: { width: 1, height: 36 },
});

export default SubjectModulesScreen;
