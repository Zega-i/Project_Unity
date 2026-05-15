import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  Pressable, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const PURPLE = '#7C3AED';

const MaterialsScreen = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { triggerLight } = useHapticFeedback();
  const [materials] = useState([]); // Data dummy telah dihapus

  const renderItem = ({ item }: { item: any }) => (
    <Pressable 
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => { triggerLight(); navigation.navigate('MaterialDetail', { material: item }); }}
    >
      <View style={[styles.iconBox, { backgroundColor: PURPLE + '10' }]}>
        <Ionicons name="book" size={24} color={PURPLE} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.subject, { color: PURPLE }]}>{item.subject}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <View style={styles.footer}>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>{item.lessons} Materi • {item.duration}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Constants.statusBarHeight }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Materi Belajar</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={materials}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  list: { padding: 20 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  info: { flex: 1 },
  subject: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
  title: { fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
  footer: { flexDirection: 'row', alignItems: 'center' },
  meta: { fontSize: 12 },
});

export default MaterialsScreen;
