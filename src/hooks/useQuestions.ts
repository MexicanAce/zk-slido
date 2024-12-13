import { useEffect } from "react";
import { useQuestionStore } from "../store/useQuestionStore";
import { useWeb3Store, config } from "../store/useWeb3Store";
import { watchContractEvent } from "viem/actions";
import { ROOM_MANAGER_ABI, ROOM_MANAGER_ADDRESS } from "../config/contracts";
import { getPublicClient } from "@wagmi/core";
import { Question } from "../types/question";

export function useQuestions(roomId: string | undefined) {
  const {
    questions,
    updateNewQuestion,
    updateQuestionContent,
    updateVoteCount,
    updateQuestionStatus,
    fetchQuestions,
    isLoading,
    error,
  } = useQuestionStore();
  const { address } = useWeb3Store();
  const client = getPublicClient(config);

  useEffect(() => {
    if (roomId && address) {
      fetchQuestions(roomId, address);

      const unwatchQuestionAdded = watchContractEvent(client, {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        eventName: "QuestionAdded",
        onLogs(logs) {
          logs
            .filter((log) => log.args.roomId === roomId)
            .filter((log) => log.args.author !== address)
            .forEach((log) => {
              console.log(
                `Question ${log.args.questionId} has been added by ${log.args.author} with content: ${log.args.content}`
              );
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
        eventName: "QuestionVoted",
        onLogs(logs) {
          logs
            .filter((log) => log.args.roomId === roomId)
            .filter((log) => log.args.voter !== address)
            .forEach((log) => {
              console.log(
                `Question ${log.args.questionId} has been ${
                  log.args.isUpvote ? "upvoted" : "downvoted"
                } by ${log.args.voter} with upvotes/downvotes (${
                  log.args.upvoteCount
                }/${log.args.downvoteCount})`
              );
              updateVoteCount(
                log.args.questionId!.toString(),
                Number(log.args.upvoteCount! - log.args.downvoteCount!)
              );
            });
        },
      });

      const unwatchQuestionEdited = watchContractEvent(client, {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        eventName: "QuestionEdited",
        onLogs(logs) {
          logs
            .filter((log) => log.args.roomId === roomId)
            .filter((log) => log.args.author !== address)
            .forEach((log) => {
              console.log(
                `Question ${log.args.questionId} has been edited by ${log.args.author} with content: ${log.args.content}`
              );
              updateQuestionContent(log.args.questionId!.toString(), log.args.content!);
            });
        },
      });

      const unwatchQuestionDeleted = watchContractEvent(client, {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        eventName: "QuestionDeleted",
        onLogs(logs) {
          logs
            .filter((log) => log.args.roomId === roomId)
            .filter((log) => log.args.author !== address)
            .forEach((log) => {
              console.log(
                `Question ${log.args.questionId} has been deleted by ${log.args.author}`
              );
              updateQuestionContent(log.args.questionId!.toString(), "!!!DELETED!!!");
            });
        },
      });

      const unwatchQuestionStatusChanged = watchContractEvent(client, {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        eventName: "QuestionStatusChanged",
        onLogs(logs) {
          logs
            .filter((log) => log.args.roomId === roomId)
            .forEach((log) => {
              console.log(
                `Question ${log.args.questionId} has been been marked as ${
                  log.args.isRead ? "read" : "unread"
                }`
              );
              updateQuestionStatus(log.args.questionId!.toString(), !!log.args.isRead);
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
  }, [roomId, address]);

  function refresh() {
    if (roomId && address) {
      console.log("Manually refreshing questions...");
      fetchQuestions(roomId, address);
    }
  }

  return { isLoading, error, refresh };
}
