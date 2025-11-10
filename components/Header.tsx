
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { HistoryIcon } from './icons/HistoryIcon';

interface HeaderProps {
  onToggleSidebar: () => void;
  savedCount: number;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, savedCount }) => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 text-sky-400" />
            <div>
            <h1 className="text-2xl font-bold text-slate-50 tracking-wide">
                AI 資料要約ツール
            </h1>
            <p className="text-sm text-slate-400">
                Gemini API を利用した高精度なテキスト要約
            </p>
            </div>
        </div>

        <button
          onClick={onToggleSidebar}
          className="relative p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          aria-label="保存した要約を表示"
        >
          <HistoryIcon className="w-6 h-6" />
          {savedCount > 0 && (
            <span className="absolute top-0 right-0 flex items-center justify-center h-5 w-5 rounded-full bg-sky-500 text-white text-xs font-bold ring-2 ring-slate-800/50">
              {savedCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
