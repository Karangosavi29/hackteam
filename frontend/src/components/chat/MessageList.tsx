import { useEffect, useRef } from 'react';
import { Message } from '@/types';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onlineUserIds: Set<string>;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function MessageList({ messages, currentUserId, onlineUserIds }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
        No messages yet — say hi to the team 👋
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      {messages.map((msg, i) => {
        const isMe = msg.senderId?._id === currentUserId;
        const prev = messages[i - 1];
        const showSender = !prev || prev.senderId?._id !== msg.senderId?._id;

        return (
          <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
              {showSender && !isMe && (
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <div className="h-5 w-5 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-[10px]">
                    {msg.senderId?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-slate-500">{msg.senderId?.name}</span>
                  {onlineUserIds.has(msg.senderId?._id) && (
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" title="Online" />
                  )}
                </div>
              )}
              <div
                className={`rounded-2xl px-3.5 py-2 text-sm leading-snug ${
                  isMe
                    ? 'bg-violet-600 text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                }`}
              >
                {msg.message}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{formatTime(msg.createdAt)}</span>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}