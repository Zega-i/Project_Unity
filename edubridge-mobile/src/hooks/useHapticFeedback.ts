import { useHaptic } from '../contexts/HapticContext';

export const useHapticFeedback = () => {
  const { isHapticEnabled, triggerHaptic } = useHaptic();

  const triggerLight = () => {
    if (isHapticEnabled) {
      triggerHaptic('light');
    }
  };

  const triggerMedium = () => {
    if (isHapticEnabled) {
      triggerHaptic('medium');
    }
  };

  const triggerHeavy = () => {
    if (isHapticEnabled) {
      triggerHaptic('heavy');
    }
  };

  return {
    isHapticEnabled,
    triggerLight,
    triggerMedium,
    triggerHeavy,
  };
};
