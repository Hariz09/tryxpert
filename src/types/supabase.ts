// File: types/supabase.ts
export type Database = {
    public: {
      Tables: {
        tryouts: {
          Row: {
            id: number;
            title: string;
            subject: string;
            date: string;
            duration: string;
            total_questions: number;
            difficulty: 'Mudah' | 'Menengah' | 'Sulit';
            participants: number;
            image_url: string;
            created_at?: string;
          };
          Insert: {
            id?: number;
            title: string;
            subject: string;
            date: string;
            duration: string;
            total_questions: number;
            difficulty: 'Mudah' | 'Menengah' | 'Sulit';
            participants?: number;
            image_url?: string;
            created_at?: string;
          };
          Update: {
            id?: number;
            title?: string;
            subject?: string;
            date?: string;
            duration?: string;
            total_questions?: number;
            difficulty?: 'Mudah' | 'Menengah' | 'Sulit';
            participants?: number;
            image_url?: string;
            created_at?: string;
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