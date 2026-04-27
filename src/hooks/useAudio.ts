//src/hooks/useAudio.ts
import { useEffect } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useSettings } from '../context/SettingsContext';

export const useAudio = () => {
    const { soundEnabled = true } = useSettings() as any; 

    // Configuration de l'audio global
    useEffect(() => {
        async function setupAudio() {
            try {
                await setAudioModeAsync({
                    playsInSilentMode: true,
                    shouldPlayInBackground: false,
                    allowsRecording: false,
                    shouldRouteThroughEarpiece: false,
                });
            } catch (error) {
                console.log("Erreur de configuration audio :", error);
            }
        }
        setupAudio();
    }, []);

    const successPlayer = useAudioPlayer(require('../../assets/sounds/success.mp3'));
    const dangerPlayer = useAudioPlayer(require('../../assets/sounds/danger.mp3'));
    const levelupPlayer = useAudioPlayer(require('../../assets/sounds/levelup.mp3'));
    const gameoverPlayer = useAudioPlayer(require('../../assets/sounds/gameover.mp3'));

    const playSuccess = () => {
        if (!soundEnabled) return;
        try {
            successPlayer.seekTo(0);
            successPlayer.play();
        } catch (e) {}
    };

    const playDanger = () => {
        if (!soundEnabled) return;
        try {
            dangerPlayer.seekTo(0);
            dangerPlayer.play();
        } catch (e) {}
    };

    const playLevelUp = () => {
        if (!soundEnabled) return;
        try {
            levelupPlayer.seekTo(0);
            levelupPlayer.play();
        } catch (e) {}
    };

    const playGameOver = () => {
        if (!soundEnabled) return;
        try {
            gameoverPlayer.seekTo(0);
            gameoverPlayer.play();
        } catch (e) {}
    };

    return {
        playSuccess,
        playDanger,
        playLevelUp,
        playGameOver
    };
};
