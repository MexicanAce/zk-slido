import React from 'react';
import { useWeb3Store } from '../store/useWeb3Store';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { connect, isConnected } = useWeb3Store();

  if (!isOpen || isConnected) return null;

  const handleLogin = async () => {
    try {
      await connect();
      onClose();
    } catch (error) {
      console.error('Failed to connect:', error);
      // Show error message to user
      alert('Failed to connect. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-96 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Welcome to Q&A</h2>
        <p className="text-gray-600 mb-6">
          Login to participate in the Q&A sessions. This will allow you to
          create rooms, ask questions, and vote on others' questions.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
