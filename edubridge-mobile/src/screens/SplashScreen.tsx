import React from 'react';
import {
  View, Text, StyleSheet, Image, Pressable,
  SafeAreaView, Dimensions, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');
const PURPLE = '#7C3AED';
const LIGHT_PURPLE = '#F5F3FF';

const SplashScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Background Decorative Circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <View style={styles.content}>
        {/* Robot Illustration */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1531746790731-6c087fecd05a?q=80&w=2012&auto=format&fit=crop' }}
            style={styles.robotImage}
            resizeMode="contain"
          />
        </View>

        {/* Text Section */}
        <View style={styles.textSection}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoEmoji}>🤖</Text>
            </View>
            <Text style={styles.brandName}>EduBridge AI</Text>
          </View>
          
          <Text style={styles.tagline}>Belajar Lebih Cerdas dengan Bantuan AI</Text>
          <Text style={styles.description}>
            Platform AI untuk guru mengelola kelas dan memberdayakan siswa dengan asisten cerdas 24/7.
          </Text>

          {/* Indicator */}
          <View style={styles.indicatorContainer}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      </View>

      {/* Footer / Button Section */}
      <View style={styles.footer}>
        <Pressable 
          style={styles.mainBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <LinearGradient
            colors={[PURPLE, '#6D28D9']}
            style={styles.gradientBtn}
          >
            <Text style={styles.btnText}>Mulai Sekarang</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Constants.statusBarHeight },
  circle1: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: LIGHT_PURPLE, opacity: 0.5 },
  circle2: { position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: LIGHT_PURPLE, opacity: 0.3 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  imageContainer: { width: width * 0.8, height: width * 0.8, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  robotImage: { width: '100%', height: '100%' },
  textSection: { alignItems: 'center' },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  logoIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  logoEmoji: { fontSize: 18 },
  brandName: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  tagline: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', textAlign: 'center', marginBottom: 12 },
  description: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
  indicatorContainer: { flexDirection: 'row', marginTop: 30 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E2E8F0', marginHorizontal: 4 },
  activeDot: { width: 24, backgroundColor: PURPLE },
  footer: { padding: 30, paddingBottom: 50 },
  mainBtn: { width: '100%', height: 56, borderRadius: 16, overflow: 'hidden' },
  gradientBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default SplashScreen;