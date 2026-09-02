//src/services/socketService.ts
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.EXPO_PUBLIC_API_URL || '';
const SOCKET_URL = API_URL.replace('/api', '');

type EventCallback = (data: any) => void;
type StatusCallback = (connected: boolean) => void;

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private currentUserId: string | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private statusListeners: Set<StatusCallback> = new Set();

  connect(userId: string, token?: string) {
    if (!SOCKET_URL || !userId) return;

    if (this.socket && this.socket.connected && this.isConnected && this.currentUserId === userId) {
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
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 15000,
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.socket?.emit('join', userId);
      this.notifyStatus(true);
      this.rebindAllListeners();
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.notifyStatus(false);
    });

    this.socket.on('connect_error', () => {
      this.isConnected = false;
      this.notifyStatus(false);
    });

    this.rebindAllListeners();
  }

  reconnect(userId: string, token?: string) {
    if (!SOCKET_URL || !userId) return;
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    } else if (!this.socket) {
      this.connect(userId, token);
    }
  }

  private rebindAllListeners() {
    if (!this.socket) return;
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((cb) => {
        this.socket?.off(event, cb);
        this.socket?.on(event, cb);
      });
    });
  }

  private notifyStatus(status: boolean) {
    this.statusListeners.forEach((cb) => cb(status));
  }

  onStatusChange(callback: StatusCallback): () => void {
    this.statusListeners.add(callback);
    callback(this.isConnected);
    return () => this.statusListeners.delete(callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentUserId = null;
      this.notifyStatus(false);
    }
  }

  emit(event: string, data: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback: EventCallback) {
    this.listeners.get(event)?.delete(callback);
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isSocketConnected(): boolean {
    return this.isConnected;
  }
}

const socketService = new SocketService();
export default socketService;