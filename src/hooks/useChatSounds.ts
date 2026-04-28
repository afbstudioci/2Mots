//src/hooks/useChatSounds.ts
import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef } from 'react';

export const useChatSounds = () => {
    const soundsRef = useRef<Record<string, Audio.Sound>>({});

    const loadSounds = async () => {
        try {
            // Ces fichiers devront être ajoutés dans assets/sounds/
            // Pour l'instant on prépare la structure
            /*
            const { sound: sendSound } = await Audio.Sound.createAsync(require('../../assets/sounds/send.mp3'));
            const { sound: receiveSound } = await Audio.Sound.createAsync(require('../../assets/sounds/receive.mp3'));
            const { sound: reactionSound } = await Audio.Sound.createAsync(require('../../assets/sounds/reaction.mp3'));
            
            soundsRef.current = {
                send: sendSound,
                receive: receiveSound,
                reaction: reactionSound
            };
            */
        } catch (error) {
            console.log('[SOUNDS] Load error:', error);
        }
    };

    useEffect(() => {
        loadSounds();
        return () => {
            // Nettoyage
            Object.values(soundsRef.current).forEach(s => s.unloadAsync());
        };
    }, []);

    const playSound = useCallback(async (type: 'send' | 'receive' | 'reaction') => {
        try {
            const sound = soundsRef.current[type];
            if (sound) {
                await sound.replayAsync();
            }
        } catch (e) {
            // Ignorer si pas chargé
        }
    }, []);

    return { playSound };
};
