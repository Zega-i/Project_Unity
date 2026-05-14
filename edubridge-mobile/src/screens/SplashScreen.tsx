import React from 'react';
import {
  View, Text, StyleSheet, Pressable,
  SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';

const PURPLE = '#7C3AED';
const LIGHT_PURPLE = '#F5F3FF';

const SplashScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <LinearGradient colors={[PURPLE, '#6D28D9']} style={styles.logoBox}>
            <Ionicons name="school" size={48} color="#FFF" />
          </LinearGradient>
          <Text style={styles.brandName}>EduBridge</Text>
        </View>

        {/* Text */}
        <View style={styles.textSection}>
          <Text style={styles.tagline}>Belajar Lebih Cerdas dengan Bantuan AI</Text>
          <Text style={styles.description}>
            Platform AI untuk guru mengelola kelas dan memberdayakan siswa dengan asisten cerdas 24/7.
          </Text>
          <View style={styles.indicatorContainer}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={styles.mainBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <LinearGradient colors={[PURPLE, '#6D28D9']} style={styles.gradientBtn}>
            <Text style={styles.btnText}>Mulai Sekarang</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Constants.statusBarHeight },
  circle1:    { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: LIGHT_PURPLE, opacity: 0.5 },
  circle2:    { position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: LIGHT_PURPLE, opacity: 0.3 },
  content:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },

  logoWrap: { alignItems: 'center', marginBottom: 44 },
  logoBox: {
    width: 96, height: 96, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 18,
    shadowColor: PURPLE, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  brandName: { fontSize: 32, fontWeight: 'bold', color: '#1E293B', letterSpacing: 0.5 },

  textSection:        { alignItems: 'center' },
  tagline:            { fontSize: 20, fontWeight: 'bold', color: '#1E293B', textAlign: 'center', marginBottom: 12 },
  description:        { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
  indicatorContainer: { flexDirection: 'row', marginTop: 30 },
  dot:                { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E2E8F0', marginHorizontal: 4 },
  activeDot:          { width: 24, backgroundColor: PURPLE },

  footer:     { padding: 30, paddingBottom: 50 },
  mainBtn:    { width: '100%', height: 56, borderRadius: 16, overflow: 'hidden' },
  gradientBtn:{ flex: 1, alignItems: 'center', justifyContent: 'center' },
  btnText:    { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default SplashScreen;
