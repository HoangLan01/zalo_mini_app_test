import { create } from 'zustand';

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface Question {
  id: string;
  content: string;
  type: QuestionType;
  options?: string[]; // A, B, C, D
  correctAnswer: string;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number; // in seconds
  questions: Question[];
  status: 'open' | 'closed';
}

export interface QuizAttempt {
  quizId: string;
  answers: Record<string, string>; // questionId -> answer
  score: number;
  timeTaken: number; // in seconds
  completedAt: string;
}

interface QuizState {
  quizzes: Quiz[];
  attempts: QuizAttempt[]; // For MVP mock persistence
  getQuizById: (id: string) => Quiz | undefined;
  saveAttempt: (attempt: QuizAttempt) => void;
  getAttempt: (quizId: string) => QuizAttempt | undefined;
}

const mockQuestions: Question[] = [
  {
    id: 'q1',
    content: 'Chuyển đổi số là gì?',
    type: 'multiple_choice',
    options: [
      'Là việc số hóa giấy tờ',
      'Là việc ứng dụng công nghệ thông tin vào mọi hoạt động',
      'Là quá trình thay đổi tổng thể và toàn diện của cá nhân, tổ chức về cách sống, cách làm việc và phương thức sản xuất dựa trên công nghệ số',
      'Là việc mua sắm máy tính và phần mềm mới'
    ],
    correctAnswer: 'Là quá trình thay đổi tổng thể và toàn diện của cá nhân, tổ chức về cách sống, cách làm việc và phương thức sản xuất dựa trên công nghệ số',
    points: 10
  },
  {
    id: 'q2',
    content: 'Ứng dụng VNeID do cơ quan nào quản lý?',
    type: 'multiple_choice',
    options: [
      'Bộ Thông tin và Truyền thông',
      'Bộ Công an',
      'Bộ Y tế',
      'Ủy ban nhân dân các cấp'
    ],
    correctAnswer: 'Bộ Công an',
    points: 10
  },
  {
    id: 'q3',
    content: 'Đăng ký tài khoản Định danh điện tử mức độ 2 phải ra cơ quan Công an. Đúng hay sai?',
    type: 'true_false',
    options: ['Đúng', 'Sai'],
    correctAnswer: 'Đúng',
    points: 10
  }
];

const mockQuizzes: Quiz[] = [
  {
    id: 'quiz-001',
    title: 'Kiến thức Chuyển đổi số Cơ bản',
    description: 'Bài kiểm tra kiến thức về các khái niệm và dịch vụ công phổ biến trong công cuộc Chuyển đổi số quốc gia.',
    timeLimit: 300, // 5 minutes
    questions: mockQuestions,
    status: 'open'
  },
  {
    id: 'quiz-002',
    title: 'An toàn thông tin trên không gian mạng',
    description: 'Nhận biết các rủi ro lừa đảo và cách bảo vệ thông tin cá nhân.',
    timeLimit: 600, // 10 minutes
    questions: [], // Mock empty for visual
    status: 'closed'
  }
];

export const useQuizStore = create<QuizState>((set, get) => ({
  quizzes: mockQuizzes,
  attempts: [],
  getQuizById: (id) => get().quizzes.find(q => q.id === id),
  saveAttempt: (attempt) => set((state) => ({
    attempts: [...state.attempts, attempt]
  })),
  getAttempt: (quizId) => get().attempts.find(a => a.quizId === quizId)
}));
