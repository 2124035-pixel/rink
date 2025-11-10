
import React, { useState, useCallback, useEffect } from 'react';
import { summarizeText } from './services/geminiService';
import Header from './components/Header';
import TextInput from './components/TextInput';
import SummaryDisplay from './components/SummaryDisplay';
import ActionButtons from './components/ActionButtons';
import FileLoader from './components/FileLoader';
import SavedSummariesSidebar, { SavedSummary } from './components/SavedSummariesSidebar';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [savedSummaries, setSavedSummaries] = useState<SavedSummary[]>(() => {
    try {
      const localData = localStorage.getItem('savedSummaries');
      return localData ? JSON.parse(localData).map((item: any) => ({...item, timestamp: new Date(item.timestamp)})) : [];
    } catch (error) {
      console.error("Could not parse saved summaries from localStorage", error);
      return [];
    }
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isCurrentSummarySaved, setIsCurrentSummarySaved] = useState<boolean>(false);
  
  useEffect(() => {
    try {
      localStorage.setItem('savedSummaries', JSON.stringify(savedSummaries));
    } catch (error) {
      console.error("Could not save summaries to localStorage", error);
    }
  }, [savedSummaries]);

  const handleSummarize = useCallback(async () => {
    if (!inputText.trim()) {
      setError('要約するテキストを入力してください。');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSummary('');
    setIsCurrentSummarySaved(false);

    try {
      const result = await summarizeText(inputText);
      setSummary(result);
    } catch (e) {
      setError('要約の生成中にエラーが発生しました。しばらくしてからもう一度お試しください。');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [inputText]);

  const handleClear = useCallback(() => {
    setInputText('');
    setSummary('');
    setError(null);
    setIsLoading(false);
    setIsCurrentSummarySaved(false);
  }, []);

  const handleFileLoad = useCallback((content: string) => {
    setInputText(content);
    setError(null);
  }, []);

  const handleFileError = useCallback((message: string) => {
    setError(message);
  }, []);

  const handleSaveSummary = useCallback(() => {
    if (!summary || isCurrentSummarySaved) return;

    const newSummary: SavedSummary = {
      id: new Date().toISOString() + Math.random(),
      title: inputText.substring(0, 40).replace(/\n/g, ' ') + (inputText.length > 40 ? '...' : ''),
      originalText: inputText,
      summary: summary,
      timestamp: new Date(),
    };
    setSavedSummaries(prev => [...prev, newSummary]);
    setIsCurrentSummarySaved(true);
  }, [inputText, summary, isCurrentSummarySaved]);

  const handleDeleteSummary = useCallback((id: string) => {
    setSavedSummaries(prev => prev.filter(item => item.id !== id));
    handleClear(); // If the deleted one was being viewed, clear the view
  }, [handleClear]);
  
  const handleViewSummary = useCallback((id: string) => {
    const summaryToView = savedSummaries.find(item => item.id === id);
    if (summaryToView) {
      setInputText(summaryToView.originalText);
      setSummary(summaryToView.summary);
      setError(null);
      setIsLoading(false);
      setIsCurrentSummarySaved(true);
      setIsSidebarOpen(false);
    }
  }, [savedSummaries]);
  
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={toggleSidebar} savedCount={savedSummaries.length} />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-sky-400">原文</h2>
              <FileLoader 
                onFileLoad={handleFileLoad} 
                onError={handleFileError}
                disabled={isLoading} 
              />
            </div>
            <TextInput
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="ここに要約したいテキストを貼り付けるか、ファイルを読み込んでください..."
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col gap-4">
            <SummaryDisplay
              summary={summary}
              isLoading={isLoading}
              error={error}
              isSaved={isCurrentSummarySaved}
              onSave={handleSaveSummary}
            />
          </div>
        </div>
      </main>
      <ActionButtons
        onSummarize={handleSummarize}
        onClear={handleClear}
        isSummarizing={isLoading}
        isInputEmpty={!inputText.trim()}
      />
      <SavedSummariesSidebar
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
        savedSummaries={savedSummaries}
        onView={handleViewSummary}
        onDelete={handleDeleteSummary}
      />
    </div>
  );
};

export default App;
