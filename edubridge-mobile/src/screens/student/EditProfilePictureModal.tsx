import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable, Image,
  ActivityIndicator, Alert, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useTheme } from '../../contexts/ThemeContext';

const PURPLE = '#7C3AED';
const screenWidth = Dimensions.get('window').width;

interface EditProfilePictureModalProps {
  visible: boolean;
  currentAvatar?: string;
  onClose: () => void;
  onImageSelected: (base64: string, fileName: string) => Promise<void>;
  loading?: boolean;
  accentColor?: string;
}

export const EditProfilePictureModal: React.FC<EditProfilePictureModalProps> = ({
  visible,
  currentAvatar,
  onClose,
  onImageSelected,
  loading = false,
  accentColor = PURPLE,
}) => {
  const { colors } = useTheme();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedBase64, setSelectedBase64] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  const pickImage = async (useCamera: boolean) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Izin Diperlukan',
            'Akses kamera ditolak. Silakan aktifkan izin kamera di pengaturan perangkat.',
            [{ text: 'Mengerti' }]
          );
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
          base64: true,
        });
        if (!result.canceled) {
          const asset = result.assets?.[0];
          if (asset) {
            setSelectedImage(asset.uri);
            setSelectedBase64(asset.base64 || null);
          } else if ((result as any).uri) {
            setSelectedImage((result as any).uri);
            setSelectedBase64((result as any).base64 || null);
          }
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Izin Diperlukan',
            'Akses galeri foto ditolak. Silakan aktifkan izin galeri di pengaturan perangkat.',
            [{ text: 'Mengerti' }]
          );
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
          base64: true,
        });
        if (!result.canceled) {
          const asset = result.assets?.[0];
          if (asset) {
            setSelectedImage(asset.uri);
            setSelectedBase64(asset.base64 || null);
          } else if ((result as any).uri) {
            setSelectedImage((result as any).uri);
            setSelectedBase64((result as any).base64 || null);
          }
        }
      }
    } catch (error: any) {
      if (error?.message?.includes('rejected') || error?.message?.includes('cancelled')) return;
      Alert.alert('Gagal', 'Tidak dapat memilih gambar. Silakan coba lagi.');
      console.error('Image picker error:', error);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      Alert.alert('Perhatian', 'Pilih gambar terlebih dahulu');
      return;
    }

    setLocalLoading(true);
    try {
      let base64Data: string | null = selectedBase64;

      // If picker didn't return base64, read from file system
      if (!base64Data) {
        try {
          const cacheDir = FileSystem.cacheDirectory || '';
          const cachedPath = `${cacheDir}avatar_${Date.now()}.jpg`;
          await FileSystem.copyAsync({ from: selectedImage, to: cachedPath });
          base64Data = await FileSystem.readAsStringAsync(cachedPath, {
            encoding: FileSystem.EncodingType.Base64,
          });
          await FileSystem.deleteAsync(cachedPath, { idempotent: true });
        } catch (fsErr) {
          console.log('[FileSystem Cache Error] Falling back to direct read:', fsErr);
          base64Data = await FileSystem.readAsStringAsync(selectedImage, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }
      }

      if (!base64Data) throw new Error('Gagal membaca data gambar dari perangkat');

      await onImageSelected(base64Data, 'avatar.jpg');
      setSelectedImage(null);
      setSelectedBase64(null);
      onClose();
    } catch (error: any) {
      Alert.alert('Gagal', error?.message || 'Gagal mengunggah gambar. Silakan coba lagi.');
      console.error('Upload error:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = loading || localLoading;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Ubah Foto Profil</Text>
            <Pressable onPress={onClose} disabled={isLoading}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          {/* Preview */}
          {selectedImage || currentAvatar ? (
            <View style={styles.previewSection}>
              <Image
                source={{ uri: selectedImage || currentAvatar }}
                style={styles.previewImage}
              />
              {selectedImage && (
                <View style={styles.addButtonContainer}>
                  <Pressable
                    style={[styles.addButton, { backgroundColor: accentColor }]}
                    onPress={() => setSelectedImage(null)}
                    disabled={isLoading}
                  >
                    <Ionicons name="refresh" size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.placeholderSection}>
              <View style={[styles.placeholderCircle, { backgroundColor: accentColor + '14' }]}>
                <Ionicons name="person" size={48} color={accentColor + '80'} />
              </View>
              <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                Belum ada foto profil
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>
            <Pressable
              style={[styles.optionBtn, { borderColor: accentColor, backgroundColor: accentColor + '10' }]}
              onPress={() => pickImage(true)}
              disabled={isLoading}
            >
              <Ionicons name="camera" size={20} color={accentColor} />
              <Text style={[styles.optionBtnText, { color: accentColor }]}>Ambil Foto</Text>
            </Pressable>

            <Pressable
              style={[styles.optionBtn, { borderColor: accentColor, backgroundColor: accentColor + '10' }]}
              onPress={() => pickImage(false)}
              disabled={isLoading}
            >
              <Ionicons name="images" size={20} color={accentColor} />
              <Text style={[styles.optionBtnText, { color: accentColor }]}>Pilih dari Galeri</Text>
            </Pressable>
          </View>

          {/* Upload Button */}
          {selectedImage && (
            <Pressable
              style={[
                styles.uploadBtn,
                { backgroundColor: accentColor, shadowColor: accentColor },
                isLoading && styles.uploadBtnDisabled,
              ]}
              onPress={handleUpload}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={18} color="#FFFFFF" />
                  <Text style={styles.uploadBtnText}>Simpan Foto</Text>
                </>
              )}
            </Pressable>
          )}

          {/* Cancel Button */}
          <Pressable
            style={styles.cancelBtn}
            onPress={onClose}
            disabled={isLoading}
          >
            <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Batal</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Preview
  previewSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  addButtonContainer: {
    position: 'relative',
    alignItems: 'flex-end',
    width: 120,
    marginTop: -30,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  // Placeholder
  placeholderSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  placeholderCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 14,
  },

  // Buttons
  buttonGroup: {
    gap: 10,
    marginBottom: 16,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 10,
  },
  optionBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 10,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadBtnDisabled: {
    opacity: 0.6,
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
