import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password?: string) => void;
  signup: (username: string, password?: string) => void;
  logout: () => void;
  updateUserCredentials: (currentUsername: string, currentPassword: string, newUsername?: string, newPassword?: string) => void;
  deleteUserAccount: (username: string) => void;
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

  const login = (username: string, password?: string) => {
    const users = JSON.parse(localStorage.getItem('wallet_watcher_users') || '[]');
    const existingUser = users.find((u: any) => u.username === username);

    if (existingUser && existingUser.password === password) {
      const loggedInUser = { username };
      localStorage.setItem('wallet_watcher_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    } else {
      throw new Error('Invalid username or password');
    }
  };

  const signup = (username: string, password?: string) => {
    if (!password) {
      throw new Error('Password is required for signup.');
    }
    const users = JSON.parse(localStorage.getItem('wallet_watcher_users') || '[]');
    if (users.some((u: any) => u.username === username)) {
      throw new Error('Username already exists');
    }
    users.push({ username, password });
    localStorage.setItem('wallet_watcher_users', JSON.stringify(users));
    const newUser = { username };
    localStorage.setItem('wallet_watcher_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('wallet_watcher_user');
    setUser(null);
  };
  
  const deleteUserAccount = (username: string) => {
    const users = JSON.parse(localStorage.getItem('wallet_watcher_users') || '[]') as Array<{username: string, password: string}>;
    
    const userExists = users.some(u => u.username === username);
    if (!userExists) {
        throw new Error("Username not found.");
    }

    const updatedUsers = users.filter(u => u.username !== username);
    localStorage.setItem('wallet_watcher_users', JSON.stringify(updatedUsers));
    
    // Also delete their transactions
    const transactionsKey = `wallet_watcher_transactions_${username}`;
    localStorage.removeItem(transactionsKey);

    // If they are somehow logged in while doing this, log them out.
    if (user?.username === username) {
        logout();
    }
  };


  const updateUserCredentials = (currentUsername: string, currentPassword: string, newUsername?: string, newPassword?: string) => {
    const users = JSON.parse(localStorage.getItem('wallet_watcher_users') || '[]') as Array<{username: string, password: string}>;
    const userIndex = users.findIndex(u => u.username === currentUsername);

    if (userIndex === -1) {
        throw new Error("User not found.");
    }

    const userToUpdate = users[userIndex];

    if (userToUpdate.password !== currentPassword) {
        throw new Error("Incorrect current password.");
    }
    
    const finalNewUsername = newUsername && newUsername.trim() !== '' && newUsername.trim() !== currentUsername ? newUsername.trim() : currentUsername;
    const finalNewPassword = newPassword && newPassword.trim() !== '' ? newPassword.trim() : currentPassword;

    if (finalNewUsername !== currentUsername && users.some(u => u.username === finalNewUsername)) {
        throw new Error("New username is already taken.");
    }
    
    users[userIndex] = { username: finalNewUsername, password: finalNewPassword };
    localStorage.setItem('wallet_watcher_users', JSON.stringify(users));

    if (finalNewUsername !== currentUsername) {
        const oldTransactionsKey = `wallet_watcher_transactions_${currentUsername}`;
        const newTransactionsKey = `wallet_watcher_transactions_${finalNewUsername}`;
        const transactionsData = localStorage.getItem(oldTransactionsKey);
        
        if (transactionsData) {
            localStorage.setItem(newTransactionsKey, transactionsData);
            localStorage.removeItem(oldTransactionsKey);
        }
    }
    
    const updatedUserSession = { username: finalNewUsername };
    localStorage.setItem('wallet_watcher_user', JSON.stringify(updatedUserSession));
    setUser(updatedUserSession);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUserCredentials, deleteUserAccount }}>
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
