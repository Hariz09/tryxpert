import { supabase } from '@/utils/supabase/client';
import { Database } from '@/types/supabase';
import { QuestionFormValues } from '@/components/questions/QuestionForm';

type Question = Database['public']['Tables']['questions']['Row'];
type Tryout = Database['public']['Tables']['tryouts']['Row'];

// Extended tryout type that includes questions
export type TryoutWithQuestions = Tryout & {
  questions?: Question[];
};

// User answer type for tracking responses
export type UserAnswer = {
  questionId: number;
  answeredOption: string | null;
  essayAnswer: string | null;
  flagged: boolean;
};

// Type for tryout submission
export type TryoutSubmission = {
  tryout_id: number;
  user_id: string;
  start_time: string;
  end_time: string;
  time_taken_seconds: number;
  answers: Array<{
    question_id: number;
    selected_option: string | null;
    essay_answer: string | null;
    flagged?: boolean;
  }>;
};

// Result answer type with correctness information
export type ResultAnswer = {
  questionId: number;
  answeredOption: string | null;
  essayAnswer: string | null;
  isCorrect: boolean;
  flagged?: boolean;
};

// Fetch questions for a tryout
export const getQuestions = async (tryoutId: number): Promise<Question[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('tryout_id', tryoutId)
    .order('order_number', { ascending: true });
  
  if (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
  
  // Parse JSON fields if they're stored as strings
  return data.map((q: any) => {
    if (typeof q.options === 'string') {
      try {
        q.options = JSON.parse(q.options);
      } catch (e) {
        q.options = [];
      }
    }
    return q;
  });
};

// Add a new question
export const addQuestion = async (
  tryoutId: number, 
  formData: QuestionFormValues
): Promise<Question> => {
  // Prepare data for insertion
  const newQuestion: Database['public']['Tables']['questions']['Insert'] = {
    tryout_id: tryoutId,
    question_text: formData.question_text,
    question_type: formData.question_type,
    correct_answer: formData.correct_answer,
    explanation: formData.explanation || '',
    points: formData.points,
    order_number: formData.order_number || 0,
  };
  
  // Add options for multiple choice
  if (formData.question_type === 'multiple_choice' && formData.options) {
    newQuestion.options = formData.options.filter(o => o.trim() !== '');
  }
  
  // Insert into database
  const { data, error } = await supabase
    .from('questions')
    .insert(newQuestion)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding question:', error);
    throw error;
  }
  
  return data;
};

// Update a question
export const updateQuestion = async (
  questionId: number,
  formData: QuestionFormValues
): Promise<Question> => {
  // Prepare data for update
  const updatedQuestion: Database['public']['Tables']['questions']['Update'] = {
    question_text: formData.question_text,
    question_type: formData.question_type,
    correct_answer: formData.correct_answer,
    explanation: formData.explanation || '',
    points: formData.points,
  };
  
  // Add options for multiple choice
  if (formData.question_type === 'multiple_choice' && formData.options) {
    updatedQuestion.options = formData.options.filter(o => o.trim() !== '');
  } else {
    updatedQuestion.options = undefined;
  }
  
  // Update in database
  const { data, error } = await supabase
    .from('questions')
    .update(updatedQuestion)
    .eq('id', questionId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating question:', error);
    throw error;
  }
  
  return data;
};

