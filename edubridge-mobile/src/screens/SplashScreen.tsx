import React from 'react';
import {
  View, Text, StyleSheet, Image, Pressable,
  SafeAreaView, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#A78BFA';

const SplashScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Illustration Section */}
        <View style={styles.illustrationWrap}>
          <Image
            source={{ uri: 'file:///C:/Users/agust/.gemini/antigravity/brain/82610f0c-f3bd-40ca-8af6-3c69e09a7cf0/splash_robot_illustration_1778695841042.png' }}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Brand Section */}
        <View style={styles.brandSection}>
          <View style={styles.logoRow}>
            <View style={styles.logoIconBox}>
              <Ionicons name="school" size={24} color="#fff" />
            </View>
            <Text style={styles.title}>EduBridge AI</Text>
          </View>
          <Text style={styles.tagline}>Belajar Cerdas,</Text>
          <Text style={styles.tagline}>Masa Depan Terbuka ✨</Text>
        </View>

        {/* Footer Section */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.9 }
            ]}
            onPress={() => navigation.navigate('Login')}
          >
            <LinearGradient
              colors={[PURPLE, PURPLE_LIGHT]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              <Text style={styles.buttonText}>Mulai</Text>
            </LinearGradient>
          </Pressable>

          {/* Pagination Dots */}
          <View style={styles.dotsRow}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  illustrationWrap: {
    width: width * 0.85,
    height: height * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  brandSection: {
    alignItems: 'center',
    marginTop: -20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  logoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    width: '100%',
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 60,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 30,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  dotActive: {
    width: 20,
    backgroundColor: PURPLE,
  },
});

export default SplashScreen;