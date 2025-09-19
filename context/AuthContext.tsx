
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string) => void;
  signup: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('wallet_watcher_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (username: string) => {
    const users = JSON.parse(localStorage.getItem('wallet_watcher_users') || '[]');
    if (users.includes(username)) {
      const loggedInUser = { username };
      localStorage.setItem('wallet_watcher_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    } else {
      throw new Error('User not found');
    }
  };

  const signup = (username: string) => {
    const users = JSON.parse(localStorage.getItem('wallet_watcher_users') || '[]');
    if (users.includes(username)) {
      throw new Error('Username already exists');
    }
    users.push(username);
    localStorage.setItem('wallet_watcher_users', JSON.stringify(users));
    const newUser = { username };
    localStorage.setItem('wallet_watcher_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('wallet_watcher_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
