import React from 'react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenAccountModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenAccountModal }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">Wallet Watcher</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Welcome, {user?.username}</span>
            <button
              onClick={onOpenAccountModal}
              className="px-3 py-1.5 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-colors duration-300"
            >
              Account
            </button>
            <button
              onClick={logout}
              className="px-3 py-1.5 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-colors duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
