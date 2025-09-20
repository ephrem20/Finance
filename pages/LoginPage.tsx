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
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
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
            <form className="space-y-6" onSubmit={handleDeleteSubmit}>
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
              <h2 className="text-3xl font-extrabold text-white">
                {isLogin ? 'Sign in to your account' : 'Create a new account'}
              </h2>
              <p className="mt-2 text-sm text-gray-400">Welcome to Wallet Watcher</p>
            </div>
            
            <div className="relative group">
              <button
                type="button"
                disabled
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-600 text-sm font-medium rounded-md text-white bg-gray-700 cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 8.841C34.524 4.962 29.582 2.5 24 2.5C11.318 2.5 1.5 12.318 1.5 25s9.818 22.5 22.5 22.5S46.5 37.682 46.5 25c0-2.222-.204-4.36-.589-6.417z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12.5 24 12.5c3.059 0 5.842 1.154 7.961 3.039l5.843-5.843A22.385 22.385 0 0 0 24 2.5C11.318 2.5 1.5 12.318 1.5 25c0 2.222.204 4.36.589 6.417l7.22-5.263C8.614 24.5 8 21.8 8 18.9c0-2.016.388-3.924 1.081-5.701z"></path><path fill="#4CAF50" d="M24 47.5c5.582 0 10.524-2.462 14.804-6.341l-5.843-5.843A11.956 11.956 0 0 1 24 37.5c-6.627 0-12-5.373-12-12c0-.982.124-1.933.356-2.834l-7.22 5.263A22.407 22.407 0 0 0 1.5 25c0 12.682 9.818 22.5 22.5 22.5z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.843-5.843A22.385 22.385 0 0 0 24 2.5C11.318 2.5 1.5 12.318 1.5 25c0 2.222.204 4.36.589 6.417l7.22-5.263C8.614 24.5 8 21.8 8 18.9c0-2.016.388-3.924 1.081-5.701l-7.22-5.263A22.407 22.407 0 0 0 1.5 25c0 12.682 9.818 22.5 22.5 22.5S46.5 37.682 46.5 25c0-2.222-.204-4.36-.589-6.417z"></path>
                </svg>
                Sign in with Google
              </button>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-fit px-2 text-xs text-center text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Demo only: requires a backend server.
              </div>
            </div>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">Or continue with</span>
                <div className="flex-grow border-t border-gray-600"></div>
            </div>

            <form className="space-y-6" onSubmit={handleAuthSubmit}>
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
