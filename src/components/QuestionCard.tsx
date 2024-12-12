import React from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle, Trash, Pencil } from 'lucide-react';
import { Question } from '../types/question';
import { useQuestionStore } from '../store/useQuestionStore';
import { cn } from '../utils/cn';

interface QuestionCardProps {
  question: Question;
  isAdmin?: boolean;
  roomId: string;
  address: string;
}

export function QuestionCard({
  question,
  isAdmin = false,
  roomId,
  address,
}: QuestionCardProps) {
  const { vote, toggleAnswered, deleteQuestion, editQuestion, isLoading } = useQuestionStore();

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
        <div className="flex flex-col justify-between h-full">
          <div className="flex gap-2">
            <button
              onClick={() => vote(roomId, +question.id, true)}
              disabled={question.isAnswered}
              className={`p-1 hover:text-blue-500 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed ${
                question.isUpvoted ? 'text-blue-500' : ''
              }`}
            >
              <ThumbsUp size={18} />
            </button>
            <span
              className={`min-w-4 text-center font-medium ${
                question.isAnswered ? 'text-gray-300' : ''
              }`}
            >
              {question.votes}
            </span>
            <button
              onClick={() => vote(roomId, +question.id, false)}
              disabled={question.isAnswered}
              className={`p-1 hover:text-red-500 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed ${
                question.isDownvoted ? 'text-red-500' : ''
              }`}
            >
              <ThumbsDown size={18} />
            </button>
            {isAdmin && (
              <button
                onClick={() => toggleAnswered(roomId, +question.id)}
                className={cn(
                  'p-1 transition-colors disabled:cursor-not-allowed',
                  question.isAnswered
                    ? 'text-green-500'
                    : 'text-gray-400 hover:text-green-500'
                )}
              >
                <CheckCircle size={18} />
              </button>
            )}
          </div>
          <div className="flex justify-end bottom-0 right-0 gap-2 absolute mr-4 mb-4">
            {(isAdmin || question.authorId == address) && (
              <button
                onClick={() => deleteQuestion(roomId, +question.id)}
                disabled={question.isAnswered && !isAdmin}
                className="p-1 transition-colors text-gray-400 hover:text-red-500 disabled:cursor-not-allowed">
                <Trash size={18} />
              </button>
            )}
            {/* {(isAdmin || question.authorId == address) && (
              <button
                onClick={() => editQuestion(roomId, +question.id, "test")}
                disabled={!isAdmin}
                className="p-1 transition-colors text-gray-400 hover:text-gray-800 disabled:cursor-not-allowed">
                <Pencil size={18} />
              </button>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
}
