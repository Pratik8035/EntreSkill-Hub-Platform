import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Rocket, User } from 'lucide-react';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
        isUser
          ? 'bg-slate-100 border border-slate-200 text-slate-600'
          : 'bg-gradient-to-tr from-primary-600 to-secondary-500 text-white shadow-primary-100'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Rocket className="w-4.5 h-4.5" />}
      </div>

      {/* Message bubble */}
      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-primary-600 text-white rounded-tr-none'
            : 'bg-white dark:bg-slate-800 dark:border-slate-700 border border-slate-100 text-slate-800 dark:text-slate-100 rounded-tl-none'
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-200">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2 pl-3" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2 pl-3" {...props} />,
                  li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
                  code: ({ node, inline, ...props }) => 
                    inline ? (
                      <code className="bg-slate-100 dark:bg-slate-700 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded text-xs font-mono font-semibold" {...props} />
                    ) : (
                      <pre className="bg-slate-950 text-slate-100 p-3 rounded-xl overflow-x-auto text-xs font-mono my-2"><code {...props} /></pre>
                    )
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium px-1">
          {new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
