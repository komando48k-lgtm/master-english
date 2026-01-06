
import React, { useState, useEffect } from 'react';
import { AppState, LevelData, Question } from './types';
import FileUploader from './components/FileUploader';
import LevelGrid from './components/LevelGrid';
import TestView from './components/TestView';
import { generateLevelQuestions } from './services/geminiService';

const TOTAL_LEVELS = 16;

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    fileBase64: null,
    fileName: null,
    currentLevel: null,
    levels: Array.from({ length: TOTAL_LEVELS }, (_, i) => ({
      level: i + 1,
      questions: [],
      isLocked: i !== 0,
    })),
    isAnalyzing: false,
    isGenerating: false,
  });

  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);

  const handleFileUpload = (base64: string, name: string) => {
    setState(prev => ({ ...prev, fileBase64: base64, fileName: name }));
  };

  const handleSelectLevel = async (levelNumber: number) => {
    const levelIndex = levelNumber - 1;
    const levelData = state.levels[levelIndex];

    if (levelData.questions.length > 0) {
      setActiveQuestions(levelData.questions);
      setState(prev => ({ ...prev, currentLevel: levelNumber }));
    } else {
      if (!state.fileBase64) return;
      
      setState(prev => ({ ...prev, isGenerating: true }));
      try {
        const questions = await generateLevelQuestions(state.fileBase64, levelNumber, TOTAL_LEVELS);
        
        const newLevels = [...state.levels];
        newLevels[levelIndex].questions = questions;
        
        setState(prev => ({
          ...prev,
          levels: newLevels,
          currentLevel: levelNumber,
          isGenerating: false,
        }));
        setActiveQuestions(questions);
      } catch (error) {
        console.error("Error generating questions:", error);
        setState(prev => ({ ...prev, isGenerating: false }));
        alert("حدث خطأ أثناء توليد الأسئلة. يرجى المحاولة مرة أخرى.");
      }
    }
  };

  const handleTestComplete = (score: number) => {
    const levelIndex = (state.currentLevel || 1) - 1;
    const newLevels = [...state.levels];
    
    // Update score
    newLevels[levelIndex].score = score;
    
    // Unlock next level if score is high enough (e.g., 7/10)
    if (score >= 7 && levelIndex < TOTAL_LEVELS - 1) {
      newLevels[levelIndex + 1].isLocked = false;
    }

    setState(prev => ({ ...prev, levels: newLevels }));
  };

  const handleReset = () => {
    if (confirm("هل أنت متأكد من رغبتك في مسح الملف والبدء من جديد؟")) {
      setState({
        fileBase64: null,
        fileName: null,
        currentLevel: null,
        levels: Array.from({ length: TOTAL_LEVELS }, (_, i) => ({
          level: i + 1,
          questions: [],
          isLocked: i !== 0,
        })),
        isAnalyzing: false,
        isGenerating: false,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center py-12 px-4">
      <header className="mb-12 text-center">
        <div className="inline-block p-3 bg-indigo-600 rounded-2xl shadow-lg mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">AI English Master</h1>
        <p className="text-gray-500 font-medium">حوّل ملفات الـ PDF الخاصة بك إلى رحلة تعلم ممتعة</p>
      </header>

      <main className="w-full max-w-4xl flex flex-col items-center">
        {!state.fileBase64 ? (
          <FileUploader onUpload={handleFileUpload} isLoading={state.isAnalyzing} />
        ) : state.currentLevel ? (
          <TestView 
            level={state.currentLevel} 
            questions={activeQuestions} 
            onComplete={handleTestComplete}
            onExit={() => setState(prev => ({ ...prev, currentLevel: null }))}
          />
        ) : (
          <div className="w-full">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 line-clamp-1">{state.fileName}</h4>
                  <p className="text-xs text-gray-400">ملف جاهز للتحليل</p>
                </div>
              </div>
              <button 
                onClick={handleReset}
                className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                title="تغيير الملف"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-4 px-4">خريطة التعلم (16 مستوى)</h3>
            {state.isGenerating ? (
              <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl shadow-lg border border-indigo-50">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
                  </div>
                </div>
                <p className="mt-6 text-indigo-600 font-bold text-lg animate-pulse">جاري تحضير أسئلة المستوى بواسطة الذكاء الاصطناعي...</p>
              </div>
            ) : (
              <LevelGrid levels={state.levels} onSelectLevel={handleSelectLevel} />
            )}
          </div>
        )}
      </main>

      <footer className="mt-20 text-gray-400 text-sm flex items-center gap-2">
        <span>Powered by Gemini AI</span>
        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
        <span>Made with ❤️ for English Learners</span>
      </footer>
    </div>
  );
};

export default App;
