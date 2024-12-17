import { useState } from 'react';
import { useRoomStore } from '../store/useRoomStore';
import { shortenAddress } from '../utils/misc';

interface AddAdminModalProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddAdminModal({ roomId, isOpen, onClose }: AddAdminModalProps) {
  const { addAdmin, isLoading } = useRoomStore();
  const [addressToAdd, setAddressToAdd] = useState('');

  if (!isOpen) return null;

  const handleAddAdmin = async () => {
    try {
      await addAdmin(roomId as `0x${string}`, addressToAdd as `0x${string}`);
      onClose();
    } catch (error) {
      console.error('Failed to addAdmin:', error);
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
        <h2 className="text-xl font-semibold mb-4">Add admin to Room {shortenAddress(roomId)}</h2>
        <input
          type='text'
          value={addressToAdd}
          onChange={(e) => setAddressToAdd(e.target.value)}
          disabled={isLoading}
          placeholder="0xabc123..."
          className="w-full px-4 py-3 pr-10 mt-2 rounded-lg bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
        />
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={isLoading}
            onClick={handleAddAdmin}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Add Admin
          </button>
        </div>
      </div>
    </div>
  );
}
