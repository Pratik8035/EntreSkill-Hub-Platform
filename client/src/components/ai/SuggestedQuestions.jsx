import React from 'react';
import { HelpCircle } from 'lucide-react';

const SuggestedQuestions = ({ questions = [], onSelect }) => {
  const defaultQuestions = [
    "How do I register a micro-business in my region?",
    "What are some low-cost marketing strategies for tailors?",
    "How should I price my tailoring alterations?",
    "What are typical initial tools required for startup sewing?",
    "Can you explain tax compliance for micro-entrepreneurs?"
  ];

  const displayQuestions = questions.length > 0 ? questions : defaultQuestions;

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
        <span>Ask the AI Mentor</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {displayQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(q)}
            className="text-left px-4 py-3 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 shadow-sm hover:shadow group flex items-start space-x-2"
          >
            <span className="text-primary-500 group-hover:translate-x-0.5 transition-transform">→</span>
            <span className="line-clamp-2">{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;
