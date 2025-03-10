import { supabase } from '@/utils/supabase/client';
import { Database } from '@/types/supabase';

// Type for Tryout with all fields
export type Tryout = Database['public']['Tables']['tryouts']['Row'] & {
  description?: string;
  syllabus?: string[];
  features?: string[];
  total_questions?: number; // Added to store question count
};

/**
 * Fetch tryout details by ID including question count
 * @param id The tryout ID
 * @returns Tryout object or null if not found
 */
export async function getTryoutDetails(id: number): Promise<Tryout | null> {
  try {
    // Fetch tryout details
    const { data, error } = await supabase
      .from('tryouts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching tryout:', error);
      return null;
    }
    
    // Parse JSON fields if they exist
    const tryout = data as Tryout;
    
    // Parse JSON fields if they're stored as strings
    if (typeof tryout.syllabus === 'string') {
      try {
        tryout.syllabus = JSON.parse(tryout.syllabus);
      } catch (e) {
        tryout.syllabus = [];
        console.error('Error parsing syllabus:', e);
      }
    }
    
    if (typeof tryout.features === 'string') {
      try {
        tryout.features = JSON.parse(tryout.features);
      } catch (e) {
        tryout.features = [];
        console.error('Error parsing features:', e);
      }
    }
    
    // Count questions for this tryout
    const { count, error: countError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('tryout_id', id);
    
    if (countError) {
      console.error('Error counting questions:', countError);
    } else {
      // Add total_questions to the tryout object
      tryout.total_questions = count || 0;
    }
    
    return tryout;
  } catch (error) {
    console.error('Unexpected error fetching tryout:', error);
    return null;
  }
}

/**
 * Format date from ISO string to dd MMMM yyyy format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

/**
 * Format date with time from ISO string to dd MMMM yyyy, HH:mm format
 * @param dateString ISO date string
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  } catch (error) {
    console.error("Error formatting date with time:", error);
    return dateString;
  }
};

/**
 * Calculate tryout status based on start and end dates
 * @param startDate Tryout start date
 * @param endDate Tryout end date
 * @returns Status as 'notStarted', 'inProgress', or 'ended'
 */
export const getTryoutStatus = (startDate: string, endDate: string): 'notStarted' | 'inProgress' | 'ended' => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) {
    return 'notStarted';
  } else if (now >= start && now < end) {
    return 'inProgress';
  } else {
    return 'ended';
  }
};

/**
 * Calculate time remaining until a target date
 * @param targetDate The target date to calculate time until
 * @returns Object with days, hours, minutes, seconds or null if past the target date
 */
export const calculateTimeRemaining = (targetDate: Date) => {
  const now = new Date();
  
  if (now >= targetDate) {
    return null;
  }
  
  const totalSeconds = Math.floor((targetDate.getTime() - now.getTime()) / 1000);
  
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;
  
  return { days, hours, minutes, seconds };
};