//src/components/chat/AudioBubble.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { colors } from '../../theme/theme';

interface AudioBubbleProps {
    uri: string;
    isMe: boolean;
    duration?: number;
}

export default function AudioBubble({ uri, isMe, duration }: AudioBubbleProps) {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [totalDuration, setTotalDuration] = useState(duration ? duration * 1000 : 0);

    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            setTotalDuration(status.durationMillis || totalDuration);
            if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
                sound?.setPositionAsync(0);
            }
        }
    };

    const playPause = async () => {
        try {
            if (sound) {
                if (isPlaying) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                } else {
                    await sound.playAsync();
                    setIsPlaying(true);
                }
            } else {
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri },
                    { shouldPlay: true },
                    onPlaybackStatusUpdate
                );
                setSound(newSound);
                setIsPlaying(true);
            }
        } catch (e) {
            console.log("Audio play error", e);
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
        <View style={styles.container}>
            <TouchableOpacity 
                onPress={playPause} 
                style={[styles.playBtn, { backgroundColor: isMe ? 'rgba(255,255,255,0.2)' : colors.coral + '15' }]}
            >
                <MaterialCommunityIcons 
                    name={isPlaying ? "pause" : "play"} 
                    size={22} 
                    color={isMe ? colors.white : colors.coral} 
                />
            </TouchableOpacity>
            
            <View style={styles.trackContainer}>
                <View style={[styles.track, { backgroundColor: isMe ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.05)' }]}>
                    <View style={[
                        styles.progress, 
                        { 
                            width: `${progress * 100}%`,
                            backgroundColor: isMe ? colors.white : colors.coral 
                        }
                    ]} />
                </View>
                <View style={styles.metaRow}>
                    <Text style={[styles.timer, { color: isMe ? 'rgba(255,255,255,0.7)' : colors.nightBlue + '60' }]}>
                        {formatTime(position)}
                    </Text>
                    <Text style={[styles.timer, { color: isMe ? 'rgba(255,255,255,0.7)' : colors.nightBlue + '60' }]}>
                        {formatTime(totalDuration)}
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
        width: 200,
        paddingVertical: 2,
    },
    playBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trackContainer: {
        flex: 1,
        marginLeft: 12,
    },
    track: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progress: {
        height: '100%',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    timer: {
        fontSize: 9,
        fontFamily: 'Poppins_600SemiBold',
    },
});
