import { useEffect, useRef, useState } from 'react';
import { messageApi } from '@/api/message.api';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { Message } from '@/types';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { Loader2 } from 'lucide-react';

interface ChatWindowProps {
  teamId: string;
  currentUserId: string;
}

export default function ChatWindow({ teamId, currentUserId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());

  const socketRef = useRef(connectSocket());

  useEffect(() => {
    let cancelled = false;
    const socket = socketRef.current;

    const loadHistory = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await messageApi.getForTeam(teamId, { limit: 50 });
        if (!cancelled) setMessages(res.data.messages);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadHistory();

    const joinRoom = () => {
      socket.emit('join_team', teamId, (res: { success: boolean; onlineUsers?: { userId: string; name: string }[]; message?: string }) => {
        if (res.success && res.onlineUsers) {
          setOnlineUserIds(new Set(res.onlineUsers.map((u) => u.userId)));
        } else if (!res.success) {
          setConnectionError(res.message || 'Could not join this team\u2019s chat room.');
        }
      });
    };

    const onConnect = () => {
      setConnected(true);
      setConnectionError(null);
      joinRoom();
    };
    const onDisconnect = () => setConnected(false);
    const onConnectError = (err: Error) => {

      console.error('Socket connection failed:', err.message);
      setConnectionError(
        err.message === 'websocket error'
          ? 'Could not reach the chat server. Is the backend running?'
          : err.message
      );
    };

    const onReceiveMessage = (msg: Message) => {
      setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
    };

    const onUserOnline = ({ userId }: { userId: string }) => {
      setOnlineUserIds((prev) => new Set(prev).add(userId));
    };

    const onUserOffline = ({ userId }: { userId: string }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    const onTypingStart = ({ userId, name }: { userId: string; name: string }) => {
      if (userId === currentUserId) return;
      setTypingUsers((prev) => new Map(prev).set(userId, name));
    };

    const onTypingStop = ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('receive_message', onReceiveMessage);
    socket.on('user_online', onUserOnline);
    socket.on('user_offline', onUserOffline);
    socket.on('typing_start', onTypingStart);
    socket.on('typing_stop', onTypingStop);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      cancelled = true;
      socket.emit('leave_team', teamId);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('receive_message', onReceiveMessage);
      socket.off('user_online', onUserOnline);
      socket.off('user_offline', onUserOffline);
      socket.off('typing_start', onTypingStart);
      socket.off('typing_stop', onTypingStop);
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  const handleSend = (text: string) => {
    socketRef.current.emit('send_message', { teamId, message: text }, (res: { success: boolean; message?: string }) => {
      if (!res.success) alert(res.message || 'Failed to send message');
    });
  };

  return (
    <div className="flex flex-col h-[70vh] border rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="px-4 py-2.5 border-b flex items-center justify-between bg-slate-50">
        <span className="text-sm font-medium text-slate-600">
          {onlineUserIds.size} online
        </span>
        <span className={`text-xs flex items-center gap-1.5 ${connected ? 'text-green-600' : connectionError ? 'text-red-500' : 'text-slate-400'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-green-500' : connectionError ? 'bg-red-500' : 'bg-slate-300'}`} />
          {connected ? 'Live' : connectionError ? 'Connection failed' : 'Connecting...'}
        </span>
      </div>

      {connectionError && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-100 text-xs text-red-600">
          {connectionError}
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading messages...
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
          <p>Unable to load messages.</p>
        </div>
      ) : (
        <MessageList messages={messages} currentUserId={currentUserId} onlineUserIds={onlineUserIds} />
      )}

      <TypingIndicator typingNames={[...typingUsers.values()]} />

      <MessageInput
        onSend={handleSend}
        onTypingStart={() => socketRef.current.emit('typing_start', teamId)}
        onTypingStop={() => socketRef.current.emit('typing_stop', teamId)}
        disabled={!connected || loading}
      />
    </div>
  );
}