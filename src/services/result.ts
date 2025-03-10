import { supabase } from "@/utils/supabase/client";
import { TryoutResults, UserAnswer, Question } from "@/types/result";

export async function fetchTryoutResults(id: number) {
  try {
    // Fetch tryout details
    const { data: tryoutData, error: tryoutError } = await supabase
      .from("tryouts")
      .select("*")
      .eq("id", id)
      .single();

    if (tryoutError) {
      return { errorMessage: tryoutError.message };
    }
    
    if (!tryoutData) {
      return { errorMessage: "Tryout not found" };
    }

    // Fetch questions
    const { data: questionsData, error: questionsError } = await supabase
      .from("questions")
      .select("*")
      .eq("tryout_id", id)
      .order("order_number", { ascending: true });

    if (questionsError) {
      return { errorMessage: questionsError.message };
    }

    // In a real implementation, you would fetch the user's actual submission data
    // For now, retrieve user answers from localStorage if they exist
    let userAnswers: UserAnswer[] = [];
    
    try {
      const savedAnswers = localStorage.getItem(`tryout_answers_${id}`);
      if (savedAnswers) {
        // Use the stored answers if they exist
        const parsedAnswers = JSON.parse(savedAnswers);
        
        // Revalidate correctness based on case-insensitive comparison
        userAnswers = parsedAnswers.map((answer: UserAnswer) => {
          const question = questionsData.find(q => q.id === answer.questionId);
          
          if (question) {
            let isCorrect = false;
            
            if (question.question_type === 'essay') {
              // For essays, compare lowercase
              isCorrect = !!answer.essayAnswer && 
                         answer.essayAnswer.toLowerCase() === question.correct_answer.toLowerCase();
            } else {
              // For multiple choice and true/false
              isCorrect = answer.answeredOption?.toLowerCase() === question.correct_answer.toLowerCase();
            }
            
            return {...answer, isCorrect};
          }
          
          return answer;
        });
      } else {
        // Otherwise use mock data for demo purposes
        userAnswers = generateMockUserAnswers(questionsData);
      }
    } catch (e) {
      console.error("Error accessing localStorage:", e);
      // Fallback to mock data
      userAnswers = generateMockUserAnswers(questionsData);
    }

    // Calculate total score
    const totalPoints = questionsData.reduce((sum, q) => sum + q.points, 0);
    const userPoints = userAnswers.reduce((sum, answer) => {
      if (answer.isCorrect) {
        const question = questionsData.find(
          (q) => q.id === answer.questionId
        );
        return sum + (question?.points || 0);
      }
      return sum;
    }, 0);

    const percentageScore =
      totalPoints > 0 ? (userPoints / totalPoints) * 100 : 0;

    const answeredCorrectly = userAnswers.filter(
      (a) => a.isCorrect
    ).length;
    const unanswered = userAnswers.filter(
      (a) => a.answeredOption === null && a.essayAnswer === null
    ).length;
    const answeredWrong =
      questionsData.length - answeredCorrectly - unanswered;

    // Get times from localStorage or use mock times
    let startTime: string;
    let endTime: string;
    let timeTaken: number;
    
    try {
      startTime = localStorage.getItem(`tryout_start_time_${id}`) || new Date(Date.now() - 60 * 60 * 1000).toISOString();
      endTime = localStorage.getItem(`tryout_end_time_${id}`) || new Date().toISOString();
      const savedTimeTaken = localStorage.getItem(`tryout_time_taken_${id}`);
      timeTaken = savedTimeTaken ? parseInt(savedTimeTaken) : 3600;
    } catch (e) {
      console.error("Error accessing localStorage for time data:", e);
      endTime = new Date().toISOString();
      startTime = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      timeTaken = 3600; // seconds
    }

    // Combine all data into results
    const tryoutResults: TryoutResults = {
      tryout: {
        ...tryoutData,
        questions: questionsData,
      },
      userAnswers: userAnswers,
      score: userPoints,
      maxScore: totalPoints,
      percentageScore,
      startTime,
      endTime,
      timeTaken,
      answeredCorrectly,
      answeredWrong,
      unanswered,
    };

    return { tryoutResults, questionsData, errorMessage: null };

  } catch (error) {
    console.error("Error in fetchTryoutResults:", error);
    return { 
      errorMessage: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
}

// Helper function to generate mock user answers when real data isn't available
function generateMockUserAnswers(questionsData: Question[]): UserAnswer[] {
  return questionsData.map((question: Question) => {
    // Simulate ~70% correct answers
    const isCorrect = Math.random() > 0.3;
    
    // For exact string comparison in validation

    if (question.question_type === "essay") {
      return {
        questionId: question.id,
        answeredOption: null,
        essayAnswer: isCorrect
          ? "This is a sample essay answer that would be considered correct. It addresses all the key points."
          : "This is an incomplete answer that missed several important elements.",
        isCorrect,
      };
    } else if (question.question_type === "true_false") {
      return {
        questionId: question.id,
        answeredOption: isCorrect
          ? question.correct_answer
          : question.correct_answer === "true"
          ? "false"
          : "true",
        essayAnswer: null,
        isCorrect,
      };
    } else {
      // Multiple choice
      if (isCorrect) {
        return {
          questionId: question.id,
          answeredOption: question.correct_answer,
          essayAnswer: null,
          isCorrect: true,
        };
      } else {
        // Get an incorrect option
        const options = question.options || [];
        const incorrectOptions = options.filter(
          (opt) => opt !== question.correct_answer
        );
        const randomIncorrectOption =
          incorrectOptions.length > 0
            ? incorrectOptions[
                Math.floor(Math.random() * incorrectOptions.length)
              ]
            : null;

        return {
          questionId: question.id,
          answeredOption: randomIncorrectOption,
          essayAnswer: null,
          isCorrect: false,
        };
      }
    }
  });
}