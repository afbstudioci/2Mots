//src/hooks/useFeedback.ts
import * as Haptics from 'expo-haptics';
import { useSettings } from '../context/SettingsContext';

export const useFeedback = () => {
    const { hapticsEnabled } = useSettings();

    // Méthode générique pour tous les impacts
    const triggerVibration = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
        if (hapticsEnabled) {
            Haptics.impactAsync(style);
        }
    };

    const triggerSuccessVibration = () => {
        if (hapticsEnabled) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    const triggerErrorVibration = () => {
        if (hapticsEnabled) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    const triggerWarningVibration = () => {
        if (hapticsEnabled) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
    };

    return { 
        triggerVibration, 
        triggerSuccessVibration, 
        triggerErrorVibration, 
        triggerWarningVibration 
    };
};