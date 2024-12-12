import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useWeb3Store } from '../../store/useWeb3Store';
import { NavLink } from 'react-router-dom';
import { LoginModal } from '../LoginModal';

interface HeaderProps {
  onLoginClick: () => void;
  title: string;
}

export function Header({ onLoginClick, title }: HeaderProps) {
  const { isConnected, address, disconnect } = useWeb3Store();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      setIsLoginModalOpen(true);
    }
  }, []);

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <NavLink className="flex items-center gap-2" to="/">
          <MessageSquare className="text-blue-500" />
          <h1 className="text-xl font-semibold">{title}</h1>
        </NavLink>
        <div className="flex items-center gap-4">
          <button
            onClick={isConnected ? disconnect : onLoginClick}
            className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {isConnected ? `Disconnect (${address?.slice(0, 6)}...)` : 'Login'}
          </button>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
}
