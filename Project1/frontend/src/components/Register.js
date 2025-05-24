import React, { useState } from 'react';
import { register } from './api';
import '../App.css';

export default function Register({ onRegisterSuccess }) {
  const [username, setUser] = useState('');
  const [password, setPass] = useState('');

  const handleRegister = async () => {
    const res = await register({ username, password });
    alert(res);
    onRegisterSuccess();
  };

  return (
    <div className="auth-container">
      <input onChange={(e) => setUser(e.target.value)} placeholder="Username" />
      <input type="password" onChange={(e) => setPass(e.target.value)} placeholder="Password" />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}
