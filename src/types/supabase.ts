export type Database = {
  public: {
    Tables: {
      tryouts: {
        Row: {
          id: number;
          title: string;
          subject: string;
          start_date: string; // ISO string format for timestamp
          end_date: string; // ISO string format for timestamp
          duration: number;
          difficulty: 'Mudah' | 'Menengah' | 'Sulit';
          participants: number;
          syllabus: string[];
          features: string[];
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: number;
          title: string;
          subject: string;
          start_date: string;
          end_date: string;
          duration: number;
          difficulty: 'Mudah' | 'Menengah' | 'Sulit';
          participants?: number;
          syllabus?: string[];
          features?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          subject?: string;
          start_date?: string;
          end_date?: string;
          duration?: number;
          difficulty?: 'Mudah' | 'Menengah' | 'Sulit';
          participants?: number;
          syllabus?: string[];
          features?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
          id: number;
          tryout_id: number;
          question_text: string;
          question_type: 'multiple_choice' | 'essay' | 'true_false';
          options?: string[]; // Array of options for multiple choice
          correct_answer: string;
          explanation?: string;
          points: number;
          order_number: number;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: number;
          tryout_id: number;
          question_text: string;
          question_type: 'multiple_choice' | 'essay' | 'true_false';
          options?: string[];
          correct_answer: string;
          explanation?: string;
          points?: number;
          order_number?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          tryout_id?: number;
          question_text?: string;
          question_type?: 'multiple_choice' | 'essay' | 'true_false';
          options?: string[];
          correct_answer?: string;
          explanation?: string;
          points?: number;
          order_number?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Functions: Record<string, unknown>;
  };
};