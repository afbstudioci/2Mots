//src/hooks/useAudio.ts
import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { useSettings } from '../context/SettingsContext';

export const useAudio = () => {
    // Supposons que les réglages aient une option soundEnabled, sinon on l'active par défaut.
    const { soundEnabled = true } = useSettings() as any; 

    const successSound = useRef<Audio.Sound | null>(null);
    const dangerSound = useRef<Audio.Sound | null>(null);
    const levelupSound = useRef<Audio.Sound | null>(null);
    const gameoverSound = useRef<Audio.Sound | null>(null);

    useEffect(() => {
        async function loadSounds() {
            try {
                // Initialisation de l'audio pour iOS
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                });

                const { sound: s1 } = await Audio.Sound.createAsync(require('../../assets/sounds/success.mp3'));
                successSound.current = s1;

                const { sound: s2 } = await Audio.Sound.createAsync(require('../../assets/sounds/danger.mp3'));
                dangerSound.current = s2;

                const { sound: s3 } = await Audio.Sound.createAsync(require('../../assets/sounds/levelup.mp3'));
                levelupSound.current = s3;

                const { sound: s4 } = await Audio.Sound.createAsync(require('../../assets/sounds/gameover.mp3'));
                gameoverSound.current = s4;
            } catch (error) {
                console.log("Erreur de chargement audio :", error);
            }
        }
        loadSounds();

        return () => {
            successSound.current?.unloadAsync();
            dangerSound.current?.unloadAsync();
            levelupSound.current?.unloadAsync();
            gameoverSound.current?.unloadAsync();
        };
    }, []);

    const playSuccess = async () => {
        if (!soundEnabled) return;
        try {
            await successSound.current?.replayAsync();
        } catch (e) {}
    };

    const playDanger = async () => {
        if (!soundEnabled) return;
        try {
            await dangerSound.current?.replayAsync();
        } catch (e) {}
    };

    const playLevelUp = async () => {
        if (!soundEnabled) return;
        try {
            await levelupSound.current?.replayAsync();
        } catch (e) {}
    };

    const playGameOver = async () => {
        if (!soundEnabled) return;
        try {
            await gameoverSound.current?.replayAsync();
        } catch (e) {}
    };

    return {
        playSuccess,
        playDanger,
        playLevelUp,
        playGameOver
    };
};
