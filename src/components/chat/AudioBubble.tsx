import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';
import { Audio, AVPlaybackStatus } from 'expo-av';

interface AudioBubbleProps {
    uri: string;
    isMe: boolean;
    duration?: number;
}

export default function AudioBubble({ uri, isMe, duration }: AudioBubbleProps) {
    const { themeColors } = useTheme();
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [totalDuration, setTotalDuration] = useState(duration ? duration * 1000 : 0);
    const [isLoaded, setIsLoaded] = useState(false);
    
    // Utilisation d'un ref pour éviter les problèmes de stale closure dans le callback
    const soundRef = useRef<Audio.Sound | null>(null);

    const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            if (status.durationMillis) {
                setTotalDuration(status.durationMillis);
            }
            setIsPlaying(status.isPlaying);
            
            if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
                if (soundRef.current) {
                    soundRef.current.setPositionAsync(0);
                }
            }
        } else if (status.error) {
            console.error(`[AUDIO] Playback error: ${status.error}`);
        }
    }, []);

    useEffect(() => {
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    const playPause = async () => {
        try {
            // Configuration du mode audio avant toute action
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });

            if (soundRef.current) {
                if (isPlaying) {
                    await soundRef.current.pauseAsync();
                } else {
                    await soundRef.current.playAsync();
                }
            } else {
                // Chargement initial
                setIsLoaded(false);
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri },
                    { shouldPlay: true, progressUpdateIntervalMillis: 100 },
                    onPlaybackStatusUpdate
                );
                soundRef.current = newSound;
                setSound(newSound);
                setIsLoaded(true);
            }
        } catch (e) {
            console.error("[AUDIO] Play error", e);
            // Si erreur de chargement, on réinitialise
            soundRef.current = null;
            setSound(null);
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
                disabled={uri ? false : true}
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
