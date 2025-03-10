import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Button
} from '@/components/ui/button';
import {
  CheckCircle2,
  XCircle,
  MoveUp,
  MoveDown,
  Edit,
  Trash2
} from 'lucide-react';
import { Database } from '@/types/supabase';

// Badge Component for question type
export const Badge = ({ 
  variant = 'default', 
  children 
}: { 
  variant?: 'default' | 'secondary' | 'outline'; 
  children: React.ReactNode 
}) => {
  let className = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ";
  
  switch (variant) {
    case 'default':
      className += "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
      break;
    case 'secondary':
      className += "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
      break;
    case 'outline':
      className += "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      break;
  }
  
  return <span className={className}>{children}</span>;
};

type Question = Database['public']['Tables']['questions']['Row'];

// Question Card Component
const QuestionCard = ({ 
  question, 
  index,
  totalQuestions,
  onEdit, 
  onDelete,
  onMoveUp,
  onMoveDown
}: { 
  question: Question; 
  index: number;
  totalQuestions: number;
  onEdit: () => void; 
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) => {
  return (
    <Card className="mb-4 border border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base font-medium flex items-center">
              <span className="mr-2">Question {index + 1}</span>
              <Badge variant={
                question.question_type === 'multiple_choice' ? 'default' : 
                question.question_type === 'essay' ? 'secondary' : 
                'outline'
              }>
                {question.question_type === 'multiple_choice' ? 'Multiple Choice' : 
                 question.question_type === 'essay' ? 'Essay' : 'True/False'}
              </Badge>
              <span className="ml-2 text-sm text-muted-foreground">
                ({question.points} point{question.points !== 1 ? 's' : ''})
              </span>
            </CardTitle>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onMoveUp}
              disabled={index === 0}
            >
              <MoveUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onMoveDown}
              disabled={index === totalQuestions - 1}
            >
              <MoveDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-100"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm mb-2 whitespace-pre-wrap">{question.question_text}</div>
        
        {question.question_type === 'multiple_choice' && question.options && Array.isArray(question.options) && (
          <div className="mt-3 space-y-2">
            {question.options.map((option, i) => (
              <div 
                key={i} 
                className={`flex items-start p-2 rounded-md ${
                  option === question.correct_answer 
                    ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                    : 'bg-gray-50 border border-gray-200 dark:bg-gray-800/30 dark:border-gray-700'
                }`}
              >
                <div className="flex h-5 items-center">
                  {option === question.correct_answer ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div className="ml-3 text-sm">
                  {option}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {question.question_type === 'true_false' && (
          <div className="mt-3 space-y-2">
            <div 
              className={`flex items-start p-2 rounded-md ${
                'true' === question.correct_answer.toLowerCase() 
                  ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                  : 'bg-gray-50 border border-gray-200 dark:bg-gray-800/30 dark:border-gray-700'
              }`}
            >
              <div className="flex h-5 items-center">
                {'true' === question.correct_answer.toLowerCase() ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <div className="ml-3 text-sm">
                True
              </div>
            </div>
            <div 
              className={`flex items-start p-2 rounded-md ${
                'false' === question.correct_answer.toLowerCase() 
                  ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                  : 'bg-gray-50 border border-gray-200 dark:bg-gray-800/30 dark:border-gray-700'
              }`}
            >
              <div className="flex h-5 items-center">
                {'false' === question.correct_answer.toLowerCase() ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <div className="ml-3 text-sm">
                False
              </div>
            </div>
          </div>
        )}
        
        {question.question_type === 'essay' && (
          <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md dark:bg-gray-800/30 dark:border-gray-700">
            <div className="text-sm font-medium mb-1">Expected Answer:</div>
            <div className="text-sm whitespace-pre-wrap">{question.correct_answer}</div>
          </div>
        )}
        
        {question.explanation && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/20 dark:border-blue-800">
            <div className="text-sm font-medium mb-1">Explanation:</div>
            <div className="text-sm whitespace-pre-wrap">{question.explanation}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionCard;