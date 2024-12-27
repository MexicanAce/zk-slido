import React, { useEffect, useState } from "react";
import { Copy, MessageSquare } from "lucide-react";
import { useWeb3Store } from "../../store/useWeb3Store";
import { NavLink } from "react-router-dom";
import { LoginModal } from "../LoginModal";
import { shortenAddress } from "../../utils/misc";

interface HeaderProps {
  onLoginClick: () => void;
  title: string;
}

export function Header({ onLoginClick, title }: HeaderProps) {
  const { isConnected, address, disconnect } = useWeb3Store();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [displayCopySuccess, setDisplayCopySuccess] = useState(false);

  function onCopyClicked() {
    navigator.clipboard.writeText(address!);
    setDisplayCopySuccess(true);
    setTimeout(() => {
      setDisplayCopySuccess(false);
    }, 1000);
  }

  useEffect(() => {
    if (!isConnected) {
      setIsLoginModalOpen(true);
    }
  }, []);

  return (
    <header className="bg-gray-200 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-60 text-black rounded-b-lg sticky z-20">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <NavLink className="flex items-center gap-2" to="/">
          <MessageSquare className="text-blue-800" />
          <h1 className="text-xl font-semibold">{title}</h1>
        </NavLink>
        <div className="flex items-center gap-4">
          {isConnected &&
            <div className="relative flex items-center text-sm text-slate-800 italic hover:cursor-pointer hover:text-black" onClick={onCopyClicked}>
              <Copy size={16} className="mr-2"/>
              {shortenAddress(address!)}
              <span
                  className={`absolute w-32 left-0 top-10 transition-all rounded bg-gray-800 p-2 text-center z-10 text-white ${
                    displayCopySuccess ? "scale-100" : "scale-0"
                  }`}
                >
                  📋 Copied to clipboard!
                </span>
            </div>
          }
          <button
            onClick={isConnected ? disconnect : onLoginClick}
            className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {isConnected ? `Disconnect` : "Login"}
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