// Delete a question
export const deleteQuestion = async (questionId: number): Promise<void> => {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId);
  
  if (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

// Update question order
export const updateQuestionOrder = async (
  questionId: number, 
  newOrderNumber: number
): Promise<void> => {
  const { error } = await supabase
    .from('questions')
    .update({ order_number: newOrderNumber })
    .eq('id', questionId);
  
  if (error) {
    console.error('Error updating question order:', error);
    throw error;
  }
};

// NEW FUNCTIONS FOR SESSION PAGE

// Fetch tryout with questions
export const getTryoutWithQuestions = async (
  tryoutId: number
): Promise<TryoutWithQuestions> => {
  // First fetch the tryout details
  const { data: tryoutData, error: tryoutError } = await supabase
    .from('tryouts')
    .select('*')
    .eq('id', tryoutId)
    .single();

  if (tryoutError) {
    console.error('Error fetching tryout:', tryoutError);
    throw tryoutError;
  }

  if (!tryoutData) {
    throw new Error('Tryout not found');
  }

  // Then fetch questions
  const questions = await getQuestions(tryoutId);

  // Combine into a single object
  return {
    ...tryoutData,
    questions,
  };
};

// Initialize empty user answers
export const initializeUserAnswers = (questions: Question[]): UserAnswer[] => {
  return questions.map((q) => ({
    questionId: q.id,
    answeredOption: null,
    essayAnswer: null,
    flagged: false,
  }));
};

// Save tryout submission
export const submitTryout = async (
  submissionData: TryoutSubmission
): Promise<void> => {
  const { error } = await supabase
    .from('submissions')
    .insert(submissionData);

  if (error) {
    console.error('Error submitting tryout:', error);
    throw error;
  }
};

// Save user answers to localStorage (for offline or before final submission)
export const saveUserAnswersToLocalStorage = (
  tryoutId: number,
  userAnswers: UserAnswer[],
  startTime: Date
): void => {
  try {
    localStorage.setItem(
      `tryout_draft_answers_${tryoutId}`,
      JSON.stringify(userAnswers)
    );
    localStorage.setItem(
      `tryout_draft_start_time_${tryoutId}`,
      startTime.toISOString()
    );
  } catch (e) {
    console.error('Error saving draft to localStorage:', e);
  }
};

// Load user answers from localStorage (for resuming a session)
export const loadUserAnswersFromLocalStorage = (
  tryoutId: number
): { userAnswers: UserAnswer[] | null, startTime: Date | null } => {
  try {
    const answersJson = localStorage.getItem(`tryout_draft_answers_${tryoutId}`);
    const startTimeString = localStorage.getItem(`tryout_draft_start_time_${tryoutId}`);
    
    const userAnswers = answersJson ? JSON.parse(answersJson) : null;
    const startTime = startTimeString ? new Date(startTimeString) : null;
    
    return { userAnswers, startTime };
  } catch (e) {
    console.error('Error loading draft from localStorage:', e);
    return { userAnswers: null, startTime: null };
  }
};

// Generate results for display after submission
export const generateResults = (
  questions: Question[],
  userAnswers: UserAnswer[]
): ResultAnswer[] => {
  return userAnswers.map((answer) => {
    // Find the corresponding question to check correctness
    const question = questions.find((q) => q.id === answer.questionId);
    const isCorrect =
      question?.question_type === 'essay'
        ? null // Essay questions need manual grading
        : answer.answeredOption === question?.correct_answer;

    return {
      questionId: answer.questionId,
      answeredOption: answer.answeredOption,
      essayAnswer: answer.essayAnswer,
      isCorrect: !!isCorrect,
      flagged: answer.flagged,
    };
  });
};

// Save final results to localStorage
export const saveResultsToLocalStorage = (
  tryoutId: number,
  results: ResultAnswer[],
  startTime: Date,
  endTime: Date,
  timeTakenSeconds: number
): void => {
  try {
    localStorage.setItem(
      `tryout_answers_${tryoutId}`,
      JSON.stringify(results)
    );
    localStorage.setItem(
      `tryout_start_time_${tryoutId}`,
      startTime.toISOString()
    );
    localStorage.setItem(
      `tryout_end_time_${tryoutId}`,
      endTime.toISOString()
    );
    localStorage.setItem(
      `tryout_time_taken_${tryoutId}`,
      timeTakenSeconds.toString()
    );
    
    // Clean up draft answers after successful submission
    localStorage.removeItem(`tryout_draft_answers_${tryoutId}`);
    localStorage.removeItem(`tryout_draft_start_time_${tryoutId}`);
  } catch (e) {
    console.error('Error saving results to localStorage:', e);
  }
};

// Load saved results from localStorage for results page
export const loadResultsFromLocalStorage = (
  tryoutId: number
): {
  results: ResultAnswer[] | null;
  startTime: Date | null;
  endTime: Date | null;
  timeTakenSeconds: number | null;
} => {
  try {
    const resultsJson = localStorage.getItem(`tryout_answers_${tryoutId}`);
    const startTimeString = localStorage.getItem(`tryout_start_time_${tryoutId}`);
    const endTimeString = localStorage.getItem(`tryout_end_time_${tryoutId}`);
    const timeTakenString = localStorage.getItem(`tryout_time_taken_${tryoutId}`);
    
    return {
      results: resultsJson ? JSON.parse(resultsJson) : null,
      startTime: startTimeString ? new Date(startTimeString) : null,
      endTime: endTimeString ? new Date(endTimeString) : null,
      timeTakenSeconds: timeTakenString ? parseInt(timeTakenString, 10) : null,
    };
  } catch (e) {
    console.error('Error loading results from localStorage:', e);
    return {
      results: null,
      startTime: null,
      endTime: null,
      timeTakenSeconds: null,
    };
  }
};

// Calculate score based on user answers and questions
export const calculateScore = (
  questions: Question[],
  results: ResultAnswer[]
): {
  totalPoints: number;
  earnedPoints: number;
  percentageScore: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
} => {
  let totalPoints = 0;
  let earnedPoints = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  questions.forEach((question) => {
    const result = results.find((r) => r.questionId === question.id);
    
    // Add to total points
    totalPoints += question.points || 1;
    
    if (!result || (!result.answeredOption && !result.essayAnswer)) {
      unansweredCount++;
    } else if (question.question_type === 'essay') {
      // Essay questions require manual grading, so we don't count them here
      // This could be enhanced later with auto-grading or manual input
    } else if (result.isCorrect) {
      earnedPoints += question.points || 1;
      correctCount++;
    } else {
      incorrectCount++;
    }
  });

  const percentageScore = totalPoints > 0 
    ? Math.round((earnedPoints / totalPoints) * 100) 
    : 0;

  return {
    totalPoints,
    earnedPoints,
    percentageScore,
    correctCount,
    incorrectCount,
    unansweredCount,
  };
};