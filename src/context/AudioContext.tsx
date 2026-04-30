//src/context/AudioContext.tsx
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
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
    const settings = useSettings();
    const soundEnabled = settings?.soundEnabled ?? true;
    
    const bgmRef = useRef<Audio.Sound | null>(null);
    const soundsRef = useRef<{ [key: string]: Audio.Sound }>({});

    // Setup global
    useEffect(() => {
        Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            allowsRecordingIOS: false,
            staysActiveInBackground: false,
            playThroughEarpieceAndroid: false,
        }).catch(() => {});

        // Chargement initial
        const load = async () => {
            try {
                // BGM
                const { sound: bgm } = await Audio.Sound.createAsync(
                    require('../../assets/sounds/bgm.mp3'),
                    { shouldPlay: false, isLooping: true, volume: 0.4 }
                );
                bgmRef.current = bgm;

                // Effets
                const effectAssets: any = {
                    success: require('../../assets/sounds/success.mp3'),
                    danger: require('../../assets/sounds/danger.mp3'),
                    levelup: require('../../assets/sounds/levelup.mp3'),
                    gameover_zero: require('../../assets/sounds/gameover_zero.mp3'),
                    gameover_score: require('../../assets/sounds/gameover_score.mp3'),
                    hint: require('../../assets/sounds/hint.mp3'),
                };

                for (const key in effectAssets) {
                    const { sound } = await Audio.Sound.createAsync(effectAssets[key]);
                    soundsRef.current[key] = sound;
                }
            } catch (e) {
                console.log("[AUDIO] Load error:", e);
            }
        };
        load();

        return () => {
            if (bgmRef.current) bgmRef.current.unloadAsync().catch(() => {});
            Object.values(soundsRef.current).forEach(s => s.unloadAsync().catch(() => {}));
        };
    }, []);

    const playBgm = async () => {
        if (!soundEnabled || !bgmRef.current) return;
        try {
            await bgmRef.current.playAsync();
        } catch (e) {}
    };

    const stopBgm = async () => {
        if (!bgmRef.current) return;
        try {
            await bgmRef.current.stopAsync();
        } catch (e) {}
    };

    const playEffect = async (name: string, volume = 1.0) => {
        if (!soundEnabled) return;
        const sound = soundsRef.current[name];
        if (sound) {
            try {
                await sound.setVolumeAsync(volume);
                await sound.replayAsync();
            } catch (e) {}
        }
    };

    return (
        <AudioContext.Provider value={{
            playBgm,
            stopBgm,
            playSuccess: () => playEffect('success', 0.9),
            playError: () => playEffect('danger', 0.7),
            playDanger: () => playEffect('danger', 0.8),
            playLevelUp: () => playEffect('levelup', 1.0),
            playHint: () => playEffect('hint', 1.0),
            playGameOver: (hasScore) => {
                stopBgm();
                playEffect(hasScore ? 'gameover_score' : 'gameover_zero', 1.0);
            },
            stopGameOver: () => {
                soundsRef.current['gameover_zero']?.stopAsync().catch(() => {});
                soundsRef.current['gameover_score']?.stopAsync().catch(() => {});
            }
        }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudioContext = () => useContext(AudioContext);
