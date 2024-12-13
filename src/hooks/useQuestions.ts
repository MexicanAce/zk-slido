import { useEffect } from 'react';
import { useQuestionStore } from '../store/useQuestionStore';
import { useWeb3Store, config } from '../store/useWeb3Store';
import { watchContractEvent } from 'viem/actions';
import { ROOM_MANAGER_ABI, ROOM_MANAGER_ADDRESS } from '../config/contracts';
import { getPublicClient } from '@wagmi/core';
import { Question } from '../types/question';

export function useQuestions(roomId: string | undefined) {
  const { questions, updateQuestions, updateNewQuestion, fetchQuestions, isLoading, error } = useQuestionStore();
  const { address } = useWeb3Store();
  const client = getPublicClient(config);

  useEffect(() => {
    if (roomId && address) {
      fetchQuestions(roomId, address);

      const unwatchQuestionAdded = watchContractEvent(client, {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        eventName: 'QuestionAdded',
        onLogs(logs) {
          logs
            .filter(log => log.args.roomId === roomId)
            .filter(log => log.args.author !== address)
            .forEach(log => {
              console.log(`Question ${log.args.questionId} has been added by ${log.args.author} with content: ${log.args.content}`);
              const newQuestion: Question = {
                id: questions.length.toString(),
                authorId: log.args.author!,
                content: log.args.content!,
                votes: 0,
                isAnswered: false,
                isDownvoted: false,
                isUpvoted: false,
                createDate: new Date(),
              };
              updateNewQuestion(newQuestion);
            });
        },
      });

      const unwatchQuestionVoted = watchContractEvent(client, {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        eventName: 'QuestionVoted',
        onLogs(logs) {
          logs
            .filter(log => log.args.roomId === roomId)
            .filter(log => log.args.voter !== address)
            .forEach(log => {
              console.log(`Question ${log.args.questionId} has been ${log.args.isUpvote ? 'upvoted' : 'downvoted'} by ${log.args.voter}`);
              console.log(questions);
              const questionUpdated = questions.findIndex(q => q.id === log.args.questionId?.toString());
              if (questionUpdated >= 0) {
                // TODO: Fix voting updates when clicking on upvote when already upvoted
                if (log.args.isUpvote) {
                  questions[questionUpdated].votes++;
                } else {
                  questions[questionUpdated].votes--;
                }
              }
            });
            updateQuestions(questions);
        },
      });

      const unwatchQuestionEdited = watchContractEvent(client, {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        eventName: 'QuestionEdited',
        onLogs(logs) {
          logs
            .filter(log => log.args.roomId === roomId)
            .filter(log => log.args.author !== address)
            .forEach(log => {
              console.log(`Question ${log.args.questionId} has been edited by ${log.args.author} with content: ${log.args.content}`);
              questions.forEach(q => {
                if (q.id == log.args.questionId!.toString()) {
                  q.content = log.args.content!;
                }
              });
              updateQuestions(questions);
            });
        },
      });

      const unwatchQuestionDeleted = watchContractEvent(client, {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        eventName: 'QuestionDeleted',
        onLogs(logs) {
          logs
            .filter(log => log.args.roomId === roomId)
            .filter(log => log.args.author !== address)
            .forEach(log => {
              console.log(`Question ${log.args.questionId} has been deleted by ${log.args.author}`);
              questions.forEach(q => {
                if (q.id == log.args.questionId!.toString()) {
                  q.content = "!!!DELETED!!!";
                }
              });
              updateQuestions(questions);
            });
        },
      });

      const unwatchQuestionStatusChanged = watchContractEvent(client, {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        eventName: 'QuestionStatusChanged',
        onLogs(logs) {
          logs
            .filter(log => log.args.roomId === roomId)
            .forEach(log => {
              console.log(`Question ${log.args.questionId} has been been marked as ${log.args.isRead ? 'read' : 'unread'}`);
              questions.forEach(q => {
                if (q.id == log.args.questionId!.toString()) {
                  q.isAnswered = !!log.args.isRead;
                }
              });
              updateQuestions(questions);
            });
        },
      });

      return () => {
        unwatchQuestionAdded();
        unwatchQuestionVoted();
        unwatchQuestionEdited();
        unwatchQuestionDeleted();
        unwatchQuestionStatusChanged();
      };
    }
  }, [roomId]);

  function refresh() {
    if (roomId && address) {
      console.log("Manually refreshing questions...");
      fetchQuestions(roomId, address);
    }
  }

  return { isLoading, error, refresh };
}
