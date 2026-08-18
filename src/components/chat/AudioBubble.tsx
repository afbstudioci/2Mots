//src/components/chat/AudioBubble.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';

interface AudioBubbleProps {
    uri: string;
    isMe: boolean;
    duration?: number;
}

export default function AudioBubble({ uri, isMe, duration }: AudioBubbleProps) {
    const { themeColors } = useTheme();
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [totalDuration, setTotalDuration] = useState(duration ? duration * 1000 : 0);
    const playerRef = useRef<AudioPlayer | null>(null);

    useEffect(() => {
        return () => {
            if (playerRef.current) {
                try {
                    playerRef.current.pause();
                    playerRef.current.release();
                } catch (e) {}
            }
        };
    }, []);

    const playPause = () => {
        if (!uri) return;
        try {
            if (!playerRef.current) {
                const player = createAudioPlayer({ uri });
                playerRef.current = player;
                player.play();
                setIsPlaying(true);
            } else {
                if (isPlaying) {
                    playerRef.current.pause();
                    setIsPlaying(false);
                } else {
                    playerRef.current.play();
                    setIsPlaying(true);
                }
            }
        } catch (e) {
            console.error("[AUDIO] Play error", e);
            setIsPlaying(false);
        }
    };

    const formatTime = (millis: number) => {
        const totalSeconds = millis / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const progress = totalDuration > 0 ? (position / totalDuration) : 0;

    return (
        <View style={[styles.container, { backgroundColor: isMe ? 'rgba(255,255,255,0.15)' : themeColors.overlayLight }]}>
            <TouchableOpacity 
                onPress={playPause} 
                style={[styles.playBtn, { backgroundColor: isMe ? colors.white : colors.coral }]}
                disabled={!uri}
            >
                <Ionicons 
                    name={isPlaying ? "pause" : "play"} 
                    size={20} 
                    color={isMe ? colors.coral : colors.white} 
                />
            </TouchableOpacity>
            
            <View style={styles.trackContainer}>
                <View style={[styles.track, { backgroundColor: isMe ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.05)' }]}>
                    <View style={[
                        styles.progress, 
                        { 
                            width: `${Math.min(progress * 100, 100)}%`,
                            backgroundColor: isMe ? colors.white : colors.coral 
                        }
                    ]} />
                </View>
                <View style={styles.metaRow}>
                    <Text style={[styles.timer, { color: isMe ? colors.white : themeColors.textSecondary }]}>
                        {formatTime(position)} / {formatTime(totalDuration)}
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
        width: 220,
        padding: 8,
        borderRadius: 20,
    },
    playBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.soft(false),
    },
    trackContainer: {
        flex: 1,
        marginLeft: 12,
    },
    track: {
        height: 6,
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
        opacity: 0.8,
    },
});