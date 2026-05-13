import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authAPI } from '../../services/api';
import { authStore } from '../../store/authStore';

const PURPLE = '#7C3AED';

type Role = 'STUDENT' | 'TEACHER';

const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');
  const [grade, setGrade] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const extra = role === 'STUDENT' ? { grade } : {};
      const response = await authAPI.register(email, password, name, role, extra);
      await authStore.setAuth(response.token, response.user);
      // Navigation will happen automatically
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Pendaftaran gagal. Silakan coba lagi.';
      Alert.alert('Registration Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Daftar</Text>
          <Text style={styles.subtitle}>Buat akun baru Anda</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <TextInput
              style={styles.input}
              placeholder="Nama Anda"
              placeholderTextColor="#ccc"
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="nama@email.com"
              placeholderTextColor="#ccc"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan password"
              placeholderTextColor="#ccc"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Saya adalah</Text>
            <View style={styles.roleContainer}>
              <Pressable
                style={[
                  styles.roleButton,
                  role === 'STUDENT' && styles.roleButtonActive,
                ]}
                onPress={() => !loading && setRole('STUDENT')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'STUDENT' && styles.roleButtonTextActive,
                  ]}
                >
                  Siswa
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.roleButton,
                  role === 'TEACHER' && styles.roleButtonActive,
                ]}
                onPress={() => !loading && setRole('TEACHER')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'TEACHER' && styles.roleButtonTextActive,
                  ]}
                >
                  Guru
                </Text>
              </Pressable>
            </View>
          </View>

          {role === 'STUDENT' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pilih Kelas</Text>
              <View style={styles.roleContainer}>
                {[10, 11, 12].map((g) => (
                  <Pressable
                    key={g}
                    style={[
                      styles.roleButton,
                      grade === g && styles.roleButtonActive,
                    ]}
                    onPress={() => !loading && setGrade(g)}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        grade === g && styles.roleButtonTextActive,
                      ]}
                    >
                      Kelas {g}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.registerButton,
              pressed && { opacity: 0.8 },
              loading && { opacity: 0.6 },
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Sedang mendaftar...' : 'Daftar'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  form: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  registerButton: {
    backgroundColor: PURPLE,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;