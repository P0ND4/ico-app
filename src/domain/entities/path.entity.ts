export type PathMode = 'standard' | 'deep';
export type PathStatus = 'active' | 'completed' | 'archived' | 'generating';
export type ChapterStatus = 'locked' | 'current' | 'completed';
export type LessonType = 'theory' | 'concept' | 'example' | 'multiple_choice' | 'true_false' | 'open_ended';

export interface LearningPath {
  id: string;
  title: string;
  topic: string;
  description: string | null;
  mode: PathMode;
  status: PathStatus;
  totalXp: number;
  earnedXp: number;
  chapterCount: number;
  completedChapterCount: number;
  createdAt: string;
  deletedAt: string | null;
  chapters?: Chapter[];
}

export interface Chapter {
  id: string;
  pathId: string;
  title: string;
  order: number;
  status: ChapterStatus;
  maxXp: number;
  earnedXp: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string | null;
  createdAt: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  chapterId: string;
  type: LessonType;
  title: string | null;
  content: string;
  question: string | null;
  options: string[] | null;
  correctIndex: number | null;
  correctAnswer: boolean | null;
  points: number;
  order: number;
}

export interface PathGenerationJob {
  jobId: string;
  pathId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  progressLabel?: string | null;
}

export interface GeneratePathDto {
  topic: string;
  mode: PathMode;
}

export interface CompleteChapterDto {
  earnedXp: number;
  correctCount: number;
  totalQuestions: number;
}

export interface RecordAnswerDto {
  selectedIndex?: number;
  selectedAnswer?: boolean;
  isCorrect: boolean;
}

export interface CompleteChapterResult {
  chapter: Chapter;
  nextChapterUnlocked: boolean;
  pathCompleted: boolean;
}
