// app/tryout/session/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import LoadingAnimation from "@/components/LoadingAnimation";
import * as questionService from "@/services/question";
import { Database } from "@/types/supabase";

// Types from the questionService
type Question = Database["public"]["Tables"]["questions"]["Row"];
type TryoutWithQuestions = questionService.TryoutWithQuestions;
type UserAnswer = questionService.UserAnswer;

export default function TryoutSessionPage() {
  const params = useParams();
  const router = useRouter();
  const [tryout, setTryout] = useState<TryoutWithQuestions | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());

  // Load tryout and questions
  useEffect(() => {
    async function loadTryoutSession() {
      setIsLoading(true);
      try {
        // Get ID from params
        const id =
          typeof params.id === "string"
            ? parseInt(params.id)
            : Array.isArray(params.id)
            ? parseInt(params.id[0])
            : 0;

        if (!id) {
          throw new Error("Invalid tryout ID");
        }

        // Use the new service function to fetch tryout with questions
        const tryoutWithQuestions = await questionService.getTryoutWithQuestions(id);
        
        // Validate time constraints
        const now = new Date();
        const startDate = new Date(tryoutWithQuestions.start_date);
        const endDate = new Date(tryoutWithQuestions.end_date);

        if (now < startDate) {
          throw new Error("Tryout belum dimulai");
        }

        if (now > endDate) {
          throw new Error("Tryout sudah berakhir");
        }

        const questionsData = tryoutWithQuestions.questions || [];

        // Check for saved draft answers
        const { userAnswers: savedAnswers, startTime: savedStartTime } = 
          questionService.loadUserAnswersFromLocalStorage(id);

        // Initialize user answers array or use saved answers
        const initialAnswers = savedAnswers || 
          questionService.initializeUserAnswers(questionsData);
        
        // Use saved start time or current time
        const startTime = savedStartTime || new Date();

        setTryout(tryoutWithQuestions);
        setQuestions(questionsData);
        setUserAnswers(initialAnswers);
        setSessionStartTime(startTime);

        // Set timer if duration is specified
        if (tryoutWithQuestions.duration > 0) {
          // Adjust remaining time if using a saved session
          if (savedStartTime) {
            const elapsedSeconds = Math.floor(
              (now.getTime() - savedStartTime.getTime()) / 1000
            );
            const totalSeconds = tryoutWithQuestions.duration * 60;
            const remaining = Math.max(0, totalSeconds - elapsedSeconds);
            setRemainingTime(remaining);
          } else {
            setRemainingTime(tryoutWithQuestions.duration * 60); // Convert to seconds
          }
        }
      } catch (err) {
        console.error("Error loading tryout session:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memuat tryout"
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadTryoutSession();
  }, [params.id]);

  // Save draft answers periodically
  useEffect(() => {
    if (!tryout || userAnswers.length === 0) return;

    // Save draft answers every 10 seconds
    const saveInterval = setInterval(() => {
      questionService.saveUserAnswersToLocalStorage(
        tryout.id,
        userAnswers,
        sessionStartTime
      );
    }, 10000);

    return () => clearInterval(saveInterval);
  }, [tryout, userAnswers, sessionStartTime]);

  // Timer effect
  useEffect(() => {
    if (remainingTime === null || remainingTime <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTime]);

  // Format time remaining
  const formatTimeRemaining = () => {
    if (remainingTime === null) return "Tidak ada batas waktu";

    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    const seconds = remainingTime % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle time up
  const handleTimeUp = () => {
    // Auto-submit when time is up
    handleSubmitTryout();
  };

  // Navigation functions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  // Update answer functions
  const updateMultipleChoiceAnswer = (value: string) => {
    setUserAnswers((prev) => {
      const newAnswers = [...prev];
      const currentQuestion = questions[currentQuestionIndex];
      const answerIndex = newAnswers.findIndex(
        (a) => a.questionId === currentQuestion.id
      );

      if (answerIndex !== -1) {
        newAnswers[answerIndex] = {
          ...newAnswers[answerIndex],
          answeredOption: value,
        };
      }

      return newAnswers;
    });
  };

  const updateEssayAnswer = (value: string) => {
    setUserAnswers((prev) => {
      const newAnswers = [...prev];
      const currentQuestion = questions[currentQuestionIndex];
      const answerIndex = newAnswers.findIndex(
        (a) => a.questionId === currentQuestion.id
      );

      if (answerIndex !== -1) {
        newAnswers[answerIndex] = {
          ...newAnswers[answerIndex],
          essayAnswer: value,
        };
      }

      return newAnswers;
    });
  };

  const toggleFlagged = () => {
    setUserAnswers((prev) => {
      const newAnswers = [...prev];
      const currentQuestion = questions[currentQuestionIndex];
      const answerIndex = newAnswers.findIndex(
        (a) => a.questionId === currentQuestion.id
      );

      if (answerIndex !== -1) {
        newAnswers[answerIndex] = {
          ...newAnswers[answerIndex],
          flagged: !newAnswers[answerIndex].flagged,
        };
      }

      return newAnswers;
    });
  };

  // Check if a question is answered
  const isQuestionAnswered = (questionIndex: number) => {
    if (!questions[questionIndex]) return false;

    const question = questions[questionIndex];
    const answer = userAnswers.find((a) => a.questionId === question.id);

    if (!answer) return false;

    if (question.question_type === "essay") {
      return !!answer.essayAnswer && answer.essayAnswer.trim() !== "";
    } else {
      return !!answer.answeredOption;
    }
  };

  // Get current question's answer
  const getCurrentAnswer = () => {
    if (!questions[currentQuestionIndex]) return null;

    const currentQuestion = questions[currentQuestionIndex];
    return userAnswers.find((a) => a.questionId === currentQuestion.id);
  };

  // Calculate progress
  const calculateProgress = () => {
    if (questions.length === 0) return 0;

    const answeredCount = userAnswers.filter((answer) => {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question) return false;

      if (question.question_type === "essay") {
        return !!answer.essayAnswer && answer.essayAnswer.trim() !== "";
      } else {
        return !!answer.answeredOption;
      }
    }).length;

    return Math.round((answeredCount / questions.length) * 100);
  };

  // Submit tryout
  const handleSubmitTryout = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (!tryout) throw new Error("Tryout data not found");

      // Calculate time taken
      const endTime = new Date();
      const timeTakenSeconds = Math.floor(
        (endTime.getTime() - sessionStartTime.getTime()) / 1000
      );

      // Get user ID (replace with actual auth user ID in production)
      const userId = "current_user_id"; // Placeholder

      // Generate results with correctness information
      const results = questionService.generateResults(questions, userAnswers);

      // Save results to localStorage
      questionService.saveResultsToLocalStorage(
        tryout.id,
        results,
        sessionStartTime,
        endTime,
        timeTakenSeconds
      );

      // Prepare submission data for server
      const submissionData: questionService.TryoutSubmission = {
        tryout_id: tryout.id,
        user_id: userId,
        start_time: sessionStartTime.toISOString(),
        end_time: endTime.toISOString(),
        time_taken_seconds: timeTakenSeconds,
        answers: userAnswers.map((answer) => ({
          question_id: answer.questionId,
          selected_option: answer.answeredOption,
          essay_answer: answer.essayAnswer,
          flagged: answer.flagged
        })),
      };

      // In a production environment, uncomment this to save to the database
      // await questionService.submitTryout(submissionData);

      // For now, just log the submission data
      console.log("Submission data:", submissionData);

      // Redirect to result page
      router.push(`/tryout/result/${tryout.id}`);
    } catch (err) {
      console.error("Error submitting tryout:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengirim jawaban"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render loading state
  if (isLoading) {
    return <LoadingAnimation />;
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{error}</p>
              <Button onClick={() => router.push("/")} className="w-full">
                Kembali ke Beranda
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Render if no tryout or questions found
  if (!tryout || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Tryout Tidak Tersedia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Maaf, tryout yang Anda cari tidak tersedia atau belum memiliki
                pertanyaan.
              </p>
              <Button onClick={() => router.push("/")} className="w-full">
                Kembali ke Beranda
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Get current question
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = getCurrentAnswer();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/tryout/detail/${tryout.id}`)}
                className="mr-2"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold truncate max-w-xs sm:max-w-md">
                {tryout.title}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              {remainingTime !== null && (
                <div
                  className={`flex items-center ${
                    remainingTime < 300 ? "text-red-600 dark:text-red-400" : ""
                  }`}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="font-mono">{formatTimeRemaining()}</span>
                </div>
              )}
              <Button onClick={handleSubmitTryout} disabled={isSubmitting}>
                {isSubmitting ? "Mengirim..." : "Selesai"}
              </Button>
            </div>
          </div>
          <Progress value={calculateProgress()} className="mt-2" />
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question navigation sidebar */}
          <div className="hidden lg:block">
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Daftar Soal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, index) => (
                    <Button
                      key={q.id}
                      variant={
                        currentQuestionIndex === index ? "default" : "outline"
                      }
                      size="sm"
                      className={`
                        h-10 w-10 p-0 font-medium relative
                        ${
                          isQuestionAnswered(index)
                            ? "border-green-500 dark:border-green-500"
                            : ""
                        }
                      `}
                      onClick={() => goToQuestion(index)}
                    >
                      {index + 1}
                      {userAnswers.find((a) => a.questionId === q.id)
                        ?.flagged && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full space-y-2">
                  <div className="flex items-center text-sm">
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                    <span>Terjawab</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                    <span>Ditandai</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Question content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">
                    Soal {currentQuestionIndex + 1} dari {questions.length}
                  </CardTitle>
                </div>
                <Button
                  variant={currentAnswer?.flagged ? "destructive" : "outline"}
                  size="sm"
                  onClick={toggleFlagged}
                  className="flex items-center"
                >
                  <Flag className="h-4 w-4 mr-1" />
                  {currentAnswer?.flagged ? "Ditandai" : "Tandai"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question text */}
                <div className="text-lg whitespace-pre-wrap">
                  {currentQuestion.question_text}
                </div>

                {/* Question options based on type */}
                {currentQuestion.question_type === "multiple_choice" &&
                  currentQuestion.options && (
                    <RadioGroup
                      value={currentAnswer?.answeredOption || ""}
                      onValueChange={updateMultipleChoiceAnswer}
                      className="space-y-3"
                    >
                      {currentQuestion.options.map((option, i) => (
                        <div
                          key={i}
                          className="flex items-start space-x-2 p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <RadioGroupItem
                            value={option}
                            id={`option-${i}`}
                            className="mt-1"
                          />
                          <Label
                            htmlFor={`option-${i}`}
                            className="flex-1 cursor-pointer"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                {currentQuestion.question_type === "true_false" && (
                  <RadioGroup
                    value={currentAnswer?.answeredOption || ""}
                    onValueChange={updateMultipleChoiceAnswer}
                    className="space-y-3"
                  >
                    <div className="flex items-start space-x-2 p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <RadioGroupItem
                        value="true"
                        id="option-true"
                        className="mt-1"
                      />
                      <Label
                        htmlFor="option-true"
                        className="flex-1 cursor-pointer"
                      >
                        True
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2 p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <RadioGroupItem
                        value="false"
                        id="option-false"
                        className="mt-1"
                      />
                      <Label
                        htmlFor="option-false"
                        className="flex-1 cursor-pointer"
                      >
                        False
                      </Label>
                    </div>
                  </RadioGroup>
                )}

                {currentQuestion.question_type === "essay" && (
                  <Textarea
                    value={currentAnswer?.essayAnswer || ""}
                    onChange={(e) => updateEssayAnswer(e.target.value)}
                    placeholder="Ketik jawaban Anda di sini..."
                    className="min-h-32"
                  />
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Sebelumnya
                </Button>
                <div className="flex space-x-2 lg:hidden">
                  <Button
                    variant="outline"
                    className="relative"
                    onClick={() => {
                      // Show mobile question navigator (would need to implement this)
                      alert("Question navigator would open here on mobile");
                    }}
                  >
                    {currentQuestionIndex + 1}/{questions.length}
                    {currentAnswer?.flagged && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
                    )}
                  </Button>
                </div>
                <Button
                  variant={
                    currentQuestionIndex === questions.length - 1
                      ? "default"
                      : "outline"
                  }
                  onClick={goToNextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  Selanjutnya <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>

            {/* Submit button for small screens */}
            <div className="mt-4 lg:hidden">
              <Button
                className="w-full"
                onClick={handleSubmitTryout}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Mengirim..."
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Selesai & Kirim Jawaban
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}