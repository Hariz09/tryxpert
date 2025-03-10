import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem,
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Save, Loader2 } from 'lucide-react';
import MultipleChoiceOptions from './MultipleChoiceOptions';

// Form schema with updated validation for options
export const questionSchema = z.object({
  question_text: z.string().min(5, "Question text is required"),
  question_type: z.enum(['multiple_choice', 'essay', 'true_false']),
  options: z.array(z.string())
    .refine(
      (options) => {
        // Only validate options for multiple_choice
        if (options && options.length > 0) {
          // Check if all options have content
          const nonEmptyOptions = options.filter(opt => opt.trim().length > 0);
          // Check for uniqueness
          const uniqueOptions = new Set(nonEmptyOptions);
          return uniqueOptions.size === nonEmptyOptions.length && nonEmptyOptions.length >= 2;
        }
        return true;
      },
      {
        message: "Multiple choice questions must have at least 2 unique options",
      }
    )
    .optional(),
  correct_answer: z.string().min(1, "Correct answer is required"),
  explanation: z.string().optional(),
  points: z.coerce.number().min(1, "Points must be at least 1"),
  order_number: z.coerce.number().optional(),
}).refine(
  (data) => {
    // Additional validation for multiple choice
    if (data.question_type === 'multiple_choice') {
      return Array.isArray(data.options) && 
             data.options.length >= 2 && 
             data.options.filter(opt => opt.trim().length > 0).length >= 2;
    }
    return true;
  },
  {
    message: "Multiple choice questions must have at least 2 options",
    path: ["options"]
  }
);

// Form types
export type QuestionFormValues = z.infer<typeof questionSchema>;

interface QuestionFormProps {
  defaultValues: QuestionFormValues;
  onSubmit: (values: QuestionFormValues) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  submitLabel: string;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isSaving,
  submitLabel
}) => {
  // Ensure defaultValues has safe initial values with nullish coalescing
  const safeDefaultValues = {
    ...defaultValues,
    options: defaultValues.options || [],
    correct_answer: defaultValues.correct_answer || '',
    explanation: defaultValues.explanation || '',
    points: defaultValues.points || 1,
  };

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: safeDefaultValues,
    mode: 'onChange', // Validate on change for better user experience
  });

  const watchQuestionType = form.watch('question_type');
  const watchOptions = form.watch('options') || [];

  // Reset form when question type changes
  React.useEffect(() => {
    if (watchQuestionType === 'multiple_choice') {
      const options = form.getValues('options');
      if (!options || options.length < 2) {
        form.setValue('options', ['', '']);
      }
    } else if (watchQuestionType === 'true_false') {
      form.setValue('options', undefined);
      const correctAnswer = form.getValues('correct_answer') || '';
      if (!['true', 'false'].includes(correctAnswer.toLowerCase())) {
        form.setValue('correct_answer', 'true');
      }
    } else {
      form.setValue('options', undefined);
    }
  }, [watchQuestionType, form]);

  // Validate options uniqueness when they change
  React.useEffect(() => {
    if (watchQuestionType === 'multiple_choice' && watchOptions) {
      const nonEmptyOptions = watchOptions.filter(opt => opt.trim().length > 0);
      const uniqueOptions = new Set(nonEmptyOptions);
      
      if (uniqueOptions.size !== nonEmptyOptions.length) {
        form.setError('options', {
          type: 'manual',
          message: 'All options must be unique'
        });
      } else if (uniqueOptions.size < 2 && watchOptions.length >= 2) {
        form.setError('options', {
          type: 'manual',
          message: 'Please provide at least 2 unique options'
        });
      } else {
        form.clearErrors('options');
      }
    }
  }, [watchOptions, watchQuestionType, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="question_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="essay">Essay</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="question_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter your question here"
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        // Updated section for the MultipleChoiceOptions in QuestionForm.tsx

{watchQuestionType === 'multiple_choice' && (
  <>
    <FormField
      control={form.control}
      name="options"
      render={({ field }) => (
        <FormItem>
          <MultipleChoiceOptions 
            options={field.value || []}
            correctAnswer={form.getValues('correct_answer') || ''}
            onChange={(options) => {
              field.onChange(options);
              // Make sure options are updated first before validating
              setTimeout(() => form.trigger('options'), 0);
            }}
            onCorrectAnswerChange={(answer) => {
              form.setValue('correct_answer', answer, { 
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
              });
            }}
          />
          <FormMessage />
        </FormItem>
      )}
    />
    
    {form.formState.errors.options && (
      <p className="text-sm font-medium text-destructive">
        {form.formState.errors.options.message}
      </p>
    )}
  </>
)}
        
        {watchQuestionType === 'true_false' && (
          <FormField
            control={form.control}
            name="correct_answer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correct Answer</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="true" />
                      <Label htmlFor="true">True</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="false" />
                      <Label htmlFor="false">False</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {watchQuestionType === 'essay' && (
          <FormField
            control={form.control}
            name="correct_answer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Answer</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter the expected answer"
                    className="min-h-24"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This will be used as a reference for grading.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="explanation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Explanation (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Provide an explanation for the answer"
                  className="min-h-20"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This will be shown to students after they answer.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Points</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The number of points this question is worth.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={
              isSaving || 
              !form.formState.isValid ||
              (watchQuestionType === 'multiple_choice' && 
               (!watchOptions || 
                watchOptions.filter(opt => opt.trim().length > 0).length < 2 ||
                new Set(watchOptions.filter(opt => opt.trim().length > 0)).size < 2))
            }
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {submitLabel}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QuestionForm;