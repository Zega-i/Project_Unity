import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, Pressable, StatusBar, Switch,
  Alert, ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const GREEN = '#16A34A';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

const MOCK_MATERIALS = [
  { id: '1', title: 'Modul Matematika - Aljabar.pdf' },
  { id: '2', title: 'Persamaan Linear Dasar.pdf' },
  { id: '3', title: 'Kumpulan Rumus Geometri.docx' },
];

const TeacherAddQuizScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerMedium, triggerSuccess } = useHapticFeedback();
  const { classId } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
  });

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
    if (!quizData.selectedMaterialId || !quizData.aiCommand) {
      Alert.alert('Data Belum Lengkap', 'Pilih materi dan masukkan instruksi untuk AI.');
      return;
    }

    setGenerating(true);
    triggerMedium();

    try {
      // Simulating AI Quiz Generation
      await new Promise(r => setTimeout(r, 3500));
      
      const mockQuestions: Question[] = [
        {
          id: 'ai-1',
          text: 'Berdasarkan materi, apa yang dimaksud dengan variabel dalam aljabar?',
          options: ['Angka tetap', 'Lambang pengganti bilangan', 'Hasil perkalian', 'Satuan ukur'],
          correctAnswer: 1
        },
        {
          id: 'ai-2',
          text: 'Selesaikan persamaan: 2x + 5 = 15',
          options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
          correctAnswer: 2
        }
      ];
      
      setQuestions(mockQuestions);
      setQuizData({ ...quizData, title: 'Kuis AI: ' + quizData.selectedMaterialTitle.split('.')[0] });
      triggerSuccess();
      Alert.alert('Berhasil', 'AI telah membuat ' + mockQuestions.length + ' soal kuis untuk Anda!');
    } catch (error) {
      Alert.alert('Error', 'AI gagal membuat soal.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.text || newQuestion.options.some(o => !o)) {
      Alert.alert('Data Belum Lengkap', 'Mohon isi pertanyaan dan semua pilihan jawaban.');
      return;
    }

    if (editingId) {
      // Edit existing
      setQuestions(questions.map(q => q.id === editingId ? { ...newQuestion, id: editingId } : q));
      setEditingId(null);
    } else {
      // Add new
      const q: Question = {
        id: Date.now().toString(),
        ...newQuestion,
      };
      setQuestions([...questions, q]);
    }

    setNewQuestion({ text: '', options: ['', '', '', ''], correctAnswer: 0 });
    setShowAddModal(false);
    triggerSuccess();
  };

  const handleDeleteQuestion = (id: string) => {
    Alert.alert('Hapus Soal', 'Apakah Anda yakin ingin menghapus soal ini?', [
      { text: 'Batal', style: 'cancel' },
      { 
        text: 'Hapus', 
        style: 'destructive',
        onPress: () => {
          setQuestions(questions.filter(q => q.id !== id));
          triggerMedium();
        }
      }
    ]);
  };

  const handleSaveQuiz = async () => {
    if (!quizData.title || questions.length === 0) {
      Alert.alert('Data Belum Lengkap', 'Mohon isi judul kuis dan minimal satu pertanyaan.');
      return;
    }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      triggerSuccess();
      Alert.alert('Berhasil', 'Kuis baru telah dipublikasikan!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan kuis.');
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
        {/* Step 1: Source Material */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Sumber Materi & AI</Text>
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
            
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Durasi (Menit)</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  keyboardType="numeric"
                  value={quizData.duration}
                  onChangeText={(txt) => setQuizData({...quizData, duration: txt})}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Kategori</Text>
                <View style={styles.dummyPicker}>
                  <Text style={{ color: colors.text }}>Matematika</Text>
                  <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                </View>
              </View>
            </View>
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
              {MOCK_MATERIALS.map(m => (
                <Pressable 
                  key={m.id} 
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 }}
                  onPress={() => {
                    setQuizData({...quizData, selectedMaterialId: m.id, selectedMaterialTitle: m.title});
                    setShowMaterialModal(false);
                    triggerMedium();
                  }}
                >
                  <Ionicons name="document-text" size={24} color={GREEN} />
                  <Text style={{ color: colors.text, fontSize: 15, fontWeight: '500' }}>{m.title}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  row: { flexDirection: 'row', marginTop: 8 },
  dummyPicker: { flex: 1, height: 45, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 0 },
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
});

export default TeacherAddQuizScreen;
