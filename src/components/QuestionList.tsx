import React from 'react';
import { useQuestionStore } from '../store/useQuestionStore';
import { QuestionCard } from './QuestionCard';

interface QuestionListProps {
  isAdmin?: boolean;
  roomId: string;
  address: string;
}

export function QuestionList({ isAdmin = false, roomId, address }: QuestionListProps) {
  const questions = useQuestionStore((state) => state.questions);

  const sortedQuestions = [...questions]
    .filter(x => x.content !== "!!!DELETED!!!")
    .sort((a, b) => {
      // Sort by answered status (unanswered first)
      if (a.isAnswered !== b.isAnswered) {
        return a.isAnswered ? 1 : -1;
      }
      // Then by votes (highest first)
      if (a.votes !== b.votes) {
        return b.votes - a.votes;
      }
      // Finally by timestamp (newest first)
      return b.createDate < a.createDate ? 1 : -1;
    });

  return (
    <div className="w-full max-w-2xl space-y-4">
      {sortedQuestions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          isAdmin={isAdmin}
          roomId={roomId}
          address={address}
        />
      ))}
      {questions.length === 0 && (
        <div className="text-center text-slate-50 py-8">
          No questions yet. Be the first to ask!
        </div>
      )}
    </div>
  );
}
