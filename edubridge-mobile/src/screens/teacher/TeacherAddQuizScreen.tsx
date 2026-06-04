import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, Pressable, StatusBar, Switch,
  ActivityIndicator, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { aiAPI, teacherAPI } from '../../services/api';
import PremiumModal from '../../components/PremiumModal';

const GREEN = '#16A34A';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}


const TeacherAddQuizScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerMedium, triggerSuccess } = useHapticFeedback();
  const { classId } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState({ visible: false, title: '', message: '' });
  const [generating, setGenerating] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);

  // Dynamic PremiumModal State
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
    title: string;
    message: string;
    icon?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: () => {},
  });
  
  const [quizData, setQuizData] = useState({
    title: '',
    duration: '15',
    shuffle: true,
    showResult: true,
    autoGrade: true,
    selectedMaterialId: '',
    selectedMaterialTitle: '',
    aiCommand: '',
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [aiDraft, setAiDraft] = useState<Question[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
  });

  useEffect(() => {
    const fetchMaterials = async () => {
      if (!classId) return;
      try {
        const res = await teacherAPI.getClassMaterials(classId);
        if (res.success) setMaterials(res.data);
      } catch (error) {
        console.log('Error fetching materials:', error);
      }
    };

    fetchMaterials();
  }, [classId]);

  const handleAddAllDrafts = () => {
    if (aiDraft.length === 0) return;
    const count = aiDraft.length;
    setQuestions([...questions, ...aiDraft]);
    setAiDraft([]);
    triggerSuccess();
    
    setAlertModal({
      visible: true,
      type: 'success',
      title: 'Berhasil',
      message: `${count} soal telah ditambahkan ke kuis.`,
      confirmText: 'Selesai',
      onConfirm: () => setAlertModal(prev => ({ ...prev, visible: false })),
    });
  };

  const handleOpenEdit = (q: Question) => {
    setEditingId(q.id);
    setNewQuestion({
      text: q.text,
      options: [...q.options],
      correctAnswer: q.correctAnswer
    });
    setShowAddModal(true);
  };

  const handleGenerateAI = async () => {
    if (!quizData.selectedMaterialId) {
      setAlertModal({
        visible: true,
        type: 'warning',
        title: 'Materi Belum Dipilih',
        message: 'Pilih materi terlebih dahulu sebagai sumber kuis.',
        confirmText: 'Mengerti',
        onConfirm: () => setAlertModal(prev => ({ ...prev, visible: false })),
      });
      return;
    }
    if (!quizData.aiCommand.trim()) {
      setAlertModal({
        visible: true,
        type: 'warning',
        title: 'Instruksi Kosong',
        message: 'Tulis instruksi untuk AI, contoh: "buatkan 5 soal pilihan ganda".',
        confirmText: 'Mengerti',
        onConfirm: () => setAlertModal(prev => ({ ...prev, visible: false })),
      });
      return;
    }

    setGenerating(true);
    triggerMedium();

    try {
      // Cari angka soal dari instruksi, khusus pola "X soal" atau "soal X"
      const soalMatch = quizData.aiCommand.match(/(\d+)\s*soal|soal\s*(\d+)/i);
      const count = soalMatch
        ? parseInt(soalMatch[1] || soalMatch[2])
        : 5;

      const response = await aiAPI.generateQuiz(quizData.aiCommand, count, quizData.selectedMaterialId);
      
      if (response && response.success && response.data.quiz) {
        const aiQuestions: Question[] = response.data.quiz.map((q: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          text: q.question,
          options: [q.options.a, q.options.b, q.options.c, q.options.d],
          correctAnswer: q.correct_answer === 'a' ? 0 : q.correct_answer === 'b' ? 1 : q.correct_answer === 'c' ? 2 : 3
        }));
        
        setAiDraft(aiQuestions);
        setQuizData({ ...quizData, title: 'Kuis AI: ' + quizData.selectedMaterialTitle.split('.')[0] });
        triggerSuccess();
        
        setAlertModal({
          visible: true,
          type: 'success',
          title: 'AI Berhasil',
          message: `Berhasil membuat ${aiQuestions.length} draf soal.`,
          confirmText: 'Tinjau Soal',
          onConfirm: () => setAlertModal(prev => ({ ...prev, visible: false })),
        });
      }
    } catch (error) {
      console.error('AI Quiz Error:', error);
      setAlertModal({
        visible: true,
        type: 'error',
        title: 'Gagal',
        message: 'Gagal membuat soal dengan AI. Coba lagi nanti.',
        confirmText: 'OK',
        onConfirm: () => setAlertModal(prev => ({ ...prev, visible: false })),
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.text || newQuestion.options.some(o => !o)) {
      setAlertModal({
        visible: true,
        type: 'warning',
        title: 'Data Belum Lengkap',
        message: 'Mohon isi pertanyaan dan semua pilihan jawaban.',
        confirmText: 'Lengkapi',
        onConfirm: () => setAlertModal(prev => ({ ...prev, visible: false })),
      });
      return;
    }

    const isEdit = !!editingId;
    if (editingId) {
      setQuestions(questions.map(q => q.id === editingId ? { ...newQuestion, id: editingId } : q));
      setEditingId(null);
    } else {
      const q: Question = {
        id: Date.now().toString(),
        ...newQuestion,
      };
      setQuestions([...questions, q]);
    }

    setNewQuestion({ text: '', options: ['', '', '', ''], correctAnswer: 0 });
    setShowAddModal(false);
    triggerSuccess();

    setAlertModal({
      visible: true,
      type: 'success',
      title: 'Berhasil',
      message: isEdit ? 'Perubahan soal kuis berhasil disimpan.' : 'Soal kuis baru berhasil ditambahkan.',
      confirmText: 'OK',
      onConfirm: () => setAlertModal(prev => ({ ...prev, visible: false })),
    });
  };

  const handleDeleteQuestion = (id: string) => {
    triggerMedium();
    setAlertModal({
      visible: true,
      type: 'error',
      icon: 'trash-outline',
      title: 'Hapus Soal',
      message: 'Apakah Anda yakin ingin menghapus soal kuis ini?',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      onConfirm: () => {
        setQuestions(prev => prev.filter(q => q.id !== id));
        triggerMedium();
        setAlertModal(prev => ({ ...prev, visible: false }));
      },
      onCancel: () => setAlertModal(prev => ({ ...prev, visible: false })),
    });
  };

  const handleSaveQuiz = async () => {
    if (!quizData.title || questions.length === 0) {
      setAlertModal({
        visible: true,
        type: 'warning',
        title: 'Data Belum Lengkap',
        message: 'Mohon isi judul kuis dan tambahkan minimal satu pertanyaan.',
        confirmText: 'Lengkapi',
        onConfirm: () => setAlertModal(prev => ({ ...prev, visible: false })),
      });
      return;
    }
    setLoading(true);
    try {
      const res = await teacherAPI.addQuiz(classId, {
        title: quizData.title,
        duration: quizData.duration,
        questions: questions,
        shuffle: quizData.shuffle,
        showResult: quizData.showResult,
        autoGrade: quizData.autoGrade,
      });

      if (res.success) {
        triggerSuccess();
        setSuccessModal({
          visible: true,
          title: 'Berhasil',
          message: 'Kuis baru telah dipublikasikan!'
        });
      }
    } catch (error) {
      setAlertModal({
        visible: true,
        type: 'error',
        title: 'Gagal',
        message: 'Gagal menyimpan kuis. Silakan coba lagi.',
        confirmText: 'OK',
        onConfirm: () => setAlertModal(prev => ({ ...prev, visible: false })),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Constants.statusBarHeight }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Buat Kuis Baru</Text>
        <Pressable onPress={handleSaveQuiz} disabled={loading}>
          {loading ? <ActivityIndicator color={GREEN} /> : <Text style={[styles.saveBtn, { color: GREEN }]}>Simpan</Text>}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step 1: Source Material - MADE MORE PROMINENT */}
        <View style={[styles.section, { backgroundColor: GREEN + '05', padding: 15, borderRadius: 24, borderWidth: 1, borderColor: GREEN + '20' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <View style={{ backgroundColor: GREEN, padding: 4, borderRadius: 6 }}>
              <Ionicons name="sparkles" size={16} color="#FFF" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>BUAT SOAL OTOMATIS (AI)</Text>
          </View>
          <Pressable 
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 12 }]}
            onPress={() => setShowMaterialModal(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="document-attach" size={20} color={GREEN} />
              <Text style={{ color: quizData.selectedMaterialId ? colors.text : colors.textSecondary, flex: 1, fontWeight: '600' }}>
                {quizData.selectedMaterialTitle || 'Pilih materi untuk sumber kuis...'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </View>
          </Pressable>

          <View style={[
            styles.card, 
            { 
              backgroundColor: colors.card, 
              borderColor: quizData.selectedMaterialId ? GREEN : colors.border,
              borderStyle: quizData.selectedMaterialId ? 'solid' : 'dashed',
              opacity: quizData.selectedMaterialId ? 1 : 0.6
            }
          ]}>
            {quizData.selectedMaterialId ? (
              <View style={[styles.readingBadge, { backgroundColor: GREEN + '15' }]}>
                <Ionicons name="eye" size={14} color={GREEN} />
                <Text style={[styles.readingText, { color: GREEN }]}>Membaca: {quizData.selectedMaterialTitle}</Text>
              </View>
            ) : null}
            
            <TextInput
              style={{ color: colors.text, fontSize: 14, minHeight: 60, textAlignVertical: 'top', marginTop: quizData.selectedMaterialId ? 8 : 0 }}
              placeholder={quizData.selectedMaterialId ? "Perintah AI (misal: buatkan 5 soal pilihan ganda...)" : "Pilih materi terlebih dahulu..."}
              placeholderTextColor={colors.textSecondary}
              multiline
              editable={!!quizData.selectedMaterialId}
              value={quizData.aiCommand}
              onChangeText={(v) => setQuizData({...quizData, aiCommand: v})}
            />
            <Pressable 
              style={{ 
                backgroundColor: (generating || !quizData.selectedMaterialId) ? colors.border : GREEN, 
                height: 44, 
                borderRadius: 12, 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexDirection: 'row', 
                gap: 8, 
                marginTop: 12 
              }}
              onPress={handleGenerateAI}
              disabled={generating || !quizData.selectedMaterialId}
            >
              {generating ? <ActivityIndicator color="#FFF" /> : (
                <>
                  <Ionicons name="sparkles" size={16} color="#FFF" />
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Generate Soal dengan AI</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        {/* Basic Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Informasi & Pengaturan</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Judul Kuis</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Contoh: Persamaan Linear"
              placeholderTextColor={colors.textSecondary}
              value={quizData.title}
              onChangeText={(txt) => setQuizData({...quizData, title: txt})}
            />
            
            <Text style={[styles.label, { color: colors.textSecondary, marginTop: 8 }]}>Durasi (Menit)</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              keyboardType="numeric"
              placeholder="Contoh: 15"
              placeholderTextColor={colors.textSecondary}
              value={quizData.duration}
              onChangeText={(txt) => setQuizData({...quizData, duration: txt})}
            />
          </View>
        </View>

        {/* Toggles */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Pengaturan</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: 0 }]}>
            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: colors.text }]}>Acak Urutan Soal</Text>
              <Switch value={quizData.shuffle} onValueChange={(v) => setQuizData({...quizData, shuffle: v})} trackColor={{ false: '#CBD5E1', true: GREEN + '40' }} thumbColor={quizData.shuffle ? GREEN : '#94A3B8'} />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: colors.text }]}>Tampilkan Hasil ke Siswa</Text>
              <Switch value={quizData.showResult} onValueChange={(v) => setQuizData({...quizData, showResult: v})} trackColor={{ false: '#CBD5E1', true: GREEN + '40' }} thumbColor={quizData.showResult ? GREEN : '#94A3B8'} />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: colors.text }]}>Beri Nilai Otomatis</Text>
              <Switch value={quizData.autoGrade} onValueChange={(v) => setQuizData({...quizData, autoGrade: v})} trackColor={{ false: '#CBD5E1', true: GREEN + '40' }} thumbColor={quizData.autoGrade ? GREEN : '#94A3B8'} />
            </View>
          </View>
        </View>

        {/* AI Draft Suggestions - AUTO FOCUS AREA */}
        {aiDraft.length > 0 && (
          <View style={[styles.section, { marginTop: 10, padding: 15, backgroundColor: GREEN + '10', borderRadius: 24, borderStyle: 'dashed', borderWidth: 2, borderColor: GREEN }]}>
            <View style={styles.sectionHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionTitle, { color: GREEN, marginBottom: 4 }]}>HASIL GENERATE AI</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Tinjau draf soal di bawah sebelum disimpan</Text>
              </View>
              <Pressable style={[styles.addAllBtn, { backgroundColor: GREEN, paddingHorizontal: 16, height: 40, justifyContent: 'center' }]} onPress={handleAddAllDrafts}>
                <Text style={[styles.addAllText, { fontSize: 14 }]}>Terima Semua</Text>
              </Pressable>
            </View>
            <View style={[styles.draftContainer, { backgroundColor: colors.card, borderColor: GREEN + '40' }]}>
              {aiDraft.map((d, i) => (
                <View key={d.id} style={[styles.draftItem, i < aiDraft.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                  <Text style={[styles.draftText, { color: colors.text }]} numberOfLines={2}>
                    {i + 1}. {d.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Question List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Daftar Soal ({questions.length})</Text>
            <Pressable style={styles.addQBtn} onPress={() => setShowAddModal(true)}>
              <Ionicons name="add-circle" size={20} color={GREEN} />
              <Text style={{ color: GREEN, fontWeight: '700', fontSize: 13 }}>Tambah Soal</Text>
            </Pressable>
          </View>

          {questions.map((q, idx) => (
            <View key={q.id} style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={[styles.qNum, { color: GREEN }]}>Soal {idx + 1}</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Pressable onPress={() => handleOpenEdit(q)}><Ionicons name="create-outline" size={20} color={colors.textSecondary} /></Pressable>
                  <Pressable onPress={() => handleDeleteQuestion(q.id)}><Ionicons name="trash-outline" size={20} color="#EF4444" /></Pressable>
                </View>
              </View>
              <Text style={[styles.qText, { color: colors.text }]}>{q.text}</Text>
              <View style={styles.optionsWrap}>
                {q.options.map((opt, oIdx) => (
                  <View key={oIdx} style={[styles.optItem, q.correctAnswer === oIdx && { backgroundColor: GREEN + '10', borderColor: GREEN }]}>
                    <Text style={[styles.optText, { color: q.correctAnswer === oIdx ? GREEN : colors.textSecondary }]}>{opt}</Text>
                    {q.correctAnswer === oIdx && <Ionicons name="checkmark-circle" size={16} color={GREEN} />}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add Question Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{editingId ? 'Edit Soal' : 'Tambah Soal'}</Text>
              <Pressable onPress={() => { setShowAddModal(false); setEditingId(null); }}><Ionicons name="close" size={24} color={colors.text} /></Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 8 }]}>Pertanyaan</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea, { color: colors.text, borderColor: colors.border }]}
                multiline
                placeholder="Tulis soal kuis di sini..."
                placeholderTextColor={colors.textSecondary}
                value={newQuestion.text}
                onChangeText={(txt) => setNewQuestion({...newQuestion, text: txt})}
              />
              
              <Text style={[styles.label, { color: colors.textSecondary, marginTop: 16, marginBottom: 8 }]}>Pilihan Jawaban (Klik lingkaran untuk jawaban benar)</Text>
              {newQuestion.options.map((opt, idx) => (
                <View key={idx} style={styles.optionInputRow}>
                  <Pressable 
                    onPress={() => setNewQuestion({...newQuestion, correctAnswer: idx})}
                    style={[styles.radio, newQuestion.correctAnswer === idx && { borderColor: GREEN }]}
                  >
                    {newQuestion.correctAnswer === idx && <View style={styles.radioIn} />}
                  </Pressable>
                  <TextInput
                    style={[styles.modalInput, { flex: 1, color: colors.text, borderColor: colors.border }]}
                    placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                    placeholderTextColor={colors.textSecondary}
                    value={opt}
                    onChangeText={(txt) => {
                      const newOpts = [...newQuestion.options];
                      newOpts[idx] = txt;
                      setNewQuestion({...newQuestion, options: newOpts});
                    }}
                  />
                </View>
              ))}
              
              <Pressable style={styles.addConfirmBtn} onPress={handleAddQuestion}>
                <Text style={styles.addConfirmText}>{editingId ? 'Simpan Perubahan' : 'Tambahkan Soal'}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Material Modal */}
      <Modal visible={showMaterialModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Pilih Materi</Text>
              <Pressable onPress={() => setShowMaterialModal(false)}><Ionicons name="close" size={24} color={colors.text} /></Pressable>
            </View>
            <ScrollView>
              {materials.length === 0 ? (
                <Text style={{ textAlign: 'center', marginTop: 20, color: colors.textSecondary }}>Belum ada materi di kelas ini.</Text>
              ) : (
                materials.map(m => (
                  <Pressable
                    key={m.id}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 }}
                    onPress={() => {
                      setQuizData({...quizData, selectedMaterialId: m.id, selectedMaterialTitle: m.title});
                      setShowMaterialModal(false);
                      triggerMedium();
                    }}
                  >
                    <View style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: GREEN + '15', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name={m.type === 'VIDEO' ? 'videocam' : 'document-text'} size={20} color={GREEN} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>{m.title}</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                        {m.type || 'ARTIKEL'} • {m.description ? m.description.substring(0, 50) + '...' : 'Tidak ada deskripsi'}
                      </Text>
                    </View>
                    {quizData.selectedMaterialId === m.id && (
                      <Ionicons name="checkmark-circle" size={22} color={GREEN} />
                    )}
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <PremiumModal
        visible={successModal.visible}
        type="success"
        title={successModal.title}
        message={successModal.message}
        confirmText="Selesai"
        onConfirm={() => {
          setSuccessModal({ ...successModal, visible: false });
          navigation.goBack();
        }}
        minimal
      />

      <PremiumModal
        visible={alertModal.visible}
        type={alertModal.type}
        icon={alertModal.icon}
        title={alertModal.title}
        message={alertModal.message}
        confirmText={alertModal.confirmText}
        cancelText={alertModal.cancelText}
        onConfirm={alertModal.onConfirm}
        onCancel={alertModal.onCancel}
        minimal
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  saveBtn: { fontSize: 16, fontWeight: 'bold' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addQBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  card: { padding: 20, borderRadius: 20, borderWidth: 1 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { fontSize: 16, fontWeight: '700', paddingVertical: 8, marginBottom: 12 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  toggleLabel: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, marginHorizontal: 20 },
  questionCard: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 16 },
  readingBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  readingText: { fontSize: 11, fontWeight: '700' },
  qNum: { fontSize: 12, fontWeight: '800', marginBottom: 8 },
  qText: { fontSize: 15, fontWeight: '600', lineHeight: 22, marginBottom: 16 },
  optionsWrap: { gap: 10 },
  optItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'transparent', backgroundColor: '#F8FAFC' },
  optText: { fontSize: 13, fontWeight: '500' },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { height: '85%', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalInput: { height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, marginBottom: 12 },
  textArea: { height: 100, paddingTop: 14, textAlignVertical: 'top' },
  optionInputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  radioIn: { width: 10, height: 10, borderRadius: 5, backgroundColor: GREEN },
  addConfirmBtn: { backgroundColor: GREEN, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  addConfirmText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  addAllBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addAllText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  draftContainer: { borderRadius: 20, borderWidth: 1, padding: 16, marginTop: 4, marginBottom: 20 },
  draftItem: { paddingVertical: 12 },
  draftText: { fontSize: 13, fontWeight: '500', opacity: 0.8 },
});

export default TeacherAddQuizScreen;
