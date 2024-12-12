import React from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';
import { Question } from '../types/question';
import { useQuestionStore } from '../store/useQuestionStore';
import { cn } from '../utils/cn';

interface QuestionCardProps {
  question: Question;
  isAdmin?: boolean;
  roomId: string;
}

export function QuestionCard({
  question,
  isAdmin = false,
  roomId,
}: QuestionCardProps) {
  const { vote, toggleAnswered, isLoading } = useQuestionStore();

  return (
    <div
      className={cn(
        'bg-white rounded-lg p-4 shadow-sm border transition-all relative',
        question.isAnswered && 'bg-gray-50 border-green-200'
      )}
    >
      {isLoading && (
        <div className="absolute w-full h-full left-0 top-0 bg-gray-300 opacity-70"></div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p
            className={`${
              question.isAnswered ? 'text-gray-300' : 'text-gray-900'
            }`}
          >
            {question.content}
          </p>
          <div className="flex flex-col mt-4">
            <span
              className={`text-sm ${
                question.isAnswered ? 'text-gray-300' : 'text-gray-500'
              }`}
            >
              {question.authorId.slice(0, 5) +
                '...' +
                question.authorId.slice(
                  question.authorId.length - 6,
                  question.authorId.length
                )}
            </span>
            <span
              className={`text-xs ${
                question.isAnswered ? 'text-gray-300' : 'text-gray-500'
              }`}
            >
              {question.createDate.toLocaleTimeString([], {
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => vote(roomId, +question.id, true)}
            disabled={question.isAnswered}
            className={`p-1 hover:text-blue-500 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed`}
          >
            <ThumbsUp size={18} className={`${question.isUpvoted ? 'fill-blue-500' : ''}`}/>
          </button>
          <span
            className={`min-w-[2rem] text-center font-medium ${
              question.isAnswered ? 'text-gray-300' : ''
            }`}
          >
            {question.votes}
          </span>
          <button
            onClick={() => vote(roomId, +question.id, false)}
            disabled={question.isAnswered}
            className={`p-1 hover:text-red-500 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed`}
          >
            <ThumbsDown size={18} className={`${question.isDownvoted ? 'fill-red-500' : ''}`} />
          </button>
          {isAdmin && (
            <button
              onClick={() => toggleAnswered(roomId, +question.id)}
              className={cn(
                'p-1 transition-colors',
                question.isAnswered
                  ? 'text-green-500'
                  : 'text-gray-400 hover:text-green-500'
              )}
            >
              <CheckCircle size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
