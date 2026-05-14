import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable, Image,
  ActivityIndicator, Alert, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const PURPLE = '#7C3AED';
const screenWidth = Dimensions.get('window').width;

interface EditProfilePictureModalProps {
  visible: boolean;
  currentAvatar?: string;
  onClose: () => void;
  onImageSelected: (uri: string) => Promise<void>;
  loading?: boolean;
}

export const EditProfilePictureModal: React.FC<EditProfilePictureModalProps> = ({
  visible,
  currentAvatar,
  onClose,
  onImageSelected,
  loading = false,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  const pickImage = async (useCamera: boolean) => {
    try {
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memilih gambar. Silakan coba lagi.');
      console.error('Image picker error:', error);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Pilih gambar terlebih dahulu');
      return;
    }

    setLocalLoading(true);
    try {
      await onImageSelected(selectedImage);
      setSelectedImage(null);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Gagal mengupload gambar. Silakan coba lagi.');
      console.error('Upload error:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = loading || localLoading;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Ubah Foto Profil</Text>
            <Pressable onPress={onClose} disabled={isLoading}>
              <Ionicons name="close" size={24} color="#1E293B" />
            </Pressable>
          </View>

          {/* Preview */}
          {selectedImage || currentAvatar ? (
            <View style={styles.previewSection}>
              <Image
                source={{ uri: selectedImage || currentAvatar }}
                style={styles.previewImage}
              />
              <View style={styles.addButtonContainer}>
                <Pressable
                  style={styles.addButton}
                  onPress={() => setSelectedImage(null)}
                  disabled={isLoading}
                >
                  <Ionicons name="refresh" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.placeholderSection}>
              <Ionicons name="person-circle" size={80} color="#E2E8F0" />
              <Text style={styles.placeholderText}>Belum ada foto profil</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>
            <Pressable
              style={[styles.optionBtn, styles.cameraBtn]}
              onPress={() => pickImage(true)}
              disabled={isLoading}
            >
              <Ionicons name="camera" size={20} color={PURPLE} />
              <Text style={[styles.optionBtnText, { color: PURPLE }]}>
                Ambil Foto
              </Text>
            </Pressable>

            <Pressable
              style={[styles.optionBtn, styles.galleryBtn]}
              onPress={() => pickImage(false)}
              disabled={isLoading}
            >
              <Ionicons name="images" size={20} color={PURPLE} />
              <Text style={[styles.optionBtnText, { color: PURPLE }]}>
                Pilih dari Galeri
              </Text>
            </Pressable>
          </View>

          {/* Upload Button */}
          {selectedImage && (
            <Pressable
              style={[styles.uploadBtn, isLoading && styles.uploadBtnDisabled]}
              onPress={handleUpload}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={18} color="#FFFFFF" />
                  <Text style={styles.uploadBtnText}>Upload Foto</Text>
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
            <Text style={styles.cancelBtnText}>Batal</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    maxHeight: '80%',
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
    color: '#1E293B',
  },

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
  },
  addButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  placeholderSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 30,
  },
  placeholderText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 12,
  },

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
  cameraBtn: {
    borderColor: PURPLE,
    backgroundColor: PURPLE + '08',
  },
  galleryBtn: {
    borderColor: PURPLE,
    backgroundColor: PURPLE + '08',
  },
  optionBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },

  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 10,
    gap: 8,
    shadowColor: PURPLE,
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
    color: '#64748B',
  },
});
