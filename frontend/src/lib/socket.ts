import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';

let socket: Socket | null = null;

/**
 * Lazily creates a single shared socket connection. Connecting to the same
 * origin (no URL passed to `io()`) so the dev server's `/socket.io` proxy
 * (see vite.config.ts) and any production reverse proxy both just work,
 * mirroring how axios.ts uses a relative '/api' baseURL.
 */
export const getSocket = (): Socket => {
  if (!socket) {
    socket = io({
      autoConnect: false,
      // A function (not a plain object) so socket.io-client re-reads the
      // current access token on every (re)connect attempt, in case it refreshed.
      auth: (cb) => cb({ token: useAuthStore.getState().accessToken }),
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = () => {
  socket?.disconnect();
};