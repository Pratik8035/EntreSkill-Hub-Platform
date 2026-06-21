import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex items-center space-x-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none max-w-[120px]">
      <span className="sr-only">AI is typing...</span>
      <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce"></div>
    </div>
  );
};

export default TypingIndicator;
