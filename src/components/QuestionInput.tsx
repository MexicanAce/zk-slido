import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useQuestionStore } from '../store/useQuestionStore';
import { useQuestions } from '../hooks/useQuestions';

interface QuestionInputProps {
  roomId: string | undefined;
}

export function QuestionInput({ roomId = undefined }: QuestionInputProps) {
  const [question, setQuestion] = useState('');
  const { isLoading } = useQuestions(roomId);
  const addQuestion = useQuestionStore((state) => state.addQuestion);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && roomId) {
      addQuestion(roomId, question.trim());
      setQuestion('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative">
        <textarea
          maxLength={300}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key == 'Enter' && !e.shiftKey) {
              // TODO: Enable submit on Enter when users can delete/edit questions they authored
              // handleSubmit(e);
            }
          }}
          disabled={isLoading}
          placeholder="Ask a question..."
          className="w-full px-4 py-3 pr-10 rounded-lg bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
        />
        <button
          type="submit"
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:text-blue-600 disabled:opacity-50"
          disabled={!question.trim() || isLoading}
        >
          <Send size={20} />
        </button>
      </div>
      <div className="h-2 w-full border rounded relative">
        <div
          className={`absolute top-0 left-0 h-2 transition-all rounded  ${
            Math.floor((question.length / 300) * 100) > 70
              ? Math.floor((question.length / 300) * 100) > 85
                ? 'bg-red-500'
                : 'bg-yellow-500'
              : `bg-green-500`
          }`}
          style={{ width: `${Math.floor((question.length / 300) * 100)}%` }}
        ></div>
        <div className="text-sm mt-2 w-full text-right">
          {Math.floor((question.length / 300) * 100) > 85 &&
            `${300 - question.length} characters left`}
        </div>
      </div>
    </form>
  );
}
