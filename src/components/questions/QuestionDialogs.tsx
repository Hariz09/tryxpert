import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { Database } from '@/types/supabase';
import QuestionForm, { QuestionFormValues } from './QuestionForm';

type Question = Database['public']['Tables']['questions']['Row'];

// Add Question Dialog
interface AddQuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: QuestionFormValues) => Promise<void>;
  isSaving: boolean;
}

export const AddQuestionDialog: React.FC<AddQuestionDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSaving
}) => {
  const defaultValues: QuestionFormValues = {
    question_text: '',
    question_type: 'multiple_choice',
    options: ['', ''],
    correct_answer: '',
    explanation: '',
    points: 1,
    order_number: 0,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
          <DialogDescription>
            Create a new question for this tryout.
          </DialogDescription>
        </DialogHeader>
        
        <QuestionForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSaving={isSaving}
          submitLabel="Save Question"
        />
      </DialogContent>
    </Dialog>
  );
};

// Edit Question Dialog
interface EditQuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: QuestionFormValues) => Promise<void>;
  question: Question | null;
  isSaving: boolean;
}

export const EditQuestionDialog: React.FC<EditQuestionDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  question,
  isSaving
}) => {
  // If no question provided, don't render
  if (!question) return null;

  const defaultValues: QuestionFormValues = {
    question_text: question.question_text,
    question_type: question.question_type,
    options: question.options,
    correct_answer: question.correct_answer,
    explanation: question.explanation || '',
    points: question.points,
    order_number: question.order_number,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Update this question.
          </DialogDescription>
        </DialogHeader>
        
        <QuestionForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSaving={isSaving}
          submitLabel="Update Question"
        />
      </DialogContent>
    </Dialog>
  );
};

// Delete Question Dialog
interface DeleteQuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  question: Question | null;
  isSaving: boolean;
}

export const DeleteQuestionDialog: React.FC<DeleteQuestionDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  question,
  isSaving
}) => {
  if (!question) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Question</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this question? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 border border-red-200 bg-red-50 rounded-md dark:bg-red-900/20 dark:border-red-800">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">
            Question {question.order_number}
          </p>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {question.question_text}
          </p>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={onConfirm}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Question
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};