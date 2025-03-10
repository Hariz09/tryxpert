// Base types
export interface Question {
    id: number;
    tryout_id: number;
    question_text: string;
    question_type: "multiple_choice" | "true_false" | "essay";
    options?: string[];
    correct_answer: string;
    explanation?: string;
    points: number;
    order_number: number;
  }
  
  export interface Tryout {
    id: number;
    title: string;
    description?: string;
    subject: string;
    difficulty: string;
    time_limit?: number;
    created_at: string;
    updated_at: string;
  }
  
  // Extended tryout type that includes questions
  export interface TryoutWithQuestions extends Tryout {
    questions?: Question[];
  }
  
  // User answers type
  export interface UserAnswer {
    questionId: number;
    answeredOption: string | null;
    essayAnswer: string | null;
    isCorrect: boolean;
  }
  
  // Results type
  export interface TryoutResults {
    tryout: TryoutWithQuestions;
    userAnswers: UserAnswer[];
    score: number;
    maxScore: number;
    percentageScore: number;
    startTime: string;
    endTime: string;
    timeTaken: number; // in seconds
    answeredCorrectly: number;
    answeredWrong: number;
    unanswered: number;
  }