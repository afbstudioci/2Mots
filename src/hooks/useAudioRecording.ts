//src/hooks/useAudioRecording.ts
import { useState } from 'react';
import { useAudioRecorder, useAudioRecorderState, RecordingPresets, requestRecordingPermissionsAsync } from 'expo-audio';

export const useAudioRecording = () => {
    const [isRecording, setIsRecording] = useState(false);
    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const state = useAudioRecorderState(recorder, 500);

    const start = async () => {
        try {
            const { granted } = await requestRecordingPermissionsAsync();
            if (!granted) {
                console.warn('[AUDIO] Permission micro refusée');
                return;
            }
            await recorder.prepareToRecordAsync();
            recorder.record();
            setIsRecording(true);
        } catch (err) {
            console.error('[AUDIO] Failed to start recording', err);
        }
    };

    const stop = async (cancel = false) => {
        try {
            await recorder.stop();
            setIsRecording(false);
            return cancel ? null : recorder.uri;
        } catch (e) {
            setIsRecording(false);
            return null;
        }
    };

    return { 
        isRecording: state.isRecording || isRecording, 
        recordingTime: Math.round(state.durationMillis / 1000), 
        start, 
        stop 
    };
};