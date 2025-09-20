import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [usernameToDelete, setUsernameToDelete] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, signup, deleteUserAccount } = useAuth();

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }
    try {
      if (isLogin) {
        login(username, password);
      } else {
        signup(username, password);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    }
  };

  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!usernameToDelete) {
      setError('Please enter the username of the account to delete.');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete the account for "${usernameToDelete}"? All associated data will be lost forever.`)) {
        try {
            deleteUserAccount(usernameToDelete);
            setSuccess(`Account "${usernameToDelete}" has been deleted. You can now create a new account.`);
            setUsernameToDelete('');
            setShowForgotPassword(false);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred while deleting the account.');
            }
        }
    }
  };
  
  const resetState = () => {
    setError('');
    setSuccess('');
    setUsername('');
    setPassword('');
    setUsernameToDelete('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
        {showForgotPassword ? (
          <>
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-extrabold text-white">Account Recovery</h2>
              <p className="mt-2 text-sm text-gray-400">Delete account to start over.</p>
            </div>
             <div className="bg-red-900 border-l-4 border-red-500 text-red-100 p-2" role="alert">
              <p className="text-xs">
                <strong>Warning:</strong> This action is irreversible. It will permanently delete the user account and all of its financial data from this browser.
              </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleDeleteSubmit}>
              <div className="rounded-md shadow-sm">
                <label htmlFor="username-delete" className="sr-only">Username to Delete</label>
                <input
                  id="username-delete"
                  name="username-delete"
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                  placeholder="Enter username to delete"
                  value={usernameToDelete}
                  onChange={(e) => setUsernameToDelete(e.target.value)}
                />
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              {success && <p className="text-green-500 text-sm text-center">{success}</p>}

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-colors duration-300"
                >
                  Delete Account
                </button>
              </div>
            </form>
            <div className="text-sm text-center">
              <button onClick={() => { setShowForgotPassword(false); resetState(); }} className="font-medium text-brand-primary hover:text-brand-secondary">
                Back to Login
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-extrabold text-white">
                {isLogin ? 'Sign in to your account' : 'Create a new account'}
              </h2>
              <p className="mt-2 text-sm text-gray-400">Welcome to Wallet Watcher</p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleAuthSubmit}>
              <div className="rounded-md shadow-sm space-y-4">
                <div>
                  <label htmlFor="username" className="sr-only">Username</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password-input" className="sr-only">Password</label>
                  <input
                    id="password-input"
                    name="password"
                    type="password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                 <div className="bg-yellow-900 border-l-4 border-yellow-500 text-yellow-100 p-2" role="alert">
                  <p className="text-xs">
                    <strong>Security Notice:</strong> This is a demo. Do not use a real password. All data is stored locally in your browser.
                  </p>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              {success && <p className="text-green-500 text-sm text-center">{success}</p>}

              <div className="flex items-center justify-between text-sm">
                 <button type="button" onClick={() => { setShowForgotPassword(true); resetState(); }} className="font-medium text-brand-primary hover:text-brand-secondary">
                    Forgot password?
                 </button>
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-brand-secondary transition-colors duration-300"
                >
                  {isLogin ? 'Sign in' : 'Sign up'}
                </button>
              </div>
            </form>
            <div className="text-sm text-center">
              <button onClick={() => { setIsLogin(!isLogin); resetState(); }} className="font-medium text-brand-primary hover:text-brand-secondary">
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
