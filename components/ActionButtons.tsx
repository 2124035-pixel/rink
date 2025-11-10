
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface ActionButtonsProps {
  onSummarize: () => void;
  onClear: () => void;
  isSummarizing: boolean;
  isInputEmpty: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onSummarize, onClear, isSummarizing, isInputEmpty }) => {
  const summarizeDisabled = isSummarizing || isInputEmpty;

  return (
    <div className="sticky bottom-0 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700/50 py-4 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto flex justify-end items-center gap-4">
        <button
          onClick={onClear}
          disabled={isSummarizing}
          className="px-6 py-2 border border-slate-600 text-slate-300 rounded-md hover:bg-slate-700 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          クリア
        </button>
        <button
          onClick={onSummarize}
          disabled={summarizeDisabled}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-500 transition-colors duration-200 disabled:bg-sky-800/50 disabled:text-slate-400 disabled:cursor-not-allowed shadow-lg shadow-sky-900/50"
        >
          {isSummarizing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              処理中...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              要約する
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;
