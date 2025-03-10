import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Question, UserAnswer } from "@/types/result";

interface AnswerReviewProps {
  questions: Question[];
  userAnswers: UserAnswer[];
  tryoutId: number;
  router: any;
}

export function AnswerReview({ questions, userAnswers, tryoutId, router }: AnswerReviewProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});

  // Toggle question expansion
  const toggleQuestionExpansion = (questionId: number) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Jawaban</CardTitle>
        <CardDescription>
          Telaah jawaban dari {questions.length} soal yang telah dikerjakan
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-[700px] overflow-y-auto pr-2">
        <Accordion type="multiple" className="space-y-4">
          {questions.map((question, idx) => {
            const userAnswer = userAnswers.find(
              (a) => a.questionId === question.id
            );
            const isCorrect = userAnswer?.isCorrect || false;
            const isUnanswered =
              (userAnswer?.answeredOption === null || userAnswer?.answeredOption === undefined) &&
              (!userAnswer?.essayAnswer || userAnswer?.essayAnswer.trim() === '');

            return (
              <Card
                key={question.id}
                className={`border ${
                  isUnanswered
                    ? "border-yellow-200 dark:border-yellow-900"
                    : isCorrect
                    ? "border-green-200 dark:border-green-900"
                    : "border-red-200 dark:border-red-900"
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <Badge
                      variant={
                        isUnanswered
                          ? "outline"
                          : isCorrect
                          ? "secondary"
                          : "destructive"
                      }
                      className={
                        isUnanswered
                          ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                          : isCorrect
                          ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                          : ""
                      }
                    >
                      {isUnanswered
                        ? "Tidak Dijawab"
                        : isCorrect
                        ? "Benar"
                        : "Salah"}
                    </Badge>
                    <Badge variant="outline" className="ml-2">
                      {question.points} poin
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="mb-4">
                    <span className="font-semibold">
                      Soal {idx + 1}:
                    </span>{" "}
                    {question.question_text}
                  </p>

                  <div
                    onClick={() => toggleQuestionExpansion(question.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      <span>
                        {expandedQuestions[question.id]
                          ? "Sembunyikan Detail"
                          : "Lihat Detail"}
                      </span>
                      {expandedQuestions[question.id] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  {expandedQuestions[question.id] && (
                    <div className="mt-4 space-y-4">
                      {/* Multiple Choice */}
                      {question.question_type === "multiple_choice" &&
                        question.options && (
                          <div className="space-y-2">
                            <p className="font-medium">
                              Pilihan Jawaban:
                            </p>
                            {question.options.map((option, i) => (
                              <div
                                key={i}
                                className={`p-2 rounded-md ${
                                  option === question.correct_answer
                                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                    : option ===
                                        userAnswer?.answeredOption &&
                                      !isCorrect
                                    ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                    : "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                                }`}
                              >
                                <div className="flex items-start">
                                  <div className="flex items-center h-5">
                                    {option ===
                                    question.correct_answer ? (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : option ===
                                        userAnswer?.answeredOption &&
                                      !isCorrect ? (
                                      <XCircle className="h-4 w-4 text-red-500" />
                                    ) : (
                                      <div className="h-4 w-4 rounded-full border border-gray-300 dark:border-gray-600" />
                                    )}
                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label
                                      className={`font-medium ${
                                        option ===
                                        question.correct_answer
                                          ? "text-green-700 dark:text-green-300"
                                          : option ===
                                              userAnswer?.answeredOption &&
                                            !isCorrect
                                          ? "text-red-700 dark:text-red-300"
                                          : ""
                                      }`}
                                    >
                                      {option}
                                    </label>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      {/* True/False */}
                      {question.question_type === "true_false" && (
                        <div className="space-y-2">
                          <p className="font-medium">
                            Pilihan Jawaban:
                          </p>
                          <div
                            className={`p-2 rounded-md ${
                              "true" === question.correct_answer
                                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                : "true" ===
                                    userAnswer?.answeredOption &&
                                  !isCorrect
                                ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                : "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                {"true" === question.correct_answer ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : "true" ===
                                    userAnswer?.answeredOption &&
                                  !isCorrect ? (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full border border-gray-300 dark:border-gray-600" />
                                )}
                              </div>
                              <div className="ml-3 text-sm">
                                <label
                                  className={`font-medium ${
                                    "true" === question.correct_answer
                                      ? "text-green-700 dark:text-green-300"
                                      : "true" ===
                                          userAnswer?.answeredOption &&
                                        !isCorrect
                                      ? "text-red-700 dark:text-red-300"
                                      : ""
                                  }`}
                                >
                                  True
                                </label>
                              </div>
                            </div>
                          </div>
                          <div
                            className={`p-2 rounded-md ${
                              "false" === question.correct_answer
                                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                : "false" ===
                                    userAnswer?.answeredOption &&
                                  !isCorrect
                                ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                : "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                {"false" === question.correct_answer ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : "false" ===
                                    userAnswer?.answeredOption &&
                                  !isCorrect ? (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full border border-gray-300 dark:border-gray-600" />
                                )}
                              </div>
                              <div className="ml-3 text-sm">
                                <label
                                  className={`font-medium ${
                                    "false" === question.correct_answer
                                      ? "text-green-700 dark:text-green-300"
                                      : "false" ===
                                          userAnswer?.answeredOption &&
                                        !isCorrect
                                      ? "text-red-700 dark:text-red-300"
                                      : ""
                                  }`}
                                >
                                  False
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Essay */}
                      {question.question_type === "essay" && (
                        <div className="space-y-4">
                          <div>
                            <p className="font-medium mb-1">
                              Jawaban Anda:
                            </p>
                            <div className="p-3 border rounded-md bg-gray-50 dark:bg-gray-800/50 whitespace-pre-wrap">
                              {userAnswer?.essayAnswer ? (
                                userAnswer.essayAnswer
                              ) : (
                                <em className="text-gray-500">
                                  Tidak ada jawaban
                                </em>
                              )}
                            </div>
                          </div>

                          <div>
                            <p className="font-medium mb-1 text-green-600 dark:text-green-400">
                              Kunci Jawaban:
                            </p>
                            <div className="p-3 border border-green-200 dark:border-green-800 rounded-md bg-green-50 dark:bg-green-900/20 whitespace-pre-wrap">
                              {question.correct_answer}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Explanation */}
                      {question.explanation && (
                        <div>
                          <p className="font-medium text-blue-600 dark:text-blue-400">
                            Penjelasan:
                          </p>
                          <div className="p-3 border border-blue-200 dark:border-blue-800 rounded-md bg-blue-50 dark:bg-blue-900/20 whitespace-pre-wrap">
                            {question.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Accordion>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push(`/tryout/detail/${tryoutId}`)}
        >
          Lihat Detail Tryout
        </Button>
      </CardFooter>
    </Card>
  );
}