import { create } from 'zustand';
import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
  getPublicClient,
} from '@wagmi/core';
import {
  ROOM_MANAGER_ADDRESS,
  ROOM_MANAGER_ABI,
  ROOM_MANAGER_PAYMASTER_ADDRESS,
} from '../config/contracts';
import { useRoomStore } from './useRoomStore';
import type { Address } from 'viem';
import { config } from './useWeb3Store';
import { Question } from '../types/question';
import { getGeneralPaymasterInput } from 'viem/zksync';

interface QuestionStore {
  questions: Question[];
  isLoading: boolean;
  error: string | null;
  userAddress: string;
  updateNewQuestion: (question: Question) => void;
  updateQuestionContent: (questionId: string, content: string) => void;
  updateVoteCount: (questionId: string, voteCount: number) => void;
  updateQuestionStatus: (questionId: string, isAnswered: boolean) => void;
  fetchQuestions: (roomId: string, address?: string) => Promise<void>;
  addQuestion: (roomId: string, content: string) => Promise<void>;
  vote: (
    roomId: string,
    questionId: number,
    isUpvote: boolean
  ) => Promise<void>;
  toggleAnswered: (roomId: string, questionId: number) => Promise<void>;
  editQuestion: (roomId: string, questionId: number, content: string) => Promise<void>;
  deleteQuestion: (roomId: string, questionId: number) => Promise<void>;
}

export const useQuestionStore = create<QuestionStore>((set, get) => ({
  questions: [],
  isLoading: false,
  error: null,
  userAddress: '0x',

  updateNewQuestion: (newQuestion: Question) => {
    const newQuestions = [...get().questions];
    if (get().questions.find(q => q.id === newQuestion.id)) {
      // Question already added
      return;
    }

    newQuestions.push(newQuestion)
    set({ questions: newQuestions});
  },

  updateQuestionContent: (questionId: string, content: string) => {
    const newQuestions = [...get().questions];
    newQuestions.forEach(q => {
      if (q.id == questionId!.toString()) {
        q.content = content;
      }
    });
    set({ questions: newQuestions});
  },

  updateVoteCount: (questionId: string, voteCount: number) => {
    const newQuestions = [...get().questions];
    newQuestions.forEach(q => {
      if (q.id == questionId!.toString()) {
        q.votes = voteCount;
      }
    });
    set({ questions: newQuestions});
  },

  updateQuestionStatus: (questionId: string, isAnswered: boolean) => {
    const newQuestions = [...get().questions];
    newQuestions.forEach(q => {
      if (q.id == questionId!.toString()) {
        q.isAnswered = isAnswered;
      }
    });
    set({ questions: newQuestions});
  },

  fetchQuestions: async (
    roomId: string,
    address: string = get().userAddress
  ) => {
    set({ isLoading: true, error: null });
    try {
      // Fetch all questions
      const questions: Question[] = [];
      const questionData = await readContract(config, {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        functionName: 'getAllQuestions',
        args: [roomId as `0x${string}`, address as `0x${string}`],
      });

      set({ userAddress: address });

      console.log({ questionData });

      questionData.forEach((question, i) => {
        questions.push({
          id: i.toString(),
          content: question.content,
          votes: Number(question.upvoteCount) - Number(question.downvoteCount),
          isAnswered: question.isRead,
          authorId: question.author as string,
          createDate: new Date(Number(question.createDate) * 1000),
          isUpvoted: question.isUpvoted,
          isDownvoted: question.isDownvoted,
        });
      });

      set({ questions, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      set({ error: 'Failed to fetch questions', isLoading: false });
    }
  },

  addQuestion: async (roomId: string, content: string) => {
    set({ isLoading: true, error: null });
    try {
      const hash = await writeContract(config, {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        functionName: 'addQuestion',
        args: [roomId as `0x${string}`, content],
        paymaster: ROOM_MANAGER_PAYMASTER_ADDRESS,
        paymasterInput: getGeneralPaymasterInput({ innerInput: '0x' }),
      });

      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status === 'reverted') {
        throw new Error('Transaction reverted');
      }

      // Refresh questions after adding new one
      await get().fetchQuestions(roomId);
    } catch (error) {
      console.error('Failed to add question:', error);
      set({ isLoading: false, error: 'Failed to add question' });
    }
  },

  vote: async (roomId: string, questionId: number, isUpvote: boolean) => {
    set({ isLoading: true });
    try {
      const hash = await writeContract(config, {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        functionName: 'voteQuestion',
        args: [roomId as `0x${string}`, BigInt(questionId), isUpvote],
        paymaster: ROOM_MANAGER_PAYMASTER_ADDRESS,
        paymasterInput: getGeneralPaymasterInput({ innerInput: '0x' }),
        gas: 500_000n, // Hard-coded to speed up UX (as there's no need for gas estimation)
        maxPriorityFeePerGas: 0n, // Hard-coded to speed up UX
        chainId: config.chains[0].id,
      });

      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status === 'reverted') {
        throw new Error('Transaction reverted');
      }

      // Refresh questions after voting
      await get().fetchQuestions(roomId);
    } catch (error) {
      console.error('Failed to vote:', error);
      set({ error: 'Failed to vote on question' });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleAnswered: async (roomId: string, questionId: number) => {
    set({ isLoading: true });
    try {
      const hash = await writeContract(config, {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        functionName: 'toggleQuestionStatus',
        args: [roomId as `0x${string}`, BigInt(questionId)],
        paymaster: ROOM_MANAGER_PAYMASTER_ADDRESS,
        paymasterInput: getGeneralPaymasterInput({ innerInput: '0x' }),
      });

      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status === 'reverted') {
        throw new Error('Transaction reverted');
      }

      // Refresh questions after toggling status
      await get().fetchQuestions(roomId);
    } catch (error) {
      console.error('Failed to toggle question status:', error);
      set({ isLoading: false, error: 'Failed to update question status' });
    }
  },

  editQuestion: async (roomId: string, questionId: number, content: string) => {
    set({ isLoading: true });
    try {
      const hash = await writeContract(config, {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        functionName: 'editQuestion',
        args: [roomId as `0x${string}`, BigInt(questionId), content],
        paymaster: ROOM_MANAGER_PAYMASTER_ADDRESS,
        paymasterInput: getGeneralPaymasterInput({ innerInput: '0x' }),
      });

      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status === 'reverted') {
        throw new Error('Transaction reverted');
      }

      // Refresh questions after toggling status
      await get().fetchQuestions(roomId);
    } catch (error) {
      console.error('Failed to update question:', error);
      set({ isLoading: false, error: 'Failed to update question' });
    }
  },

  deleteQuestion: async (roomId: string, questionId: number) => {
    set({ isLoading: true });
    try {
      const hash = await writeContract(config, {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        functionName: 'deleteQuestion',
        args: [roomId as `0x${string}`, BigInt(questionId)],
        paymaster: ROOM_MANAGER_PAYMASTER_ADDRESS,
        paymasterInput: getGeneralPaymasterInput({ innerInput: '0x' }),
      });

      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status === 'reverted') {
        throw new Error('Transaction reverted');
      }

      // Refresh questions after toggling status
      await get().fetchQuestions(roomId);
    } catch (error) {
      console.error('Failed to delete question:', error);
      set({ isLoading: false, error: 'Failed to delete question' });
    }
  },
}));
