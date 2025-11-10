
import React from 'react';
import { TrashIcon } from './icons/TrashIcon';

export interface SavedSummary {
  id: string;
  title: string;
  originalText: string;
  summary: string;
  timestamp: Date;
}

interface SavedSummariesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  savedSummaries: SavedSummary[];
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

const SavedSummariesSidebar: React.FC<SavedSummariesSidebarProps> = ({
  isOpen,
  onClose,
  savedSummaries,
  onView,
  onDelete,
}) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-20 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-700/50 shadow-2xl z-30 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
      >
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <h2 id="sidebar-title" className="text-xl font-semibold text-sky-400">
              保存した要約
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              aria-label="閉じる"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>
          <div className="flex-grow overflow-y-auto p-4">
            {savedSummaries.length > 0 ? (
              <ul className="space-y-3">
                {savedSummaries.slice().reverse().map((item) => (
                  <li key={item.id}>
                    <div
                      className="group p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700/80 transition-colors duration-200 block"
                      onClick={() => onView(item.id)}
                      onKeyDown={(e) => e.key === 'Enter' && onView(item.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-grow min-w-0">
                            <h3 className="font-semibold text-slate-200 truncate pr-2">
                                {item.title}
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">
                                {new Intl.DateTimeFormat('ja-JP', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                                }).format(item.timestamp)}
                            </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item.id);
                          }}
                          className="p-2 -mr-2 -mt-1 rounded-full text-slate-500 hover:bg-red-500/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
                          aria-label={`「${item.title}」を削除`}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-slate-500 h-full flex flex-col justify-center items-center">
                <p>保存された要約はありません。</p>
                <p className="text-sm mt-2">要約を作成して保存すると、ここに表示されます。</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default SavedSummariesSidebar;
