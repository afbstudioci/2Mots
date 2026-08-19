//src/components/chat/AudioBubble.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';
import { useAudioPlayer } from 'expo-audio';

interface AudioBubbleProps {
  uri: string;
  isMe: boolean;
  duration?: number;
}

export default function AudioBubble({ uri, isMe, duration = 0 }: AudioBubbleProps) {
  const { themeColors } = useTheme();
  const player = useAudioPlayer(uri ? { uri } : null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPos, setCurrentPos] = useState(0);

  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      if (player.playing) {
        setIsPlaying(true);
        setCurrentPos(player.currentTime || 0);
      } else {
        setIsPlaying(false);
        if (player.duration && player.currentTime >= player.duration - 0.2) {
          setCurrentPos(0);
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [player]);

  const togglePlay = () => {
    if (!player || !uri) return;
    try {
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
      } else {
        if (player.duration && player.currentTime >= player.duration - 0.2) {
          player.seekTo(0);
        }
        player.play();
        setIsPlaying(true);
      }
    } catch {}
  };

  const formatTime = (seconds: number) => {
    const s = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const totalDuration = (player && player.duration > 0) ? player.duration : (duration || 1);
  const progress = totalDuration > 0 ? Math.min(1, currentPos / totalDuration) : 0;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isMe ? 'rgba(255,255,255,0.15)' : themeColors.overlayLight },
      ]}
    >
      <TouchableOpacity
        onPress={togglePlay}
        style={[styles.playBtn, { backgroundColor: isMe ? colors.white : colors.coral }]}
        disabled={!uri}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={18}
          color={isMe ? colors.coral : colors.white}
        />
      </TouchableOpacity>

      <View style={styles.trackContainer}>
        <View style={[styles.track, { backgroundColor: isMe ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.08)' }]}>
          <View
            style={[
              styles.progress,
              {
                width: `${Math.max(0, Math.min(progress * 100, 100))}%`,
                backgroundColor: isMe ? colors.white : colors.coral,
              },
            ]}
          />
        </View>
        <View style={styles.metaRow}>
          <Text style={[styles.timer, { color: isMe ? colors.white : themeColors.textSecondary }]}>
            {formatTime(currentPos)} / {formatTime(totalDuration)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 210,
    padding: 8,
    borderRadius: 20,
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.soft(false),
  },
  trackContainer: {
    flex: 1,
    marginLeft: 10,
  },
  track: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  timer: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    opacity: 0.85,
  },
});