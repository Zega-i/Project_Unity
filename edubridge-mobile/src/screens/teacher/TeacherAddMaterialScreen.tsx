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
import { teacherAPI } from '../../services/api';

const GREEN = '#16A34A';

const TeacherAddMaterialScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { colors } = useTheme();
  const { triggerMedium, triggerLight } = useHapticFeedback();
  const { classId } = route.params || {};

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Mohon isi judul dan deskripsi materi.');
      return;
    }
    setLoading(true);
    try {
      triggerMedium();
      await teacherAPI.addMaterial(classId, { title, description });
      Alert.alert('Sukses', 'Materi berhasil ditambahkan!');
      navigation.goBack();
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Gagal menambahkan materi.';
      Alert.alert('Error', msg);
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tambah Materi</Text>
        <Pressable onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={GREEN} />
          ) : (
            <Text style={[styles.saveBtn, { color: GREEN }]}>Simpan</Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Judul Materi</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Contoh: Pengenalan Aljabar"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Deskripsi / Isi Materi</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Tuliskan penjelasan materi atau instruksi di sini..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <Pressable style={[styles.attachBtn, { borderColor: GREEN }]}>
          <Ionicons name="cloud-upload-outline" size={24} color={GREEN} />
          <Text style={[styles.attachText, { color: GREEN }]}>Unggah File (PDF, Video, Gambar)</Text>
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
  textArea: { height: 200, borderRadius: 12, borderWidth: 1, padding: 16, fontSize: 15 },
  attachBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', marginTop: 10, gap: 10 },
  attachText: { fontSize: 14, fontWeight: 'bold' },
});

export default TeacherAddMaterialScreen;
