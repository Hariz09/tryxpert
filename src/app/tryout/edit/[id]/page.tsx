"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Plus,
  ClipboardList,
  Lock,
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { Database } from "@/types/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoadingAnimation from "@/components/LoadingAnimation";
import QuestionCard from "@/components/questions/QuestionCard";
import {
  AddQuestionDialog,
  EditQuestionDialog,
  DeleteQuestionDialog,
} from "@/components/questions/QuestionDialogs";
import { QuestionFormValues } from "@/components/questions/QuestionForm";
import * as questionService from "@/services/question";

// Define type aliases for better readability and type checking
type Tryout = Database["public"]["Tables"]["tryouts"]["Row"];
type Question = Database["public"]["Tables"]["questions"]["Row"];

// Component to display loading skeleton while fetching data
const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    <div className="space-y-3">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full"
        ></div>
      ))}
    </div>
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
  </div>
);

// Component displayed when user tries to edit a tryout that already has participants
const AccessDenied = ({ tryoutId }: { tryoutId: number }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
          <Lock className="h-12 w-12 text-red-600 dark:text-red-300" />
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-2 dark:text-white">Access Denied</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        This tryout already has participants and cannot be modified.
      </p>
      <Button asChild>
        <Link href={`/tryout/detail/${tryoutId}`}>
          Return to Tryout Details
        </Link>
      </Button>
    </div>
  </div>
);

/**
 * Main component for editing questions within a tryout
 * Handles loading, creating, updating, deleting, and reordering questions
 */
