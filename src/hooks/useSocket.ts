//src/hooks/useSocket.ts
import { useSocketContext } from '../context/SocketContext';

export const useSocket = () => {
    return useSocketContext();
};
