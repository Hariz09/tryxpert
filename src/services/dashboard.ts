import { supabase } from '@/utils/supabase/client';
import { format } from 'date-fns';
import { TryoutFormValues } from '@/components/TryoutForm';

export interface Tryout {
  id: number;
  title: string;
  subject: string;
  start_date: string;
  end_date: string;
  duration: number;
  difficulty: "Mudah" | "Menengah" | "Sulit";
  participants: number;
  syllabus: string[];
  features: string[];
  description?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  total_questions?: number;
}

// Custom error type for structured error handling
export type DashboardError = {
  message: string;
  status?: number;
};

/**
 * Fetch all tryouts, ordered by start date
 * @returns Array of tryouts or null if error
 */
export async function fetchTryouts(): Promise<{
  tryouts: Tryout[] | null;
  error: DashboardError | null;
}> {
  try {
    // Query Supabase for tryout data, ordering by start date
    const { data, error } = await supabase
      .from("tryouts")
      .select("*")
      .order("start_date", { ascending: true });

    if (error) {
      console.error("Error fetching tryouts:", error);
      return {
        tryouts: null,
        error: {
          message: error.message,
          // Set appropriate error status based on error code
          status: error.code === "PGRST116" ? 404 : 500,
        },
      };
    }

    // For each tryout, fetch the question count
    const tryoutsWithQuestionCount = await Promise.all(
      data.map(async (tryout) => {
        const { count, error: countError } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('tryout_id', tryout.id);
        
        if (countError) {
          console.error('Error counting questions:', countError);
          return { ...tryout, total_questions: 0 };
        }
        
        return { ...tryout, total_questions: count || 0 };
      })
    );

    return { tryouts: tryoutsWithQuestionCount, error: null };
  } catch (err) {
    console.error("Unexpected error fetching tryouts:", err);
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    return { tryouts: null, error: { message } };
  }
}

/**
 * Add a new tryout
 * @param formData The tryout form values
 * @returns The ID of the newly created tryout or undefined if error
 */
export async function addTryout(
  formData: TryoutFormValues
): Promise<{ id: string } | undefined> {
  try {
    // Prepare tryout data for database insertion
    const newTryout = {
      ...formData,
      participants: 0, // Initialize with zero participants
      // Handle null duration case
      duration: formData.duration === null ? -1 : formData.duration,
      // Convert JavaScript Date objects to ISO strings for database
      start_date: formData.start_date.toISOString(),
      end_date: formData.end_date.toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert new tryout into Supabase
    const { data, error } = await supabase
      .from("tryouts")
      .insert([newTryout])
      .select();

    if (error) {
      throw error;
    }

    // Return the ID of the newly created tryout
    return data && data[0] ? { id: data[0].id.toString() } : undefined;
  } catch (error: any) {
    console.error("Error adding tryout:", error);
    return undefined;
  }
}

/**
 * Update an existing tryout
 * @param tryoutId The ID of the tryout to update
 * @param formData The updated tryout form values
 * @returns The ID of the updated tryout or undefined if error
 */
export async function updateTryout(
  tryoutId: number,
  formData: TryoutFormValues
): Promise<{ id: string } | undefined> {
  try {
    // Prepare tryout data for database update
    const updatedTryout = {
      ...formData,
      // Handle null duration case
      duration: formData.duration === null ? -1 : formData.duration,
      // Convert JavaScript Date objects to ISO strings for database
      start_date: formData.start_date.toISOString(),
      end_date: formData.end_date.toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Update tryout in Supabase
    const { error } = await supabase
      .from("tryouts")
      .update(updatedTryout)
      .eq("id", tryoutId);

    if (error) {
      throw error;
    }

    // Return the ID of the updated tryout
    return { id: tryoutId.toString() };
  } catch (error: any) {
    console.error("Error updating tryout:", error);
    return undefined;
  }
}

/**
 * Delete a tryout
 * @param tryoutId The ID of the tryout to delete
 * @returns true if successful, false if error
 */
export async function deleteTryout(tryoutId: number): Promise<boolean> {
  try {
    // Delete tryout from Supabase
    const { error } = await supabase
      .from("tryouts")
      .delete()
      .eq("id", tryoutId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error("Error deleting tryout:", error);
    return false;
  }
}

/**
 * Format ISO date string to human-readable format
 * @param dateString ISO date string
 * @returns Formatted date string (dd MMMM yyyy)
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

/**
 * Get tryout status based on start and end dates
 * @param startDate Tryout start date
 * @param endDate Tryout end date
 * @returns Status as 'notStarted', 'inProgress', or 'ended'
 */
export const getTryoutStatus = (
  startDate: string, 
  endDate: string
): 'notStarted' | 'inProgress' | 'ended' => {
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

/**
 * Get difficulty style class based on tryout difficulty
 * @param difficulty Tryout difficulty level
 * @returns Badge variant name matching the types in your Badge component
 */
export const getDifficultyVariant = (
  difficulty: "Mudah" | "Menengah" | "Sulit"
): "default" | "mudah" | "menengah" | "sulit" => {
  switch (difficulty) {
    case "Sulit":
      return "sulit";
    case "Menengah":
      return "menengah";
    case "Mudah":
      return "mudah";
    default:
      return "default";
  }
};