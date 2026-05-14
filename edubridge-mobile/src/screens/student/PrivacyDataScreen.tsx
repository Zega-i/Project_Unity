import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const PURPLE = '#7C3AED';

interface Section {
  title: string;
  icon: string;
  content: string[];
  color: string;
}

const PrivacyDataScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight } = useHapticFeedback();

  const sections: Section[] = [
    {
      title: 'Keamanan Data',
      icon: 'shield-checkmark',
      color: '#10B981',
      content: [
        '• Data Anda dienkripsi menggunakan standar keamanan industri terbaru',
        '• Semua komunikasi dengan server dilindungi dengan protokol HTTPS/SSL',
        '• Password disimpan dengan hash yang aman dan tidak dapat dibaca',
        '• Kami tidak pernah menyimpan password Anda dalam bentuk plaintext',
        '• Sistem kami diaudit secara berkala oleh keamanan pihak ketiga',
      ]
    },
    {
      title: 'Privasi Pengguna',
      icon: 'eye-off',
      color: '#3B82F6',
      content: [
        '• Informasi pribadi Anda hanya digunakan untuk meningkatkan pengalaman belajar',
        '• Kami tidak membagikan data Anda kepada pihak ketiga tanpa persetujuan',
        '• Anda memiliki hak penuh untuk mengakses, mengubah, atau menghapus data Anda',
        '• Riwayat belajar Anda tetap pribadi dan hanya dapat diakses oleh Anda',
        '• Data yang tidak diperlukan akan dihapus secara berkala',
      ]
    },
    {
      title: 'Pengumpulan Data',
      icon: 'document-text',
      color: '#F59E0B',
      content: [
        '• Kami mengumpulkan: nama, email, sekolah, kelas, dan prestasi akademik',
        '• Data pembelajaran seperti materi yang dipelajari dan nilai quiz',
        '• Aktivitas pengguna untuk perbaikan personalisasi dan rekomendasi',
        '• Informasi perangkat dan log akses untuk keamanan dan debugging',
        '• Semua pengumpulan data mengikuti standar GDPR dan peraturan privasi lokal',
      ]
    },
    {
      title: 'Hak-Hak Pengguna',
      icon: 'information-circle',
      color: '#8B5CF6',
      content: [
        '✓ Hak untuk mengakses: Dapatkan salinan data pribadi Anda kapan saja',
        '✓ Hak untuk mengubah: Ubah informasi pribadi Anda dengan mudah',
        '✓ Hak untuk dihapus: Minta penghapusan akun dan semua data terkait',
        '✓ Hak untuk portabilitas: Dapatkan data Anda dalam format yang dapat ditransfer',
        '✓ Hak untuk menolak: Tolak penggunaan data untuk tujuan marketing',
      ]
    },
    {
      title: 'Kontak & Dukungan',
      icon: 'mail',
      color: '#EC4899',
      content: [
        '📧 Email: privacy@edubridge.id',
        '📞 Telepon: (021) 1234-5678',
        '⏰ Jam Operasional: Senin-Jumat, 09:00-17:00 WIB',
        '📬 Alamat: Jl. Pendidikan No. 123, Jakarta, Indonesia',
        '💬 Hubungi tim kami untuk pertanyaan atau kekhawatiran privasi apapun',
      ]
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => { triggerLight(); navigation.goBack(); }} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privasi & Data</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Introduction Card */}
        <View style={[styles.introCard, { backgroundColor: colors.primary + '10' }]}>
          <Ionicons name="shield-outline" size={32} color={PURPLE} />
          <Text style={[styles.introTitle, { color: colors.text }]}>Komitmen Kami terhadap Privasi Anda</Text>
          <Text style={[styles.introText, { color: colors.textSecondary }]}>
            EduBridge berkomitmen untuk melindungi privasi dan keamanan data Anda. Kami mengikuti praktik terbaik industri dan peraturan privasi internasional.
          </Text>
        </View>

        {/* Sections */}
        {sections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <View style={[styles.sectionHeader, { backgroundColor: section.color + '15' }]}>
              <Ionicons name={section.icon as any} size={24} color={section.color} />
              <Text style={[styles.sectionTitle, { color: section.color }]}>
                {section.title}
              </Text>
            </View>

            <View style={styles.sectionContent}>
              {section.content.map((item, i) => (
                <Text key={i} style={[styles.contentItem, { color: colors.text }]}>
                  {item}
                </Text>
              ))}
            </View>
          </View>
        ))}

        {/* Last Updated */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Kebijakan Privasi terakhir diperbarui pada 14 Mei 2026
          </Text>
          <Text style={[styles.footerDesc, { color: colors.textSecondary }]}>
            Kami akan memberitahu Anda tentang perubahan signifikan melalui email atau notifikasi di aplikasi
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable style={[styles.downloadBtn, { borderColor: colors.primary }]} onPress={() => triggerLight()}>
            <Ionicons name="download-outline" size={20} color={colors.primary} />
            <Text style={[styles.downloadBtnText, { color: colors.primary }]}>Unduh Kebijakan Privasi (PDF)</Text>
          </Pressable>

          <Pressable style={styles.contactBtn} onPress={() => triggerLight()}>
            <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
            <Text style={styles.contactBtnText}>Hubungi Tim Privasi</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },

  scrollContent: { paddingHorizontal: 20, paddingVertical: 24, paddingBottom: 40 },

  introCard: { backgroundColor: PURPLE + '08', borderRadius: 16, padding: 20, marginBottom: 28, alignItems: 'center' },
  introTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginTop: 12, marginBottom: 8, textAlign: 'center' },
  introText: { fontSize: 13, color: '#64748B', lineHeight: 20, textAlign: 'center' },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 16, marginBottom: 12, gap: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  sectionContent: { paddingHorizontal: 4 },
  contentItem: { fontSize: 13, color: '#1E293B', lineHeight: 22, marginBottom: 10 },

  footer: { alignItems: 'center', marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  footerText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  footerDesc: { fontSize: 11, color: '#94A3B8', marginTop: 6, textAlign: 'center' },

  actionButtons: { marginTop: 28, gap: 12 },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: PURPLE, borderRadius: 12, paddingVertical: 14, gap: 10 },
  downloadBtnText: { fontSize: 14, fontWeight: '700', color: PURPLE },
  contactBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: PURPLE, borderRadius: 12, paddingVertical: 14, gap: 10 },
  contactBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});

export default PrivacyDataScreen;
