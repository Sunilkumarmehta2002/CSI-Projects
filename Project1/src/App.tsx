import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/auth"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthForm isLogin={isLogin} onToggle={() => setIsLogin(!isLogin)} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              <SocketProvider>
                <Dashboard />
              </SocketProvider>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/auth"} replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;