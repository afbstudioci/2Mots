//src/hooks/useChatSounds.ts
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { useCallback, useEffect, useRef } from 'react';

export const useChatSounds = () => {
    const soundsRef = useRef<Record<string, AudioPlayer>>({});

    const loadSounds = () => {
        try {
            // Structure prête pour expo-audio
        } catch (error) {
            console.log('[SOUNDS] Load error:', error);
        }
    };

    useEffect(() => {
        loadSounds();
        return () => {
            Object.values(soundsRef.current).forEach(s => {
                try { s.pause(); s.release(); } catch (e) {}
            });
        };
    }, []);

    const playSound = useCallback((type: 'send' | 'receive' | 'reaction') => {
        try {
            const sound = soundsRef.current[type];
            if (sound) {
                sound.seekTo(0);
                sound.play();
            }
        } catch (e) {}
    }, []);

    return { playSound };
};