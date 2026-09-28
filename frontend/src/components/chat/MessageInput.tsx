import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSend: (text: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  disabled?: boolean;
}

const TYPING_STOP_DELAY = 2000;

export default function MessageInput({ onSend, onTypingStart, onTypingStop, disabled }: MessageInputProps) {
  const [value, setValue] = useState('');
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTypingStart();
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      isTypingRef.current = false;
      onTypingStop();
    }, TYPING_STOP_DELAY);
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setValue('');

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    isTypingRef.current = false;
    onTypingStop();
  };

  return (
    <div className="flex items-center gap-2 p-3 border-t bg-white">
      <input
        value={value}
        onChange={handleChange}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1 h-10 rounded-full border border-input bg-background px-4 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
      />
      <Button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        size="icon"
        className="rounded-full bg-violet-600 hover:bg-violet-700 shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}