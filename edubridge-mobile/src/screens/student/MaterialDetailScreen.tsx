import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  Pressable, StatusBar, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { progressAPI } from '../../services/api';

const PURPLE = '#7C3AED';

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  PDF:         { icon: 'document-text',  color: '#EF4444', label: 'PDF' },
  VIDEO:       { icon: 'videocam',        color: '#3B82F6', label: 'Video' },
  ARTICLE:     { icon: 'newspaper',       color: '#10B981', label: 'Artikel' },
  INTERACTIVE: { icon: 'layers',          color: '#F59E0B', label: 'Interaktif' },
  EXERCISE:    { icon: 'fitness',         color: '#8B5CF6', label: 'Latihan' },
};

const MaterialDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerMedium } = useHapticFeedback();
  const { material, isClassArchived } = route.params || {};

  const [marking, setMarking] = useState(false);
  const [marked, setMarked] = useState(false);
  const [loadingCompletion, setLoadingCompletion] = useState(true);

  useEffect(() => {
    const checkCompletion = async () => {
      try {
        const res = await progressAPI.getCompletedMaterials();
        if (res.success && Array.isArray(res.data)) {
          setMarked(res.data.includes(material?.id));
        }
      } catch (err) {
        console.log('Error checking completion:', err);
      } finally {
        setLoadingCompletion(false);
      }
    };
    if (material?.id) {
      checkCompletion();
    }
  }, [material?.id]);

  const isValidUrl = (str: string) => str?.startsWith('http://') || str?.startsWith('https://');

  const handleDownload = async () => {
    if (!material?.url || !isValidUrl(material.url)) {
      Alert.alert('Tidak Tersedia', 'File tidak dapat diunduh saat ini.');
      return;
    }
    try {
      await Linking.openURL(material.url);
    } catch {
      Alert.alert('Gagal', 'Tidak dapat membuka file. Pastikan kamu terhubung ke internet.');
    }
  };

  const typeConfig = TYPE_CONFIG[material?.type] || TYPE_CONFIG.ARTICLE;
  const displayContent = material?.description || material?.content || '';

  const handleMarkComplete = async () => {
    if (marked) return;
    setMarking(true);
    triggerMedium();
    try {
      await progressAPI.markAsCompleted(material.id);
      setMarked(true);
    } catch {
      Alert.alert('Info', 'Tidak dapat menyimpan progres. Pastikan kamu terhubung ke internet.');
    } finally {
      setMarking(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Constants.statusBarHeight }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {material?.title || 'Detail Materi'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Type Badge */}
        <View style={[styles.typeBadge, { backgroundColor: typeConfig.color + '15' }]}>
          <Ionicons name={typeConfig.icon as any} size={14} color={typeConfig.color} />
          <Text style={[styles.typeBadgeText, { color: typeConfig.color }]}>{typeConfig.label}</Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>{material?.title}</Text>

        {/* Class tag */}
        {material?.className && (
          <View style={[styles.classTag, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="school-outline" size={13} color={colors.textSecondary} />
            <Text style={[styles.classTagText, { color: colors.textSecondary }]}>{material.className}</Text>
          </View>
        )}

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Content */}
        <View style={[styles.contentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.contentHeader}>
            <Ionicons name="book-outline" size={18} color={PURPLE} />
            <Text style={[styles.contentLabel, { color: colors.text }]}>Isi Materi</Text>
          </View>

          {displayContent ? (
            <Text style={[styles.contentText, { color: colors.text }]}>
              {displayContent}
            </Text>
          ) : (
            <View style={styles.emptyContent}>
              <Ionicons name="document-outline" size={36} color={colors.textSecondary} />
              <Text style={[styles.emptyContentText, { color: colors.textSecondary }]}>
                Tidak ada deskripsi untuk materi ini.
              </Text>
            </View>
          )}
        </View>

        {/* File download */}
        {material?.url && (
          <Pressable
            style={[styles.fileCard, { backgroundColor: typeConfig.color + '08', borderColor: typeConfig.color + '30' }]}
            onPress={handleDownload}
          >
            <Ionicons name={typeConfig.icon as any} size={20} color={typeConfig.color} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.fileLabel, { color: typeConfig.color }]}>File Terlampir</Text>
              <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
                {isValidUrl(material.url) ? material.url.split('/').pop() : material.url}
              </Text>
            </View>
            {isValidUrl(material.url) && (
              <View style={[styles.downloadBtn, { backgroundColor: typeConfig.color }]}>
                <Ionicons name="download-outline" size={16} color="#fff" />
                <Text style={styles.downloadBtnText}>Buka</Text>
              </View>
            )}
          </Pressable>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      {!isClassArchived && (
        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <Pressable
            style={[
              styles.completeBtn,
              { backgroundColor: marked ? '#10B981' : PURPLE },
              marking && { opacity: 0.7 },
            ]}
            onPress={handleMarkComplete}
            disabled={marking || marked}
          >
            {marking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name={marked ? 'checkmark-circle' : 'checkmark-circle-outline'} size={20} color="#fff" />
                <Text style={styles.completeBtnText}>
                  {marked ? 'Sudah Dipelajari' : 'Tandai Selesai Pelajari'}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  scrollContent: { padding: 20 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginBottom: 12 },
  typeBadgeText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: 'bold', lineHeight: 30, marginBottom: 10 },
  classTag: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, marginBottom: 16 },
  classTagText: { fontSize: 12 },
  divider: { height: 1, marginBottom: 16 },
  contentCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
  contentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  contentLabel: { fontSize: 14, fontWeight: '700' },
  contentText: { fontSize: 15, lineHeight: 24 },
  emptyContent: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  emptyContentText: { fontSize: 13, textAlign: 'center' },
  fileCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1 },
  fileLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  fileName: { fontSize: 13, fontWeight: '500' },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  downloadBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: 1 },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 16 },
  completeBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});

export default MaterialDetailScreen;
