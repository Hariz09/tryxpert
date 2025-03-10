import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

// Simple custom radio button component
const RadioButton = ({ 
  checked, 
  onChange, 
  disabled = false 
}: { 
  checked: boolean; 
  onChange: () => void; 
  disabled?: boolean 
}) => {
  return (
    <div 
      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${checked ? 'border-primary' : 'border-gray-300'}`}
      onClick={() => !disabled && onChange()}
    >
      {checked && (
        <div className="h-2.5 w-2.5 rounded-full bg-primary"></div>
      )}
    </div>
  );
};

// Multiple Choice Options Component with custom radio buttons
const MultipleChoiceOptions = ({ 
  options, 
  correctAnswer, 
  onChange, 
  onCorrectAnswerChange 
}: {
  options: string[];
  correctAnswer: string;
  onChange: (options: string[]) => void;
  onCorrectAnswerChange: (answer: string) => void;
}) => {
  const addOption = () => {
    onChange([...options, '']);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onChange(newOptions);
    
    // If this option was the correct answer, update the correct answer
    if (options[index] === correctAnswer) {
      onCorrectAnswerChange(value);
    }
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    onChange(newOptions);
    
    // If removed option was the correct answer, reset correct answer
    if (options[index] === correctAnswer) {
      onCorrectAnswerChange(newOptions.length > 0 ? newOptions[0] : '');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label>Options</Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addOption}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Option
        </Button>
      </div>
      
      {options.map((option, index) => (
        <div key={index} className="flex items-center space-x-2">
          <RadioButton
            checked={option === correctAnswer && option.trim() !== ''}
            onChange={() => option.trim() !== '' && onCorrectAnswerChange(option)}
            disabled={option.trim() === ''}
          />
          <Input 
            value={option}
            onChange={(e) => updateOption(index, e.target.value)}
            placeholder={`Option ${index + 1}`}
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            onClick={() => removeOption(index)}
            className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-100"
            disabled={options.length <= 2}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      {options.length < 2 && (
        <div className="text-sm text-red-500">At least 2 options are required</div>
      )}
    </div>
  );
};

export default MultipleChoiceOptions;