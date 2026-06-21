import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

const ChatInput = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3.5 items-end">
      <div className="relative flex-1 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm focus-within:border-primary-500 dark:focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-500/30 transition-all px-4 py-2.5 flex items-end">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your mentor about business registrations, tax, marketing..."
          disabled={disabled}
          className="w-full resize-none bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm max-h-32 min-h-[24px] pr-10 py-1"
        />
        <div className="absolute right-3.5 bottom-3.5 text-slate-350 dark:text-slate-500">
          <Sparkles className="w-4 h-4 animate-pulse text-primary-400" />
        </div>
      </div>
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className={`p-3.5 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
          text.trim() && !disabled
            ? 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-md shadow-primary-100 hover:shadow-lg'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
};

export default ChatInput;
