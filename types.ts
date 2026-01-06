
export interface Question {
  id: string;
  type: 'vocabulary' | 'grammar';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface LevelData {
  level: number;
  questions: Question[];
  isLocked: boolean;
  score?: number;
}

export interface AppState {
  fileBase64: string | null;
  fileName: string | null;
  currentLevel: number | null;
  levels: LevelData[];
  isAnalyzing: boolean;
  isGenerating: boolean;
}