export default function EditQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  
  // State declarations
  const [tryout, setTryout] = useState<Tryout | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [hasParticipants, setHasParticipants] = useState(false);

  /**
   * Extract and parse tryout ID from URL parameters
   * @returns {number} The tryout ID or 0 if not found
   */
  const getTryoutId = (): number => {
    return typeof params.id === "string"
      ? parseInt(params.id)
      : Array.isArray(params.id)
      ? parseInt(params.id[0])
      : 0;
  };

  // Load tryout data and questions on component mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const id = getTryoutId();

        if (id) {
          // Fetch tryout details from Supabase
          const { data: tryoutData, error: tryoutError } = await supabase
            .from("tryouts")
            .select("*")
            .eq("id", id)
            .single();

          if (tryoutError) throw tryoutError;
          setTryout(tryoutData);

          // Check if tryout has participants (read-only mode)
          if (tryoutData.participants !== 0) {
            setHasParticipants(true);
            return;
          }

          // Fetch questions if tryout can be edited
          const questionsData = await questionService.getQuestions(id);
          setQuestions(questionsData);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load tryout and questions.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [params.id, router]);

  // Return access denied view if tryout has participants
  if (hasParticipants) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black">
        <Navbar />
        <main className="flex-grow">
          <AccessDenied tryoutId={getTryoutId()} />
        </main>
        <Footer />
      </div>
    );
  }

  /**
   * Handles adding a new question to the tryout
   * @param {QuestionFormValues} data - Form data for the new question
   */
  const handleAddQuestion = async (data: QuestionFormValues) => {
    const tryoutId = getTryoutId();
    if (!tryoutId) return;
  
    const loadingToast = toast.loading("Adding question...");
  
    try {
      setIsSaving(true);
  
      // Automatically set order number for new question
      const orderNumber = questions.length + 1;
      data.order_number = orderNumber;
  
      // Create new question via service
      const newQuestion = await questionService.addQuestion(tryoutId, data);
  
      // Update local state with new question
      setQuestions(prevQuestions => [...prevQuestions, newQuestion]);
  
      // Close dialog before showing success toast
      setIsAddDialogOpen(false);
      
      toast.success("Question added successfully", { id: loadingToast });
    } catch (error) {
      console.error("Failed to add question:", error);
      toast.error("Failed to add question", { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handles updating an existing question
   * @param {QuestionFormValues} data - Updated form data for the question
   */
  const handleEditQuestion = async (data: QuestionFormValues) => {
    if (!editingQuestion) return;

    const loadingToast = toast.loading("Updating question...");

    try {
      setIsSaving(true);

      // Update question via service
      const updatedQuestion = await questionService.updateQuestion(
        editingQuestion.id,
        data
      );

      // Update question in local state
      setQuestions(
        questions.map((q) =>
          q.id === editingQuestion.id ? updatedQuestion : q
        )
      );

      // Reset state and close dialog
      setIsEditDialogOpen(false);
      setEditingQuestion(null);

      toast.success("Question updated successfully", { id: loadingToast });
    } catch (error) {
      console.error("Failed to update question:", error);
      toast.error("Failed to update question", { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handles deleting a question and reordering remaining questions
   */
  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return;

    const loadingToast = toast.loading("Deleting question...");

    try {
      setIsSaving(true);

      // Delete question from database
      await questionService.deleteQuestion(questionToDelete.id);

      // Remove deleted question from local state
      const newQuestions = questions.filter(
        (q) => q.id !== questionToDelete.id
      );

      // Calculate new order numbers for remaining questions
      const updatedQuestions = newQuestions.map((q, i) => ({
        ...q,
        order_number: i + 1,
      }));

      // Update order numbers in database to ensure consistency
      for (const q of updatedQuestions) {
        await questionService.updateQuestionOrder(q.id, q.order_number);
      }

      // Update local state and reset UI
      setQuestions(updatedQuestions);
      setIsDeleteDialogOpen(false);
      setQuestionToDelete(null);

      toast.success("Question deleted successfully", { id: loadingToast });
    } catch (error) {
      console.error("Failed to delete question:", error);
      toast.error("Failed to delete question", { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handles reordering questions by moving them up or down in the list
   * @param {number} questionId - ID of the question to move
   * @param {"up" | "down"} direction - Direction to move the question
   */
  const handleMoveQuestion = async (
    questionId: number,
    direction: "up" | "down"
  ) => {
    const loadingToast = toast.loading(`Moving question ${direction}...`);

    try {
      setIsSaving(true);

      // Find current index of question
      const currentIndex = questions.findIndex((q) => q.id === questionId);
      if (currentIndex === -1) return;

      // Calculate new index based on direction
      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= questions.length) return;

      // Create copy of questions array for manipulation
      const newQuestions = [...questions];
      
      // Swap order numbers between the two affected questions
      const temp = newQuestions[currentIndex].order_number;
      newQuestions[currentIndex].order_number =
        newQuestions[newIndex].order_number;
      newQuestions[newIndex].order_number = temp;

      // Swap positions in the array
      [newQuestions[currentIndex], newQuestions[newIndex]] = [
        newQuestions[newIndex],
        newQuestions[currentIndex],
      ];

      // Update order numbers in database for both questions
      await questionService.updateQuestionOrder(
        newQuestions[currentIndex].id,
        newQuestions[currentIndex].order_number
      );

      await questionService.updateQuestionOrder(
        newQuestions[newIndex].id,
        newQuestions[newIndex].order_number
      );

      // Update local state with reordered questions
      setQuestions(newQuestions);

      toast.success(`Question moved ${direction}`, { id: loadingToast });
    } catch (error) {
      console.error(`Failed to move question ${direction}:`, error);
      toast.error(`Failed to move question ${direction}`, { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Opens the edit dialog with the selected question's data
   * @param {Question} question - Question to edit
   */
  const openEditDialog = (question: Question) => {
    setEditingQuestion(question);
    setIsEditDialogOpen(true);
  };

  /**
   * Opens the dialog for adding a new question
   */
  const openAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  /**
   * Opens the confirmation dialog for deleting a question
   * @param {Question} question - Question to delete
   */
  const openDeleteDialog = (question: Question) => {
    setQuestionToDelete(question);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Navigates back to the tryout detail page
   */
  const handleReturn = () => {
    router.push(`/tryout/detail/${tryout?.id}`);
  };

  // Render the main component UI
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black">
      <Navbar />
      {isSaving && <LoadingAnimation />}

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button
              variant="outline"
              onClick={handleReturn}
              className="mb-2 flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Tryout
            </Button>
            <h1 className="text-2xl font-bold dark:text-white">
              {isLoading ? "Loading..." : `Edit Questions: ${tryout?.title}`}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {/* Optional subtitle area for tryout metadata */}
            </p>
          </div>

          <Button
            onClick={openAddDialog}
            className="flex items-center"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Question
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold dark:text-white">
              Questions ({questions.length})
            </h2>
          </div>

          {isLoading ? (
            <LoadingSkeleton />
          ) : questions.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-center mb-4">
                <ClipboardList className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium dark:text-white">
                No questions yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start adding questions for your tryout.
              </p>
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-1" />
                Add First Question
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  totalQuestions={questions.length}
                  onEdit={() => openEditDialog(question)}
                  onDelete={() => openDeleteDialog(question)}
                  onMoveUp={() => handleMoveQuestion(question.id, "up")}
                  onMoveDown={() => handleMoveQuestion(question.id, "down")}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Modals/Dialogs for question management */}
      <AddQuestionDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddQuestion}
        isSaving={isSaving}
      />

      <EditQuestionDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingQuestion(null);
        }}
        onSubmit={handleEditQuestion}
        question={editingQuestion}
        isSaving={isSaving}
      />

      <DeleteQuestionDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setQuestionToDelete(null);
        }}
        onConfirm={handleDeleteQuestion}
        question={questionToDelete}
        isSaving={isSaving}
      />
    </div>
  );
}