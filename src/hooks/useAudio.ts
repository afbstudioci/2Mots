//src/hooks/useAudio.ts
import { useAudioContext } from '../context/AudioContext';

export const useAudio = () => {
    const audioContext = useAudioContext();
    
    return {
        ...audioContext
    };
};
