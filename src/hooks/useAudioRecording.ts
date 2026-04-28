//src/hooks/useAudioRecording.ts
import { useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

export const useAudioRecording = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const timerRef = useRef<any>(null);

    const cleanup = async () => {
        if (recordingRef.current) {
            try {
                const status = await recordingRef.current.getStatusAsync();
                if (status.isRecording) await recordingRef.current.stopAndUnloadAsync();
            } catch (e) {}
            recordingRef.current = null;
        }
        setIsRecording(false);
        setRecordingTime(0);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const start = async () => {
        try {
            await cleanup();
            const perm = await Audio.requestPermissionsAsync();
            if (perm.status !== 'granted') return;

            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            recordingRef.current = recording;
            
            setIsRecording(true);
            timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
        } catch (err) {
            console.error('[AUDIO] Failed to start recording', err);
        }
    };

    const stop = async (cancel = false) => {
        if (!recordingRef.current) return null;
        const uri = recordingRef.current.getURI();
        await cleanup();
        return cancel ? null : uri;
    };

    useEffect(() => {
        return () => { cleanup(); };
    }, []);

    return { isRecording, recordingTime, start, stop };
};
