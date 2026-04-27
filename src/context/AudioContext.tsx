//src/context/AudioContext.tsx
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useSettings } from './SettingsContext';

interface AudioContextData {
    playBgm: () => void;
    stopBgm: () => void;
    playSuccess: () => void;
    playError: () => void;
    playDanger: () => void;
    playLevelUp: () => void;
    playGameOver: (hasScore: boolean) => void;
    stopGameOver: () => void;
    playHint: () => void;
}

const AudioContext = createContext<AudioContextData>({} as AudioContextData);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { soundEnabled = true } = useSettings() as any;

    // Configuration globale
    useEffect(() => {
        setAudioModeAsync({
            playsInSilentMode: true,
            shouldPlayInBackground: false,
            allowsRecording: false,
            shouldRouteThroughEarpiece: false,
        }).catch(e => console.log("Audio mode error", e));
    }, []);

    // Chargement des lecteurs UNE SEULE FOIS au niveau racine
    const successPlayer = useAudioPlayer(require('../../assets/sounds/success.mp3'));
    const dangerPlayer = useAudioPlayer(require('../../assets/sounds/danger.mp3'));
    const levelupPlayer = useAudioPlayer(require('../../assets/sounds/levelup.mp3'));
    
    // Nouveaux sons conditionnels pour le GameOver
    const gameoverZeroPlayer = useAudioPlayer(require('../../assets/sounds/gameover_zero.mp3'));
    const gameoverScorePlayer = useAudioPlayer(require('../../assets/sounds/gameover_score.mp3'));
    
    // Autres sons avec placeholders si nécessaire
    const hintPlayer = useAudioPlayer(require('../../assets/sounds/hint.mp3')); 
    const bgmPlayer = useAudioPlayer(require('../../assets/sounds/bgm.mp3')); 
    const errorPlayer = useAudioPlayer(require('../../assets/sounds/danger.mp3'));

    // Config BGM
    useEffect(() => {
        bgmPlayer.loop = true;
    }, [bgmPlayer]);

    // Arrêt immédiat si le son est désactivé
    useEffect(() => {
        if (!soundEnabled) {
            bgmPlayer.pause();
            gameoverZeroPlayer.pause();
            gameoverScorePlayer.pause();
        }
    }, [soundEnabled]);

    const playBgm = () => {
        if (!soundEnabled) return;
        try {
            if (!bgmPlayer.playing) bgmPlayer.play();
        } catch (e) {}
    };

    const stopBgm = () => {
        try {
            bgmPlayer.pause();
            bgmPlayer.seekTo(0);
        } catch (e) {}
    };

    const playSuccess = () => {
        if (!soundEnabled) return;
        try {
            successPlayer.seekTo(0);
            successPlayer.play();
        } catch (e) {}
    };

    const playError = () => {
        if (!soundEnabled) return;
        try {
            errorPlayer.seekTo(0);
            errorPlayer.play();
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

    const playGameOver = (hasScore: boolean) => {
        if (!soundEnabled) return;
        try {
            bgmPlayer.pause();
            const player = hasScore ? gameoverScorePlayer : gameoverZeroPlayer;
            player.seekTo(0);
            player.play();
        } catch (e) {}
    };

    const stopGameOver = () => {
        try {
            gameoverZeroPlayer.pause();
            gameoverScorePlayer.pause();
        } catch (e) {}
    };

    const playHint = () => {
        if (!soundEnabled) return;
        try {
            hintPlayer.seekTo(0);
            hintPlayer.play();
        } catch (e) {}
    };

    return (
        <AudioContext.Provider value={{
            playBgm, stopBgm, playSuccess, playError, playDanger, 
            playLevelUp, playGameOver, stopGameOver, playHint
        }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudioContext = () => useContext(AudioContext);
