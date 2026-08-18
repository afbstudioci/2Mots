//src/services/socketService.ts
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.EXPO_PUBLIC_API_URL || '';
const SOCKET_URL = API_URL.replace('/api', '');

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private currentUserId: string | null = null;

  connect(userId: string, token?: string) {
    if (!SOCKET_URL || !userId) return;

    if (this.socket && this.isConnected && this.currentUserId === userId) {
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.currentUserId = userId;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 8000,
      timeout: 20000,
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.socket?.emit('join', userId);
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
    });

    this.socket.on('connect_error', () => {
      this.isConnected = false;
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentUserId = null;
    }
  }

  emit(event: string, data: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

const socketService = new SocketService();
export default socketService;