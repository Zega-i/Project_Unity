import React from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable,
  Animated, Dimensions, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface PremiumModalProps {
  visible: boolean;
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  icon?: string;
}

const GREEN = '#16A34A';
const RED = '#EF4444';
const AMBER = '#F59E0B';
const BLUE = '#3B82F6';

const PremiumModal: React.FC<PremiumModalProps> = ({
  visible,
  type = 'info',
  title,
  message,
  confirmText = 'Siap',
  cancelText = 'Batal',
  onConfirm,
  onCancel,
  icon
}) => {
  const { colors } = useTheme();

  const getColors = () => {
    switch (type) {
      case 'success': return { main: GREEN, bg: GREEN + '15' };
      case 'error': return { main: RED, bg: RED + '15' };
      case 'warning': return { main: AMBER, bg: AMBER + '15' };
      case 'confirm': return { main: BLUE, bg: BLUE + '15' };
      default: return { main: GREEN, bg: GREEN + '15' };
    }
  };

  const getIcon = () => {
    if (icon) return icon;
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'alert-circle';
      case 'warning': return 'warning';
      case 'confirm': return 'help-circle';
      default: return 'information-circle';
    }
  };

  const themeColors = getColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {/* Top Graphic/Icon */}
          <View style={[styles.iconContainer, { backgroundColor: themeColors.bg }]}>
            <Ionicons name={getIcon() as any} size={48} color={themeColors.main} />
          </View>

          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
          </View>

          <View style={styles.actions}>
            {onCancel && (
              <Pressable 
                style={[styles.btn, styles.cancelBtn, { backgroundColor: colors.surface }]}
                onPress={onCancel}
              >
                <Text style={[styles.btnText, { color: colors.text }]}>{cancelText}</Text>
              </Pressable>
            )}
            <Pressable 
              style={[styles.btn, { backgroundColor: themeColors.main, flex: onCancel ? 1 : 0, width: onCancel ? 'auto' : '100%' }]}
              onPress={onConfirm}
            >
              <Text style={[styles.btnText, { color: '#FFF' }]}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  content: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  btn: {
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cancelBtn: {
    flex: 1,
  },
  btnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PremiumModal;
