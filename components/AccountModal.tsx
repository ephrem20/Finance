import React, { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUserCredentials } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
        setNewUsername(user?.username || '');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
    }
  }, [isOpen, user]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Current password is required to make changes.');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (user) {
        try {
            updateUserCredentials(user.username, currentPassword, newUsername, newPassword);
            setSuccess('Your details have been updated successfully!');
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        }
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white">Account Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input 
              type="text" 
              value={newUsername} 
              onChange={e => setNewUsername(e.target.value)} 
              placeholder="New username" 
              required 
              className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary" 
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Current Password (Required)</label>
            <input 
              type="password" 
              value={currentPassword} 
              onChange={e => setCurrentPassword(e.target.value)} 
              placeholder="Enter your current password" 
              required 
              className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">New Password (Optional)</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              placeholder="Leave blank to keep current password" 
              className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              placeholder="Confirm new password"
              className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary" 
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center">{success}</p>}

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors">Update</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountModal;
