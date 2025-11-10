
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { SaveIcon } from './icons/SaveIcon';

interface SummaryDisplayProps {
  summary: string;
  isLoading: boolean;
  error: string | null;
  isSaved: boolean;
  onSave: () => void;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
    <svg className="animate-spin h-10 w-10 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="text-lg">AIが要約を生成中です...</p>
    <p className="text-sm">しばらくお待ちください</p>
  </div>
);

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary, isLoading, error, isSaved, onSave }) => {
  const formatSummary = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
          return <li key={index} className="mb-2">{line.trim().substring(2)}</li>;
        }
        if (line.trim().match(/^\d+\./)) {
           return <li key={index} className="mb-2">{line.trim().substring(line.indexOf('.') + 1).trim()}</li>;
        }
        return <p key={index} className="mb-4">{line}</p>;
      })
      .reduce((acc, curr, index) => {
        if (curr.type === 'li') {
          if (index > 0 && acc.length > 0 && acc[acc.length - 1].type === 'ul') {
            (acc[acc.length - 1].props.children as React.ReactElement[]).push(curr);
          } else {
             acc.push(<ul key={`ul-${index}`} className="list-disc list-inside pl-4">{[curr]}</ul>);
          }
        } else {
           acc.push(curr);
        }
        return acc;
      }, [] as React.ReactElement[]);
  };

  return (
    <div className="bg-slate-800 border-2 border-slate-700 rounded-lg flex-grow flex flex-col min-h-[300px] lg:min-h-0">
       <div className="flex justify-between items-center p-4 border-b border-slate-700/50">
        <h2 className="text-xl font-semibold text-sky-400">要約結果</h2>
        {summary && !isLoading && !error && !isSaved && (
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-3 py-1 text-sm border border-slate-600 text-slate-300 rounded-md hover:bg-slate-700 hover:text-white transition-colors"
            aria-label="この要約を保存する"
          >
            <SaveIcon className="w-4 h-4" />
            保存
          </button>
        )}
      </div>
      <div className="p-4 flex-grow h-full overflow-y-auto">
        {isLoading ? (
            <LoadingSpinner />
        ) : error ? (
            <div className="flex items-center justify-center h-full text-red-400">
            <p>{error}</p>
            </div>
        ) : summary ? (
            <div className="prose prose-invert prose-p:text-slate-300 prose-li:text-slate-300 prose-headings:text-sky-400 max-w-none w-full h-full">
            {formatSummary(summary)}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                <SparklesIcon className="w-12 h-12" />
            <p className="text-lg">ここに要約結果が表示されます</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SummaryDisplay;
