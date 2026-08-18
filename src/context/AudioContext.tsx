//src/context/AudioContext.tsx
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';
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

  const bgmPlayerRef = useRef<AudioPlayer | null>(null);
  const sfxPlayersRef = useRef<{ [key: string]: AudioPlayer }>({});
  const shouldPlayBgm = useRef(false);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'duckOthers',
      allowsRecording: false,
    }).catch(() => {});

    try {
      const bgmPlayer = createAudioPlayer(require('../../assets/sounds/bgm.mp3'));
      bgmPlayer.loop = true;
      bgmPlayer.volume = 0.35;
      bgmPlayerRef.current = bgmPlayer;

      if (shouldPlayBgm.current && soundEnabled) {
        bgmPlayer.play();
      }

      const effectAssets: { [key: string]: any } = {
        success: require('../../assets/sounds/success.mp3'),
        danger: require('../../assets/sounds/danger.mp3'),
        levelup: require('../../assets/sounds/levelup.mp3'),
        gameover_zero: require('../../assets/sounds/gameover_zero.mp3'),
        gameover_score: require('../../assets/sounds/gameover_score.mp3'),
        hint: require('../../assets/sounds/hint.mp3'),
      };

      for (const [key, asset] of Object.entries(effectAssets)) {
        const player = createAudioPlayer(asset);
        player.volume = 0.85;
        sfxPlayersRef.current[key] = player;
      }
    } catch (err) {
      console.warn('[AUDIO] Init expo-audio error:', err);
    }

    return () => {
      try {
        if (bgmPlayerRef.current) {
          bgmPlayerRef.current.pause();
          bgmPlayerRef.current.release();
        }
        Object.values(sfxPlayersRef.current).forEach((p) => {
          p.pause();
          p.release();
        });
      } catch (e) {}
    };
  }, [soundEnabled]);

  const playBgm = () => {
    shouldPlayBgm.current = true;
    if (!soundEnabled) return;
    if (bgmPlayerRef.current) {
      try {
        if (!bgmPlayerRef.current.playing) {
          bgmPlayerRef.current.play();
        }
      } catch (e) {}
    }
  };

  const stopBgm = () => {
    shouldPlayBgm.current = false;
    if (bgmPlayerRef.current) {
      try {
        bgmPlayerRef.current.pause();
        bgmPlayerRef.current.seekTo(0);
      } catch (e) {}
    }
  };

  const playEffect = (name: string, vol = 0.85) => {
    if (!soundEnabled) return;
    const player = sfxPlayersRef.current[name];
    if (player) {
      try {
        player.volume = vol;
        player.seekTo(0);
        player.play();
      } catch (e) {}
    }
  };

  return (
    <AudioContext.Provider
      value={{
        playBgm,
        stopBgm,
        playSuccess: () => playEffect('success', 0.9),
        playError: () => playEffect('danger', 0.75),
        playDanger: () => playEffect('danger', 0.8),
        playLevelUp: () => playEffect('levelup', 1.0),
        playHint: () => playEffect('hint', 0.9),
        playGameOver: (hasScore) => {
          stopBgm();
          playEffect(hasScore ? 'gameover_score' : 'gameover_zero', 1.0);
        },
        stopGameOver: () => {
          try {
            sfxPlayersRef.current.gameover_zero?.pause();
            sfxPlayersRef.current.gameover_score?.pause();
          } catch (e) {}
        },
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => useContext(AudioContext);