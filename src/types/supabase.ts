// File: types/supabase.ts
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
          total_questions: number;
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
          total_questions: number;
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
          total_questions?: number;
          difficulty?: 'Mudah' | 'Menengah' | 'Sulit';
          participants?: number;
          syllabus?: string[];
          features?: string[];
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