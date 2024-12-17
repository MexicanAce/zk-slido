import { type Address } from "viem";

export const ROOM_MANAGER_ADDRESS =
  "0x462057041505219a9f4b2F4dAC794023b2a4205a" as Address;
export const ROOM_MANAGER_PAYMASTER_ADDRESS =
  "0x1F23dC88380cdc64Af4c019dB7d160AdFEFB10ed" as Address;

export const ROOM_MANAGER_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "roomId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newAdmin",
        type: "address",
      },
    ],
    name: "AdminAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint8", name: "version", type: "uint8" },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "roomId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "questionId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "author",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "content",
        type: "string",
      },
    ],
    name: "QuestionAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "roomId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "questionId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "author",
        type: "address",
      },
    ],
    name: "QuestionDeleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "roomId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "questionId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "author",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "content",
        type: "string",
      },
    ],
    name: "QuestionEdited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "roomId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "questionId",
        type: "uint256",
      },
      { indexed: false, internalType: "bool", name: "isRead", type: "bool" },
    ],
    name: "QuestionStatusChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "roomId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "questionId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "voter",
        type: "address",
      },
      { indexed: false, internalType: "bool", name: "isUpvote", type: "bool" },
      {
        indexed: false,
        internalType: "uint256",
        name: "upvoteCount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "downvoteCount",
        type: "uint256",
      },
    ],
    name: "QuestionVoted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "roomId",
        type: "bytes32",
      },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      {
        indexed: false,
        internalType: "address",
        name: "admin",
        type: "address",
      },
    ],
    name: "RoomCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "roomId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "UserBanned",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "roomId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "UserUnbanned",
    type: "event",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "_roomId", type: "bytes32" },
      { internalType: "address", name: "_newAdmin", type: "address" },
    ],
    name: "addAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "_roomId", type: "bytes32" },
      { internalType: "string", name: "_content", type: "string" },
    ],
    name: "addQuestion",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "_roomId", type: "bytes32" },
      { internalType: "address", name: "_user", type: "address" },
    ],
    name: "banUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "_name", type: "string" }],
    name: "createRoom",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "_roomId", type: "bytes32" },
      { internalType: "uint256", name: "_questionId", type: "uint256" },
    ],
    name: "deleteQuestion",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "_roomId", type: "bytes32" },
      { internalType: "uint256", name: "_questionId", type: "uint256" },
      { internalType: "string", name: "_content", type: "string" },
    ],
    name: "editQuestion",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "_roomId", type: "bytes32" },
      { internalType: "address", name: "_user", type: "address" },
    ],
    name: "getAllQuestions",
    outputs: [
      {
        components: [
          { internalType: "address", name: "author", type: "address" },
          { internalType: "string", name: "content", type: "string" },
          { internalType: "uint256", name: "createDate", type: "uint256" },
          { internalType: "uint256", name: "upvoteCount", type: "uint256" },
          { internalType: "uint256", name: "downvoteCount", type: "uint256" },
          { internalType: "bool", name: "isRead", type: "bool" },
          { internalType: "bool", name: "isUpvoted", type: "bool" },
          { internalType: "bool", name: "isDownvoted", type: "bool" },
        ],
        internalType: "struct RoomManager.QuestionResponse[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "_roomId", type: "bytes32" }],
    name: "getQuestionCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "_roomId", type: "bytes32" }],
    name: "getRoom",
    outputs: [
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "address[]", name: "admins", type: "address[]" },
        ],
        internalType: "struct RoomManager.RoomResponse",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "_roomId", type: "bytes32" },
      { internalType: "address", name: "_user", type: "address" },
    ],
    name: "isAdmin",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "_roomId", type: "bytes32" },
      { internalType: "address", name: "_user", type: "address" },
    ],
    name: "isBanned",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "", type: "bytes32" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "roomQuestions",
    outputs: [
      { internalType: "address", name: "author", type: "address" },
      { internalType: "string", name: "content", type: "string" },
      { internalType: "uint256", name: "upvoteCount", type: "uint256" },
      { internalType: "uint256", name: "downvoteCount", type: "uint256" },
      { internalType: "uint256", name: "createDate", type: "uint256" },
      { internalType: "bool", name: "isRead", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    name: "rooms",
    outputs: [{ internalType: "string", name: "name", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "_roomId", type: "bytes32" },
      { internalType: "uint256", name: "_questionId", type: "uint256" },
    ],
    name: "toggleQuestionStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "_roomId", type: "bytes32" },
      { internalType: "address", name: "_user", type: "address" },
    ],
    name: "unbanUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "_roomId", type: "bytes32" },
      { internalType: "uint256", name: "_questionId", type: "uint256" },
      { internalType: "bool", name: "_isUpvote", type: "bool" },
    ],
    name: "voteQuestion",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export type RoomManagerContract = {
  address: Address;
  abi: typeof ROOM_MANAGER_ABI;
};
