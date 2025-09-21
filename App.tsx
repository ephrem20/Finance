
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import { GoalProvider } from './context/GoalContext';
import { SettingsProvider } from './context/SettingsContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
};

const Main: React.FC = () => {
  const { user } = useAuth();

  return user ? (
    <TransactionProvider>
      <GoalProvider>
        <SettingsProvider>
          <DashboardPage />
        </SettingsProvider>
      </GoalProvider>
    </TransactionProvider>
  ) : (
    <LoginPage />
  );
};

export default App;
