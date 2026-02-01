import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import AnalysisResult from './components/AnalysisResult';
import { analyzeDocument } from './services/geminiService';
import { AnalysisState } from './types';
import { TrendingUp, ShieldCheck, Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AnalysisState>({
    status: 'idle',
    data: null,
    error: null,
    fileName: null,
  });

  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync dark mode state with DOM
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleFileSelect = async (file: File) => {
    setState({ status: 'uploading', data: null, error: null, fileName: file.name });
    
    // Simulate a brief upload/processing delay for better UX before API call
    setTimeout(async () => {
      setState(prev => ({ ...prev, status: 'analyzing' }));
      try {
        const result = await analyzeDocument(file);
        setState({ status: 'complete', data: result, error: null, fileName: file.name });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
        setState({ status: 'error', data: null, error: errorMessage, fileName: file.name });
      }
    }, 800);
  };

  const handleReset = () => {
    setState({ status: 'idle', data: null, error: null, fileName: null });
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-black flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-black border-b border-slate-200 dark:border-green-900/30 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 dark:bg-green-600 p-2 rounded-lg transition-colors">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-green-500 tracking-tight transition-colors">Loan AI Analyzer</h1>
                <p className="text-xs text-slate-500 dark:text-green-400/60 hidden sm:block">Full Spectrum Credit Analyzer</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium border border-green-100 dark:border-green-900/50 transition-colors">
                <ShieldCheck className="w-4 h-4" />
                Bank-Grade Analysis
              </div>
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-green-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto h-full">
          
          {state.status === 'idle' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
              <div className="text-center max-w-4xl mx-auto mb-12">
                <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight transition-colors">
                  Will the bank <span className="text-blue-600 dark:text-green-500">approve</span> this loan?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
                   <div className="bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-slate-100 dark:border-green-900/30 shadow-sm transition-colors">
                      <div className="text-blue-600 dark:text-green-400 font-bold mb-2">1. Cash Flow</div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Can they make monthly payments? (DSCR ≥ 1.25x)</p>
                   </div>
                   <div className="bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-slate-100 dark:border-green-900/30 shadow-sm transition-colors">
                      <div className="text-blue-600 dark:text-green-400 font-bold mb-2">2. Leverage</div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Is the debt load too high? (Debt/EBITDA &lt; 3.0x)</p>
                   </div>
                   <div className="bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-slate-100 dark:border-green-900/30 shadow-sm transition-colors">
                      <div className="text-blue-600 dark:text-green-400 font-bold mb-2">3. Liquidity</div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Can they survive short-term? (Current Ratio ≥ 1.2x)</p>
                   </div>
                   <div className="bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-slate-100 dark:border-green-900/30 shadow-sm transition-colors">
                      <div className="text-blue-600 dark:text-green-400 font-bold mb-2">4. Solvency</div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Do owners have skin in the game? (Debt/Equity ≤ 2.5x)</p>
                   </div>
                </div>
              </div>
              <div className="w-full">
                <FileUpload onFileSelect={handleFileSelect} />
              </div>
            </div>
          )}

          {(state.status === 'uploading' || state.status === 'analyzing') && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
               <div className="relative">
                 <div className="w-24 h-24 border-4 border-blue-100 dark:border-green-900 rounded-full animate-spin border-t-blue-600 dark:border-t-green-500"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                   <TrendingUp className="w-8 h-8 text-blue-600 dark:text-green-500" />
                 </div>
               </div>
               <h3 className="mt-8 text-xl font-semibold text-slate-800 dark:text-white">
                 {state.status === 'uploading' ? 'Reading Document...' : 'Performing 4-Step Analysis...'}
               </h3>
               <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-md text-center">
                 Our AI is checking Cash Flow, Debt Load, Liquidity, and Solvency ratios against banking standards.
               </p>
            </div>
          )}

          {state.status === 'error' && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in">
              <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-2xl border border-red-100 dark:border-red-900/50 max-w-md text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Analysis Failed</h3>
                <p className="text-sm text-gray-500 dark:text-gray-300 mb-6">{state.error}</p>
                <button 
                  onClick={handleReset}
                  className="w-full inline-flex justify-center rounded-lg bg-red-600 hover:bg-red-500 text-white px-3 py-2 text-sm font-semibold shadow-sm sm:w-auto transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {state.status === 'complete' && state.data && (
            <AnalysisResult data={state.data} onReset={handleReset} />
          )}
        </div>
      </main>
      
      <footer className="bg-white dark:bg-black border-t border-slate-200 dark:border-green-900/30 mt-auto transition-colors">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            Powered by Gemini 3.0 Pro &bull; Private & Secure Analysis &bull; Not Financial Advice
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
