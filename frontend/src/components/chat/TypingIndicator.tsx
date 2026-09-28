interface TypingIndicatorProps {
  typingNames: string[];
}

export default function TypingIndicator({ typingNames }: TypingIndicatorProps) {
  if (typingNames.length === 0) return <div className="h-5" />;

  const label =
    typingNames.length === 1
      ? `${typingNames[0]} is typing...`
      : typingNames.length === 2
        ? `${typingNames[0]} and ${typingNames[1]} are typing...`
        : `${typingNames.length} people are typing...`;

  return (
    <div className="h-5 px-4 flex items-center gap-1.5 text-xs text-slate-400 italic">
      <span className="flex gap-0.5">
        <span className="h-1 w-1 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1 w-1 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1 w-1 rounded-full bg-slate-400 animate-bounce" />
      </span>
      {label}
    </div>
  );
}