import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Pressable,
  ScrollView, Dimensions, ActivityIndicator,
  Modal, Share, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

import { teacherAPI } from '../../services/api';
import PremiumModal from '../../components/PremiumModal';

const GREEN = '#16A34A';

const TeacherClassDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useTheme();
  const { triggerLight, triggerMedium } = useHapticFeedback();
  const { class: classData } = route.params || {};
  const [activeTab, setActiveTab] = useState('Materials');
  const [materials, setMaterials] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Detail Modal States
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClassContent();
    setRefreshing(false);
  };

  // PremiumModal States
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'material' | 'quiz' | 'assignment'; title: string } | null>(null);
  
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState('');
  const [successModalMessage, setSuccessModalMessage] = useState('');

  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');

  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalMessage, setInfoModalMessage] = useState('');

  const fetchClassContent = async () => {
    if (!classData?.id) return;
    setLoading(true);
    try {
      if (activeTab === 'Materials') {
        const res = await teacherAPI.getClassMaterials(classData.id);
        if (res.success) setMaterials(res.data);
      } else if (activeTab === 'Assignments') {
        const res = await teacherAPI.getClassAssignments(classData.id);
        if (res.success) setAssignments(res.data);
      } else if (activeTab === 'Quizzes') {
        const res = await teacherAPI.getClassQuizzes(classData.id);
        if (res.success) setQuizzes(res.data);
      }
    } catch (error) {
      console.log('Error fetching class content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassContent();
  }, [classData?.id, activeTab]);

  const handleDelete = (id: string, type: 'material' | 'quiz' | 'assignment') => {
    triggerMedium();
    let titleText = '';
    if (type === 'material') {
      titleText = materials.find(m => m.id === id)?.title || 'Materi';
    } else if (type === 'assignment') {
      titleText = assignments.find(a => a.id === id)?.title || 'Tugas';
    } else if (type === 'quiz') {
      titleText = quizzes.find(q => q.id === id)?.title || 'Kuis';
    }

    setDeleteTarget({ id, type, title: titleText });
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, type, title } = deleteTarget;
    setDeleteModalVisible(false);
    triggerMedium();
    
    let typeNameIndo = 'materi';
    if (type === 'assignment') typeNameIndo = 'tugas';
    if (type === 'quiz') typeNameIndo = 'kuis';

    try {
      if (type === 'material') {
        await teacherAPI.deleteMaterial(id);
      } else if (type === 'quiz') {
        await teacherAPI.deleteQuiz(id);
      } else if (type === 'assignment') {
        await teacherAPI.deleteAssignment(id);
      }
      
      setSuccessModalTitle('Berhasil Dihapus');
      setSuccessModalMessage(`${typeNameIndo.charAt(0).toUpperCase() + typeNameIndo.slice(1)} "${title}" berhasil dihapus.`);
      setSuccessModalVisible(true);
      fetchClassContent();
    } catch (error) {
      setErrorModalMessage(`Gagal menghapus ${typeNameIndo} "${title}". Silakan coba lagi.`);
      setErrorModalVisible(true);
    }
  };

  const tabs = [
    { id: 'Materials', icon: 'book', label: 'Materi' },
    { id: 'Assignments', icon: 'clipboard', label: 'Tugas' },
    { id: 'Quizzes', icon: 'extension-puzzle', label: 'Kuis' },
    { id: 'Discussions', icon: 'chatbubbles', label: 'Diskusi' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Constants.statusBarHeight }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{classData?.name || 'Detail Kelas'}</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Token: {classData?.code || '------'}</Text>
        </View>
        <Pressable onPress={() => { triggerLight(); setShowSettings(true); }}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        {tabs.map(tab => (
          <Pressable 
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => { triggerLight(); setActiveTab(tab.id); }}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.id ? GREEN : colors.textSecondary} 
            />
            <Text style={[styles.tabText, { color: activeTab === tab.id ? GREEN : colors.textSecondary }]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GREEN]} />
        }
      >
        {activeTab === 'Materials' && (
          <View style={styles.listSection}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Modul Pembelajaran</Text>
            {loading ? (
              <ActivityIndicator color={GREEN} style={{ marginTop: 20 }} />
            ) : materials.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 20, color: colors.textSecondary }}>Belum ada materi.</Text>
            ) : materials.map(m => (
              <TouchableOpacity
                activeOpacity={0.75}
                key={m.id}
                style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => { triggerLight(); setSelectedMaterial(m); }}
              >
                <View style={[styles.itemIconBox, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="document-text" size={24} color="#EF4444" />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{m.title}</Text>
                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>{m.type || 'PDF'} • {m.size || 'Materi'}</Text>
                </View>
                <Pressable
                  onPress={(e) => { e.stopPropagation(); handleDelete(m.id, 'material'); }}
                  style={{ padding: 6 }}
                >
                  <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
                </Pressable>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'Assignments' && (
          <View style={styles.listSection}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Tugas Kelas</Text>
            {loading ? (
              <ActivityIndicator color={GREEN} style={{ marginTop: 20 }} />
            ) : assignments.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 20, color: colors.textSecondary }}>Belum ada tugas.</Text>
            ) : assignments.map(t => (
              <TouchableOpacity
                activeOpacity={0.75}
                key={t.id}
                style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => { triggerLight(); setSelectedAssignment(t); }}
              >
                <View style={[styles.itemIconBox, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="clipboard" size={24} color={GREEN} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{t.title}</Text>
                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>Tenggat: {t.deadline ? new Date(t.deadline).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{t.points || 100} Pts</Text>
                  </View>
                  <Pressable
                    onPress={(e) => { e.stopPropagation(); handleDelete(t.id, 'assignment'); }}
                    style={{ padding: 6 }}
                  >
                    <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
                  </Pressable>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'Quizzes' && (
          <View style={styles.listSection}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Kuis Baru</Text>
            {loading ? (
              <ActivityIndicator color={GREEN} style={{ marginTop: 20 }} />
            ) : quizzes.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 20, color: colors.textSecondary }}>Belum ada kuis.</Text>
            ) : quizzes.map(q => (
              <TouchableOpacity
                activeOpacity={0.75}
                key={q.id}
                style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => { triggerLight(); setSelectedQuiz(q); }}
              >
                <View style={[styles.itemIconBox, { backgroundColor: '#E0E7FF' }]}>
                  <Ionicons name="extension-puzzle" size={24} color="#4F46E5" />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{q.title}</Text>
                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>{q.questions?.length ?? q._count?.questions ?? q.questionsCount ?? 0} Soal • {q.timeLimit || 0} Min</Text>
                </View>
                <Pressable
                  onPress={(e) => { e.stopPropagation(); handleDelete(q.id, 'quiz'); }}
                  style={{ padding: 6 }}
                >
                  <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
                </Pressable>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Settings Popup */}
      <Modal visible={showSettings} transparent animationType="fade">
        <TouchableOpacity
          style={styles.settingsOverlay}
          activeOpacity={1}
          onPress={() => setShowSettings(false)}
        >
          <TouchableOpacity activeOpacity={1} style={[styles.settingsCard, { backgroundColor: colors.card }]}>
            {/* Header */}
            <View style={styles.settingsHeader}>
              <Text style={[styles.settingsTitle, { color: colors.text }]} numberOfLines={1}>
                {classData?.name}
              </Text>
              <Pressable onPress={() => setShowSettings(false)}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={[styles.settingsDivider, { backgroundColor: colors.border }]} />

            {/* Token row */}
            <View style={styles.settingsRow}>
              <View style={[styles.settingsIconBox, { backgroundColor: GREEN + '15' }]}>
                <Ionicons name="key-outline" size={18} color={GREEN} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingsLabel, { color: colors.textSecondary }]}>Token Kelas</Text>
                <Text style={[styles.settingsValue, { color: colors.text }]}>{classData?.code || '-'}</Text>
              </View>
              <Pressable
                style={[styles.copyBtn, { backgroundColor: GREEN + '15' }]}
                onPress={async () => {
                  triggerMedium();
                  await Share.share({ message: `Token kelas ${classData?.name}: ${classData?.code}` });
                }}
              >
                <Ionicons name="share-outline" size={16} color={GREEN} />
                <Text style={[styles.copyText, { color: GREEN }]}>Bagikan</Text>
              </Pressable>
            </View>

            {/* Grade row */}
            <View style={styles.settingsRow}>
              <View style={[styles.settingsIconBox, { backgroundColor: '#6366F1' + '15' }]}>
                <Ionicons name="school-outline" size={18} color="#6366F1" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingsLabel, { color: colors.textSecondary }]}>Tingkat Kelas</Text>
                <Text style={[styles.settingsValue, { color: colors.text }]}>Kelas {classData?.grade || '-'}</Text>
              </View>
            </View>

            {/* Students row */}
            <View style={styles.settingsRow}>
              <View style={[styles.settingsIconBox, { backgroundColor: '#F59E0B' + '15' }]}>
                <Ionicons name="people-outline" size={18} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingsLabel, { color: colors.textSecondary }]}>Jumlah Siswa</Text>
                <Text style={[styles.settingsValue, { color: colors.text }]}>{classData?._count?.students ?? 0} Siswa</Text>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {!classData?.archived && (
        <Pressable
          style={styles.fab}
          onPress={() => {
            triggerMedium();
            if (activeTab === 'Materials') {
              navigation.navigate('TeacherAddMaterial', { classId: classData?.id });
            } else if (activeTab === 'Assignments') {
              navigation.navigate('TeacherAddAssignment', { classId: classData?.id });
            } else if (activeTab === 'Quizzes') {
              navigation.navigate('TeacherAddQuiz', { classId: classData?.id });
            } else {
              setInfoModalMessage('Fitur diskusi segera hadir!');
              setInfoModalVisible(true);
            }
          }}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </Pressable>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <PremiumModal
          visible={deleteModalVisible}
          type="error"
          icon="trash-outline"
          title={`Hapus ${deleteTarget.type === 'material' ? 'Materi' : deleteTarget.type === 'assignment' ? 'Tugas' : 'Kuis'}`}
          message={`Apakah Anda yakin ingin menghapus ${deleteTarget.type === 'material' ? 'materi' : deleteTarget.type === 'assignment' ? 'tugas' : 'kuis'} "${deleteTarget.title}" secara permanen?`}
          confirmText="Hapus"
          cancelText="Batal"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModalVisible(false)}
          minimal
        />
      )}

      {/* Success Modal */}
      <PremiumModal
        visible={successModalVisible}
        type="success"
        title={successModalTitle}
        message={successModalMessage}
        confirmText="Selesai"
        onConfirm={() => setSuccessModalVisible(false)}
        minimal
      />

      {/* Error Modal */}
      <PremiumModal
        visible={errorModalVisible}
        type="error"
        title="Gagal"
        message={errorModalMessage}
        confirmText="OK"
        onConfirm={() => setErrorModalVisible(false)}
        minimal
      />

      {/* Info Modal */}
      <PremiumModal
        visible={infoModalVisible}
        type="info"
        title="Informasi"
        message={infoModalMessage}
        confirmText="OK"
        onConfirm={() => setInfoModalVisible(false)}
        minimal
      />

      {/* Material Detail Modal */}
      <Modal
        visible={!!selectedMaterial}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedMaterial(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedMaterial(null)} />
          <View style={[styles.detailModalSheet, { backgroundColor: colors.card }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View style={[styles.sheetIconBox, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="document-text" size={28} color="#EF4444" />
              </View>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>Detail Materi</Text>
              <Pressable style={styles.sheetClose} onPress={() => setSelectedMaterial(null)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              <Text style={[styles.detailTitle, { color: colors.text }]}>{selectedMaterial?.title}</Text>
              <Text style={[styles.detailMeta, { color: colors.textSecondary }]}>Tipe: {selectedMaterial?.type || 'PDF'}</Text>
              
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              <Text style={[styles.sectionTitleLabel, { color: colors.textSecondary }]}>Deskripsi / Konten</Text>
              <Text style={[styles.detailContentText, { color: colors.text }]}>
                {selectedMaterial?.description || selectedMaterial?.content || 'Tidak ada deskripsi.'}
              </Text>

              {selectedMaterial?.extractedText && (
                <>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <Text style={[styles.sectionTitleLabel, { color: colors.textSecondary }]}>Teks Ekstraksi PDF</Text>
                  <Text style={[styles.detailContentText, { color: colors.text, fontSize: 13 }]}>
                    {selectedMaterial.extractedText}
                  </Text>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Assignment Detail Modal */}
      <Modal
        visible={!!selectedAssignment}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedAssignment(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedAssignment(null)} />
          <View style={[styles.detailModalSheet, { backgroundColor: colors.card }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View style={[styles.sheetIconBox, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="clipboard" size={28} color={GREEN} />
              </View>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>Detail Tugas</Text>
              <Pressable style={styles.sheetClose} onPress={() => setSelectedAssignment(null)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              <Text style={[styles.detailTitle, { color: colors.text }]}>{selectedAssignment?.title}</Text>
              
              <View style={styles.infoRowGrid}>
                <View style={[styles.infoGridCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="calendar" size={16} color={GREEN} />
                  <Text style={[styles.infoCardLbl, { color: colors.textSecondary }]}>Tenggat</Text>
                  <Text style={[styles.infoCardVal, { color: colors.text, fontSize: 13 }]}>
                    {selectedAssignment?.deadline ? new Date(selectedAssignment.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </Text>
                </View>
                <View style={[styles.infoGridCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={[styles.infoCardLbl, { color: colors.textSecondary }]}>Poin Maksimal</Text>
                  <Text style={[styles.infoCardVal, { color: colors.text }]}>{selectedAssignment?.points || 100} Pts</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              <Text style={[styles.sectionTitleLabel, { color: colors.textSecondary }]}>Instruksi Tugas</Text>
              <Text style={[styles.detailContentText, { color: colors.text }]}>
                {selectedAssignment?.description || 'Tidak ada deskripsi instruksi.'}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Quiz Detail Modal */}
      <Modal
        visible={!!selectedQuiz}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedQuiz(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedQuiz(null)} />
          <View style={[styles.detailModalSheet, { backgroundColor: colors.card, height: '80%' }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View style={[styles.sheetIconBox, { backgroundColor: '#E0E7FF' }]}>
                <Ionicons name="extension-puzzle" size={28} color="#4F46E5" />
              </View>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>Detail Kuis</Text>
              <Pressable style={styles.sheetClose} onPress={() => setSelectedQuiz(null)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Text style={[styles.detailTitle, { color: colors.text }]}>{selectedQuiz?.title}</Text>
            
            <View style={styles.infoRowGrid}>
              <View style={[styles.infoGridCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="time" size={16} color="#4F46E5" />
                <Text style={[styles.infoCardLbl, { color: colors.textSecondary }]}>Durasi Kuis</Text>
                <Text style={[styles.infoCardVal, { color: colors.text }]}>{selectedQuiz?.timeLimit || 0} Menit</Text>
              </View>
              <View style={[styles.infoGridCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="list" size={16} color="#10B981" />
                <Text style={[styles.infoCardLbl, { color: colors.textSecondary }]}>Jumlah Soal</Text>
                <Text style={[styles.infoCardVal, { color: colors.text }]}>{selectedQuiz?.questions?.length || selectedQuiz?.questionsCount || 0} Soal</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <Text style={[styles.sectionTitleLabel, { color: colors.textSecondary, marginBottom: 12 }]}>Daftar Soal</Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }} style={{ flex: 1 }}>
              {selectedQuiz?.questions && selectedQuiz.questions.length > 0 ? (
                selectedQuiz.questions.map((q: any, idx: number) => {
                  let options: string[] = [];
                  try {
                    options = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []);
                  } catch { options = []; }
                  return (
                    <View key={q.id || idx} style={[styles.qCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Text style={[styles.qNumber, { color: colors.textSecondary }]}>Soal {idx + 1}</Text>
                      <Text style={[styles.qText, { color: colors.text }]}>{q.text}</Text>
                      
                      <View style={styles.optionsList}>
                        {options.map((opt: string, optIdx: number) => {
                          const isCorrect = opt === q.correctAnswer;
                          return (
                            <View key={optIdx} style={[styles.optRow, { borderColor: isCorrect ? GREEN + '40' : colors.border, backgroundColor: isCorrect ? GREEN + '10' : colors.card }]}>
                              <Text style={[styles.optIndex, { color: isCorrect ? GREEN : colors.textSecondary, fontWeight: isCorrect ? 'bold' : 'normal' }]}>
                                {String.fromCharCode(65 + optIdx)}.
                              </Text>
                              <Text style={[styles.optText, { color: colors.text, fontWeight: isCorrect ? 'bold' : 'normal' }]}>
                                {opt}
                              </Text>
                              {isCorrect && <Ionicons name="checkmark-circle" size={16} color={GREEN} />}
                            </View>
                          );
                        })}
                      </View>

                      {q.explanation && (
                        <Text style={[styles.qExplanation, { color: colors.textSecondary }]}>
                          Penjelasan: {q.explanation}
                        </Text>
                      )}
                    </View>
                  );
                })
              ) : (
                <Text style={{ color: colors.textSecondary, textAlign: 'center', marginVertical: 20 }}>Tidak ada daftar soal yang termuat.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  backBtn: { padding: 4 },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  headerSub: { fontSize: 12 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, gap: 4 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: GREEN },
  tabText: { fontSize: 12, fontWeight: '600' },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  listSection: { marginBottom: 24 },
  sectionLabel: { fontSize: 13, fontWeight: '800', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  itemCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12, gap: 14 },
  itemIconBox: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  itemSub: { fontSize: 12 },
  countBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  countText: { fontSize: 12, fontWeight: '800', color: GREEN },
  deleteBtn: { padding: 4 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  settingsOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'flex-end', justifyContent: 'flex-start', paddingTop: 90, paddingRight: 16 },
  settingsCard: { width: 260, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  settingsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  settingsTitle: { fontSize: 15, fontWeight: 'bold', flex: 1, marginRight: 8 },
  settingsDivider: { height: 1, marginBottom: 12 },
  settingsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  settingsIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingsLabel: { fontSize: 11, marginBottom: 2 },
  settingsValue: { fontSize: 14, fontWeight: '600' },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  copyText: { fontSize: 12, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  detailModalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingBottom: 24, maxHeight: '85%', width: '100%', flexShrink: 1 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
  sheetIconBox: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sheetClose: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, marginLeft: 12 },
  detailTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  detailMeta: { fontSize: 13, marginBottom: 16 },
  divider: { height: 1, marginVertical: 16 },
  sectionTitleLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  detailContentText: { fontSize: 14, lineHeight: 22 },
  infoRowGrid: { flexDirection: 'row', gap: 10, marginTop: 8 },
  infoGridCard: { flex: 1, borderRadius: 14, padding: 12, borderWidth: 1, alignItems: 'center', gap: 4 },
  infoCardLbl: { fontSize: 11, fontWeight: '500' },
  infoCardVal: { fontSize: 14, fontWeight: 'bold' },
  qCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  qNumber: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  qText: { fontSize: 14, fontWeight: '600', lineHeight: 20, marginBottom: 12 },
  optionsList: { gap: 8 },
  optRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, gap: 8 },
  optIndex: { fontSize: 13 },
  optText: { fontSize: 13, flex: 1 },
  qExplanation: { fontSize: 12, fontStyle: 'italic', marginTop: 12 },
});

export default TeacherClassDetailScreen;
