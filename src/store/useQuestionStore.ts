import { create } from "zustand";
import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
} from "@wagmi/core";
import {
  ROOM_MANAGER_ADDRESS,
  ROOM_MANAGER_ABI,
  ROOM_MANAGER_PAYMASTER_ADDRESS,
} from "../config/contracts";
import { config, isSessionInvalid } from "./useWeb3Store";
import { Question } from "../types/question";
import { getGeneralPaymasterInput } from "viem/zksync";
import { decryptWithPrivateKey, encryptWithPrivateKey } from "../utils/encrypt";
import { ContractFunctionExecutionError } from "viem";

interface QuestionStore {
  questions: Question[];
  isLoading: boolean;
  error: string | null;
  userAddress: string;
  updateNewQuestion: (roomId: string, question: Question) => Promise<void>;
  updateQuestionContent: (questionId: string, content: string) => void;
  updateVoteCount: (questionId: string, upvotes: number, downvotes: number) => void;
  updateQuestionStatus: (questionId: string, isAnswered: boolean) => void;
  fetchQuestions: (roomId: string, address?: string) => Promise<void>;
  addQuestion: (roomId: string, content: string) => Promise<void>;
  vote: (
    roomId: string,
    questionId: number,
    isUpvote: boolean
  ) => Promise<void>;
  toggleAnswered: (roomId: string, questionId: number) => Promise<void>;
  editQuestion: (
    roomId: string,
    questionId: number,
    content: string
  ) => Promise<void>;
  deleteQuestion: (roomId: string, questionId: number) => Promise<void>;
}

