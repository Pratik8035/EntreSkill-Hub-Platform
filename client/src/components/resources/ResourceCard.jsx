import React from 'react';
import { ExternalLink, BookOpen, Video, GraduationCap } from 'lucide-react';

const typeConfig = {
  Article: {
    icon: BookOpen,
    badge: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
  },
  Video: {
    icon: Video,
    badge: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900',
  },
  Course: {
    icon: GraduationCap,
    badge: 'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900',
  },
};

const ResourceCard = ({ resource }) => {
  const config = typeConfig[resource.type] || typeConfig.Article;
  const Icon = config.icon;

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${config.badge}`}>
          {resource.type}
        </span>
      </div>

      <div className="flex-1 space-y-2">
        <h3 className="font-outfit text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
          {resource.title}
        </h3>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Open resource</span>
        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
      </div>
    </a>
  );
};

export default ResourceCard;
