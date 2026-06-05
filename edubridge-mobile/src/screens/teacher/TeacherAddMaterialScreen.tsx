import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Pressable,
  TextInput, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import api, { teacherAPI } from '../../services/api';
import PremiumModal from '../../components/PremiumModal';

const GREEN = '#16A34A';

const TeacherAddMaterialScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { colors } = useTheme();
  const { triggerMedium, triggerLight } = useHapticFeedback();
  const { classId } = route.params || {};

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; uri: string; type: string; base64?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState({ visible: false, title: '', message: '' });

  const handlePickFile = async () => {
    triggerLight();
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'video/*', 'image/*', 'text/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileSizeMB = asset.size ? asset.size / (1024 * 1024) : 0;
        if (fileSizeMB > 2) {
          Alert.alert(
            'File Terlalu Besar',
            'Ukuran file melebihi batas maksimal 2MB. Silakan pilih file yang lebih kecil.'
          );
          return;
        }
        setSelectedFile({
          name: asset.name,
          uri: asset.uri,
          type: asset.mimeType || 'application/pdf',
        });
        triggerMedium();
      }
    } catch (err: any) {
      try {
        await api.post('/upload/log', {
          message: `DocumentPicker error`,
          error: {
            message: err?.message,
            stack: err?.stack,
            ...err
          }
        });
      } catch {}
      Alert.alert('Error', 'Gagal memilih file.');
    }
  };

  const getMaterialType = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('video')) return 'VIDEO';
    if (mimeType.includes('image')) return 'INTERACTIVE';
    return 'ARTICLE';
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Mohon isi judul materi.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Mohon isi deskripsi materi.');
      return;
    }
    if (!selectedFile) {
      Alert.alert('File Belum Dipilih', 'Mohon unggah file materi terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      triggerMedium();
      
      let fileBase64: string | undefined;
      try {
        const decodedUri = decodeURIComponent(selectedFile.uri);
        const tempUri = `${FileSystem.cacheDirectory}temp_upload_${Date.now()}_${selectedFile.name.replace(/\s+/g, '_')}`;
        
        try {
          await FileSystem.copyAsync({
            from: decodedUri,
            to: tempUri
          });
          fileBase64 = await FileSystem.readAsStringAsync(tempUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          await FileSystem.deleteAsync(tempUri, { idempotent: true });
        } catch (copyErr: any) {
          console.log("[FileSystem Copy Error] Copy failed, attempting direct read:", copyErr);
          fileBase64 = await FileSystem.readAsStringAsync(decodedUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }
      } catch (error: any) {
        console.log("[FileSystem Error] Gagal membaca file as base64:", error);
      }

      if (!fileBase64) {
        throw new Error('Gagal membaca data file.');
      }

      const materialType = getMaterialType(selectedFile.type);
      await teacherAPI.addMaterial(classId, {
        title,
        description,
        fileUrl: selectedFile.uri,
        type: materialType,
        fileBase64,
        fileName: selectedFile.name,
      });
      setSuccessModal({
        visible: true,
        title: 'Sukses',
        message: 'Materi berhasil ditambahkan!'
      });
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

        <Pressable
          style={[
            styles.attachBtn,
            { borderColor: selectedFile ? GREEN : colors.border },
            selectedFile && { backgroundColor: GREEN + '10' },
          ]}
          onPress={handlePickFile}
        >
          <Ionicons
            name={selectedFile ? 'checkmark-circle' : 'cloud-upload-outline'}
            size={24}
            color={selectedFile ? GREEN : colors.textSecondary}
          />
          <Text style={[styles.attachText, { color: selectedFile ? GREEN : colors.textSecondary }]}>
            {selectedFile ? selectedFile.name : 'Unggah File (PDF, Video, Gambar) *'}
          </Text>
        </Pressable>

        {!selectedFile && (
          <Text style={[styles.requiredNote, { color: '#EF4444' }]}>
            * File wajib diunggah sebelum menyimpan materi
          </Text>
        )}
      </ScrollView>

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
      />
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
  attachText: { fontSize: 14, fontWeight: 'bold', flex: 1 },
  requiredNote: { fontSize: 12, marginTop: 8, textAlign: 'center' },
});

export default TeacherAddMaterialScreen;
