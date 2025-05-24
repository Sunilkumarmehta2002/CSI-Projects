import React, { useState } from 'react';
import { login } from './api';
import '../App.css';
export default function Login({ onLogin }) {
  const [username, setUser] = useState('');
  const [password, setPass] = useState('');

  const handleLogin = async () => {
    const res = await login({ username, password });
    onLogin(username, res.token);
  };

  return (
    <div  className="auth-container">
      <input onChange={(e) => setUser(e.target.value)} placeholder="Username" />
      <input type="password" onChange={(e) => setPass(e.target.value)} placeholder="Password" />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
