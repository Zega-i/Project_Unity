import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, Pressable, StatusBar, ActivityIndicator,
  Alert, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const GREEN = '#16A34A';

const MOCK_MATERIALS = [
  { id: '1', title: 'Modul Matematika - Aljabar.pdf' },
  { id: '2', title: 'Persamaan Linear Dasar.pdf' },
  { id: '3', title: 'Kumpulan Rumus Geometri.docx' },
];

const TeacherAddAssignmentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerMedium, triggerSuccess } = useHapticFeedback();
  const { classId } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  
  const [assignment, setAssignment] = useState({
    title: '',
    instructions: '',
    selectedMaterialId: '',
    selectedMaterialTitle: '',
    aiCommand: '',
    generatedContent: '',
  });

  const handleGenerateAI = async () => {
    if (!assignment.selectedMaterialId || !assignment.aiCommand) {
      Alert.alert('Data Belum Lengkap', 'Pilih materi dan masukkan instruksi untuk AI.');
      return;
    }

    setGenerating(true);
    triggerMedium();

    try {
      // Simulating AI Processing
      await new Promise(r => setTimeout(r, 3000));
      
      const mockResult = `TUGAS ANALISIS:\n1. Jelaskan konsep utama dari bab yang dipilih.\n2. Berikan contoh implementasi dalam kehidupan sehari-hari.\n3. Buatlah ringkasan singkat mengenai kesimpulan materi tersebut.`;
      
      setAssignment({
        ...assignment,
        generatedContent: mockResult,
      });
      triggerSuccess();
    } catch (error) {
      Alert.alert('Error', 'AI gagal memproses materi.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!assignment.title || (!assignment.instructions && !assignment.generatedContent)) {
      Alert.alert('Gagal', 'Mohon lengkapi judul dan isi tugas.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    triggerSuccess();
    Alert.alert('Berhasil', 'Tugas berhasil dipublikasikan ke kelas!', [
      { text: 'Selesai', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Constants.statusBarHeight }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tambah Tugas Baru</Text>
        <Pressable onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color={GREEN} /> : <Text style={[styles.saveBtn, { color: GREEN }]}>Publikasi</Text>}
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          {/* Step 1: Select Material */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Pilih Sumber Materi</Text>
            <Pressable 
              style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowMaterialModal(true)}
            >
              <View style={styles.selectorLeft}>
                <Ionicons name="document-attach" size={20} color={GREEN} />
                <Text style={[styles.selectorText, { color: assignment.selectedMaterialId ? colors.text : colors.textSecondary }]}>
                  {assignment.selectedMaterialTitle || 'Pilih materi yang sudah di-upload...'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Step 2: AI Command */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Instruksi AI</Text>
            <View style={[
              styles.aiBox, 
              { 
                backgroundColor: colors.card, 
                borderColor: assignment.selectedMaterialId ? GREEN : colors.border,
                opacity: assignment.selectedMaterialId ? 1 : 0.6 
              }
            ]}>
              {assignment.selectedMaterialId ? (
                <View style={[styles.readingBadge, { backgroundColor: GREEN + '15' }]}>
                  <Ionicons name="eye" size={14} color={GREEN} />
                  <Text style={[styles.readingText, { color: GREEN }]}>Membaca: {assignment.selectedMaterialTitle}</Text>
                </View>
              ) : null}
              
              <TextInput
                style={[styles.aiInput, { color: colors.text }]}
                placeholder={assignment.selectedMaterialId ? "Tulis perintah Anda (misal: buatkan 3 soal esai...)" : "Pilih materi terlebih dahulu di langkah 1..."}
                placeholderTextColor={colors.textSecondary}
                multiline
                editable={!!assignment.selectedMaterialId}
                value={assignment.aiCommand}
                onChangeText={(v) => setAssignment({...assignment, aiCommand: v})}
              />
              <Pressable 
                style={[
                  styles.generateBtn, 
                  { backgroundColor: (generating || !assignment.selectedMaterialId) ? colors.border : GREEN }
                ]} 
                onPress={handleGenerateAI}
                disabled={generating || !assignment.selectedMaterialId}
              >
                {generating ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={16} color="#FFF" />
                    <Text style={styles.generateText}>Generate dengan AI</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>

          {/* Step 3: Finalisasi Tugas */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Finalisasi Tugas</Text>
            <View style={[styles.finalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Judul Tugas</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Masukkan judul tugas..."
                placeholderTextColor={colors.textSecondary}
                value={assignment.title}
                onChangeText={(v) => setAssignment({...assignment, title: v})}
              />

              <Text style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}>Deskripsi Tugas</Text>
              <TextInput
                style={[styles.input, { color: colors.text, minHeight: 100, textAlignVertical: 'top' }]}
                placeholder="Tulis instruksi atau deskripsi tugas di sini..."
                placeholderTextColor={colors.textSecondary}
                multiline
                value={assignment.instructions}
                onChangeText={(v) => setAssignment({...assignment, instructions: v})}
              />

              {assignment.generatedContent ? (
                <View style={[styles.resultBox, { backgroundColor: colors.background }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={[styles.resultLabel, { color: GREEN }]}>Referensi Hasil AI</Text>
                    <Pressable 
                      style={styles.copyBtn} 
                      onPress={() => {
                        setAssignment({...assignment, instructions: assignment.generatedContent});
                        triggerSuccess();
                      }}
                    >
                      <Ionicons name="copy-outline" size={14} color={GREEN} />
                      <Text style={{ color: GREEN, fontSize: 11, fontWeight: 'bold' }}>Gunakan Hasil AI</Text>
                    </Pressable>
                  </View>
                  <Text style={[styles.resultText, { color: colors.text }]}>
                    {assignment.generatedContent}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Material Selection Modal */}
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
                  style={[styles.materialItem, { borderColor: colors.border }]}
                  onPress={() => {
                    setAssignment({...assignment, selectedMaterialId: m.id, selectedMaterialTitle: m.title});
                    setShowMaterialModal(false);
                    triggerMedium();
                  }}
                >
                  <Ionicons name="document-text" size={24} color={GREEN} />
                  <Text style={[styles.materialItemText, { color: colors.text }]}>{m.title}</Text>
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
  scroll: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  selector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderWidth: 1 },
  selectorLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  selectorText: { fontSize: 14, fontWeight: '500' },
  aiBox: { padding: 16, borderRadius: 20, borderWidth: 1.5, gap: 12 },
  readingBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  readingText: { fontSize: 11, fontWeight: '700' },
  aiInput: { fontSize: 15, fontWeight: '500', minHeight: 80, textAlignVertical: 'top' },
  generateBtn: { height: 48, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  generateText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  finalCard: { padding: 20, borderRadius: 24, borderWidth: 1 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { fontSize: 16, fontWeight: '700', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginBottom: 8 },
  resultBox: { marginTop: 20, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: GREEN + '20' },
  resultLabel: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: GREEN + '10', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  resultText: { fontSize: 14, lineHeight: 22, fontWeight: '500' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { height: '50%', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  materialItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, gap: 12 },
  materialItemText: { fontSize: 15, fontWeight: '500' },
});

export default TeacherAddAssignmentScreen;
