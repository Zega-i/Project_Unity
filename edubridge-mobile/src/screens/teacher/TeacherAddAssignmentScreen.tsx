import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Pressable,
  TextInput, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const GREEN = '#16A34A';

const TeacherAddAssignmentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { colors } = useTheme();
  const { triggerMedium, triggerLight } = useHapticFeedback();
  const { classId } = route.params || {};

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [points, setPoints] = useState('100');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title || !description || !deadline) {
      Alert.alert('Error', 'Mohon lengkapi semua data tugas.');
      return;
    }
    setLoading(true);
    try {
      triggerMedium();
      // TODO: Connect to teacherAPI.addAssignment(classId, { title, description, deadline, points })
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API
      Alert.alert('Sukses', 'Tugas berhasil dipublikasikan!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Gagal membuat tugas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Constants.statusBarHeight }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Buat Tugas Baru</Text>
        <Pressable onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={GREEN} />
          ) : (
            <Text style={[styles.saveBtn, { color: GREEN }]}>Tugaskan</Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Judul Tugas</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Contoh: Latihan Soal Logaritma"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Instruksi Tugas</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Berikan instruksi detail pengerjaan tugas..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Tenggat Waktu</Text>
            <View style={[styles.inputIcon, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.flexInput, { color: colors.text }]}
                placeholder="DD-MM-YYYY"
                placeholderTextColor={colors.textSecondary}
                value={deadline}
                onChangeText={setDeadline}
              />
            </View>
          </View>
          <View style={[styles.inputGroup, { flex: 0.5, marginLeft: 12 }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Poin Maks</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder="100"
              keyboardType="numeric"
              value={points}
              onChangeText={setPoints}
            />
          </View>
        </View>

        <Pressable style={[styles.attachBtn, { borderColor: GREEN }]}>
          <Ionicons name="attach-outline" size={24} color={GREEN} />
          <Text style={[styles.attachText, { color: GREEN }]}>Lampirkan File Pendukung</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  saveBtn: { fontSize: 16, fontWeight: 'bold' },
  content: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 15 },
  inputIcon: { flexDirection: 'row', alignItems: 'center', height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16 },
  flexInput: { flex: 1, marginLeft: 8, fontSize: 15 },
  textArea: { height: 150, borderRadius: 12, borderWidth: 1, padding: 16, fontSize: 15 },
  row: { flexDirection: 'row' },
  attachBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', marginTop: 10, gap: 10 },
  attachText: { fontSize: 14, fontWeight: 'bold' },
});

export default TeacherAddAssignmentScreen;
