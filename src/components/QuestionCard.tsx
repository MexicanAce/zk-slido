import { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  Trash,
  Pencil,
  CircleUserRound,
} from "lucide-react";
import { Question } from "../types/question";
import { useQuestionStore } from "../store/useQuestionStore";
import { cn } from "../utils/cn";
import { ConfirmationModal } from "./ConfirmationModal";

interface QuestionCardProps {
  question: Question;
  isAdmin?: boolean;
  roomId: string;
  address: string;
}

function timeAgo(date: Date) {
  const now = Date.now();
  const seconds = Math.floor((now - date.getTime()) / 1000);

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }

  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

export function QuestionCard({
  question,
  isAdmin = false,
  roomId,
  address,
}: QuestionCardProps) {
  const { vote, toggleAnswered, deleteQuestion, editQuestion, isLoading } =
    useQuestionStore();
  const [displayEdit, setDisplayEdit] = useState(false);
  const [newContent, setNewContent] = useState(question.content);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <div
      className={cn(
        "bg-white rounded-lg p-4 shadow-sm border transition-all relative",
        question.isAnswered && "bg-gray-50 border-green-200"
      )}
    >
      {isLoading && (
        <div className="absolute w-full h-full left-0 top-0 bg-gray-300 opacity-70"></div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex mb-4 items-center">
            <CircleUserRound
              size={34}
              className={cn(
                "mr-2",
                question.isAnswered ? "text-gray-200" : "text-gray-300"
              )}
            />
            <div className="flex flex-col">
              <span
                className={`text-sm font-bold ${
                  question.isAnswered ? "text-gray-300" : "text-gray-500"
                }`}
              >
                {question.authorId.slice(0, 5) +
                  "..." +
                  question.authorId.slice(
                    question.authorId.length - 6,
                    question.authorId.length
                  )}
              </span>
              <span
                className={`text-xs ${
                  question.isAnswered ? "text-gray-300" : "text-gray-500"
                }`}
              >
                {timeAgo(question.createDate)}
              </span>
            </div>
          </div>
          <p
            hidden={displayEdit}
            className={cn(
              "whitespace-pre text-lg text-pretty",
              question.isAnswered ? "text-gray-300" : "text-gray-900"
            )}
          >
            {question.content}
          </p>
          <textarea
            maxLength={300}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            disabled={isLoading}
            hidden={!displayEdit}
            className={cn(
              "w-full px-4 py-3 mb-10 rounded-lg bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all",
              question.isAnswered ? "text-gray-300" : "text-gray-900"
            )}
          />
        </div>
        <div className="flex flex-col justify-between h-full">
          <div className="flex gap-2">
            <button
              onClick={() => vote(roomId, +question.id, true)}
              disabled={question.isAnswered}
              className={`p-1 hover:text-blue-500 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed ${
                question.isUpvoted ? "text-blue-500" : ""
              }`}
            >
              <ThumbsUp size={18} />
            </button>
            <span
              className={`min-w-4 text-center font-medium ${
                question.isAnswered ? "text-gray-300" : ""
              }`}
            >
              {question.votes}
            </span>
            <button
              onClick={() => vote(roomId, +question.id, false)}
              disabled={question.isAnswered}
              className={`p-1 hover:text-red-500 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed ${
                question.isDownvoted ? "text-red-500" : ""
              }`}
            >
              <ThumbsDown size={18} />
            </button>
            {isAdmin && (
              <button
                onClick={() => toggleAnswered(roomId, +question.id)}
                className={cn(
                  "p-1 transition-colors disabled:cursor-not-allowed",
                  question.isAnswered
                    ? "text-green-500"
                    : "text-gray-400 hover:text-green-500"
                )}
              >
                <CheckCircle size={18} />
              </button>
            )}
          </div>
          <div className="flex justify-end bottom-0 right-0 gap-2 absolute mr-4 mb-4">
            {(isAdmin || question.authorId == address) && (
              <>
                <button
                  onClick={() => setDisplayEdit(!displayEdit)}
                  hidden={displayEdit}
                  disabled={question.isAnswered && !isAdmin}
                  className="p-1 transition-colors text-gray-400 hover:text-gray-800 disabled:cursor-not-allowed"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => setDisplayEdit(!displayEdit)}
                  hidden={!displayEdit}
                  disabled={question.isAnswered && !isAdmin}
                  className="p-1 transition-colors text-gray-400 hover:text-gray-800 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setDisplayEdit(!displayEdit);
                    editQuestion(roomId, +question.id, newContent);
                  }}
                  hidden={!displayEdit}
                  disabled={question.isAnswered && !isAdmin}
                  className="border px-4 bg-blue-500 text-white rounded-md transition-colors hover:bg-blue-700 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </>
            )}
            {(isAdmin || question.authorId == address) && (
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={question.isAnswered && !isAdmin}
                className="p-1 transition-colors text-gray-400 hover:text-red-500 disabled:cursor-not-allowed"
              >
                <Trash size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        description="Deleting questions is a permanent action"
        confirmButtonText="Delete"
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          setIsDeleteModalOpen(false);
          deleteQuestion(roomId, +question.id);
        }}
      />
    </div>
  );
}
