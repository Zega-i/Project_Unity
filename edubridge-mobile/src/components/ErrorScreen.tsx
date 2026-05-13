import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../utils/theme';

interface ErrorScreenProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showRetry?: boolean;
  fullScreen?: boolean;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title = 'Terjadi Kesalahan',
  message,
  onRetry,
  onDismiss,
  showRetry = true,
  fullScreen = true,
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.buttonContainer}>
          {showRetry && onRetry && (
            <TouchableOpacity style={[styles.button, styles.retryButton]} onPress={onRetry}>
              <Text style={styles.retryButtonText}>Coba Lagi</Text>
            </TouchableOpacity>
          )}
          {onDismiss && (
            <TouchableOpacity style={[styles.button, styles.dismissButton]} onPress={onDismiss}>
              <Text style={styles.dismissButtonText}>Tutup</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

interface ErrorBoxProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorBox: React.FC<ErrorBoxProps> = ({ message, onDismiss }) => {
  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorIcon}>✕</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginHorizontal: Spacing.md,
  },
  icon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.error,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: Typography.button.fontSize,
    fontWeight: Typography.button.fontWeight,
  },
  dismissButton: {
    backgroundColor: Colors.gray200,
  },
  dismissButtonText: {
    color: Colors.textPrimary,
    fontSize: Typography.button.fontSize,
    fontWeight: Typography.button.fontWeight,
  },
  errorBox: {
    backgroundColor: Colors.errorLight,
    borderColor: Colors.error,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 18,
    color: Colors.error,
    marginRight: Spacing.md,
  },
  errorMessage: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    color: Colors.error,
    lineHeight: 20,
  },
  closeButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  closeButtonText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
