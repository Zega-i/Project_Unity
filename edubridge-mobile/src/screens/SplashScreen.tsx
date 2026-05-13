import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const PURPLE = '#7C3AED';

const SplashScreen = () => {
  const navigation = useNavigation<any>();

  const handleStart = () => {
    navigation.navigate('Login');
  };

  return (
    <LinearGradient colors={[PURPLE, '#5B21B6']} style={styles.container}>
      <SafeAreaView style={styles.content}>
        <View style={styles.centerContent}>
          <Text style={styles.logo}>🤖</Text>
          <Text style={styles.title}>EduBridge AI</Text>
          <Text style={styles.subtitle}>Belajar Cerdas, Masa Depan Terbuka</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleStart}
        >
          <Text style={styles.buttonText}>Mulai Belajar</Text>
        </Pressable>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logo: {
    fontSize: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ddd',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: PURPLE,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SplashScreen;