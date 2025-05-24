import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

function App() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState('');

  const handleLogin = (username, token) => {
    setUser(username);
    setIsLoggedIn(true);
  };

  const handleRegisterSuccess = () => {
    setIsRegistered(true);
  };

  return (
    <div>
      {!isLoggedIn ? (
        isRegistered ? (
          <Login onLogin={handleLogin} />
        ) : (
          <Register onRegisterSuccess={handleRegisterSuccess} />
        )
      ) : (
        <Dashboard username={user} />
      )}
    </div>
  );
}

export default App;