export const useQuestionStore = create<QuestionStore>((set, get) => ({
  questions: [],
  isLoading: false,
  error: null,
  userAddress: "0x",

  updateNewQuestion: async (roomId: string, newQuestion: Question) => {
    const newQuestions = [...get().questions];
    if (get().questions.find((q) => q.id === newQuestion.id)) {
      // Question already added
      return;
    }

    newQuestion.content = await decryptWithPrivateKey(
      roomId,
      newQuestion.content
    );
    newQuestions.push(newQuestion);
    set({ questions: newQuestions });
  },

  updateQuestionContent: (questionId: string, content: string) => {
    const newQuestions = [...get().questions];
    newQuestions.forEach((q) => {
      if (q.id == questionId!.toString()) {
        q.content = content;
      }
    });
    set({ questions: newQuestions });
  },

  updateVoteCount: (questionId: string, upvotes: number, downvotes: number) => {
    const newQuestions = [...get().questions];
    newQuestions.forEach((q) => {
      if (q.id == questionId!.toString()) {
        q.votes = upvotes - downvotes;
        q.upvotes = upvotes;
        q.downvotes = downvotes;
      }
    });
    set({ questions: newQuestions });
  },

  updateQuestionStatus: (questionId: string, isAnswered: boolean) => {
    const newQuestions = [...get().questions];
    newQuestions.forEach((q) => {
      if (q.id == questionId!.toString()) {
        q.isAnswered = isAnswered;
      }
    });
    set({ questions: newQuestions });
  },

  fetchQuestions: async (
    roomId: string,
    address?: string,
  ) => {
    set({ isLoading: true, error: null });

    if (!address) {
      address = get().userAddress || ROOM_MANAGER_ADDRESS;
    }

    try {
      // Fetch all questions
      const questions: Question[] = [];
      const questionData = await readContract(config, {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        functionName: "getAllQuestions",
        args: [roomId as `0x${string}`, address as `0x${string}`],
      });

      set({ userAddress: address });

      console.log({ questionData });

      for (let i = 0; i < questionData.length; i++) {
        const question = questionData[i];
        questions.push({
          id: i.toString(),
          content: await decryptWithPrivateKey(roomId, question.content),
          votes: Number(question.upvoteCount) - Number(question.downvoteCount),
          upvotes: Number(question.upvoteCount),
          downvotes: Number(question.downvoteCount),
          isAnswered: question.isRead,
          authorId: question.author as string,
          createDate: new Date(Number(question.createDate) * 1000),
          isUpvoted: question.isUpvoted,
          isDownvoted: question.isDownvoted,
        });
      }

      set({ questions, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      set({ error: "Failed to fetch questions", isLoading: false });
    }
  },

  addQuestion: async (roomId: string, content: string) => {
    set({ isLoading: true, error: null });
    try {
      const encryptedMessage = await encryptWithPrivateKey(roomId, content);
      const hash = await writeContract(config, {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        functionName: "addQuestion",
        args: [roomId as `0x${string}`, encryptedMessage],
        paymaster: ROOM_MANAGER_PAYMASTER_ADDRESS,
        paymasterInput: getGeneralPaymasterInput({ innerInput: "0x" }),
      });

      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status === "reverted") {
        throw new Error("Transaction reverted");
      }

      // Refresh questions after adding new one
      await get().fetchQuestions(roomId);
    } catch (error) {
      console.error("Failed to add question:", error);
      let displayError = "Failed to add question";
      if (
        error instanceof ContractFunctionExecutionError &&
        isSessionInvalid(error.cause.shortMessage)
      ) {
        displayError += " due to invalid session";
      }
      set({ isLoading: false, error: displayError });
    }
  },

  vote: async (roomId: string, questionId: number, isUpvote: boolean) => {
    set({ isLoading: true });
    try {
      const hash = await writeContract(config, {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        functionName: "voteQuestion",
        args: [roomId as `0x${string}`, BigInt(questionId), isUpvote],
        paymaster: ROOM_MANAGER_PAYMASTER_ADDRESS,
        paymasterInput: getGeneralPaymasterInput({ innerInput: "0x" }),
        // gas: 500_000n, // Hard-coded to speed up UX (as there's no need for gas estimation)
        maxPriorityFeePerGas: 0n, // Hard-coded to speed up UX
        chainId: config.chains[0].id,
      });

      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status === "reverted") {
        throw new Error("Transaction reverted");
      }

      // Refresh questions after voting
      await get().fetchQuestions(roomId);
    } catch (error) {
      console.error("Failed to vote:", error);
      let displayError = "Failed to vote on question";
      if (
        error instanceof ContractFunctionExecutionError &&
        isSessionInvalid(error.cause.shortMessage)
      ) {
        displayError += " due to invalid session";
      }
      set({ error: displayError });
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
        functionName: "toggleQuestionStatus",
        args: [roomId as `0x${string}`, BigInt(questionId)],
        paymaster: ROOM_MANAGER_PAYMASTER_ADDRESS,
        paymasterInput: getGeneralPaymasterInput({ innerInput: "0x" }),
      });

      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status === "reverted") {
        throw new Error("Transaction reverted");
      }

      // Refresh questions after toggling status
      await get().fetchQuestions(roomId);
    } catch (error) {
      console.error("Failed to toggle question status:", error);
      let displayError = "Failed to update question status";
      if (
        error instanceof ContractFunctionExecutionError &&
        isSessionInvalid(error.cause.shortMessage)
      ) {
        displayError += " due to invalid session";
      }
      set({ isLoading: false, error: displayError });
    }
  },

  editQuestion: async (roomId: string, questionId: number, content: string) => {
    set({ isLoading: true });
    try {
      const encryptedMessage = await encryptWithPrivateKey(roomId, content);
      const hash = await writeContract(config, {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        functionName: "editQuestion",
        args: [roomId as `0x${string}`, BigInt(questionId), encryptedMessage],
        paymaster: ROOM_MANAGER_PAYMASTER_ADDRESS,
        paymasterInput: getGeneralPaymasterInput({ innerInput: "0x" }),
      });

      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status === "reverted") {
        throw new Error("Transaction reverted");
      }

      // Refresh questions after toggling status
      await get().fetchQuestions(roomId);
    } catch (error) {
      console.error("Failed to update question:", error);
      let displayError = "Failed to update question";
      if (
        error instanceof ContractFunctionExecutionError &&
        isSessionInvalid(error.cause.shortMessage)
      ) {
        displayError += " due to invalid session";
      }
      set({ isLoading: false, error: displayError });
    }
  },

  deleteQuestion: async (roomId: string, questionId: number) => {
    set({ isLoading: true });
    try {
      const hash = await writeContract(config, {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        functionName: "deleteQuestion",
        args: [roomId as `0x${string}`, BigInt(questionId)],
        paymaster: ROOM_MANAGER_PAYMASTER_ADDRESS,
        paymasterInput: getGeneralPaymasterInput({ innerInput: "0x" }),
      });

      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status === "reverted") {
        throw new Error("Transaction reverted");
      }

      // Refresh questions after toggling status
      await get().fetchQuestions(roomId);
    } catch (error) {
      console.error("Failed to delete question:", error);
      let displayError = "Failed to delete question";
      if (
        error instanceof ContractFunctionExecutionError &&
        isSessionInvalid(error.cause.shortMessage)
      ) {
        displayError += " due to invalid session";
      }
      set({ isLoading: false, error: displayError });
    }
  },
}));
