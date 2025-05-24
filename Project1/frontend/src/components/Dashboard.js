import React, { useEffect, useState } from 'react';
import { socket } from './socket';
import '../App.css';
export default function Dashboard({ username }) {
  const [file, setFile] = useState();
  const [toUser, setToUser] = useState('');
  const [status, setStatus] = useState('Idle');

  useEffect(() => {
    socket.emit('join', username);
    socket.on('receive-file', ({ filename, file, from }) => {
      const link = document.createElement('a');
      link.href = file;
      link.download = filename;
      link.click();
      alert(`File received from ${from}`);
    });
  }, [username]);

  const sendFile = () => {
    const reader = new FileReader();
    reader.onload = () => {
      setStatus('Sending...');
      socket.emit('send-file', {
        to: toUser,
        file: reader.result,
        filename: file.name,
        from: username
      });
      setStatus('Sent!');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div   className="dashboard-container">
      <input onChange={(e) => setToUser(e.target.value)} placeholder="Send to (username)" />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={sendFile}>Send</button>
      <p>{status}</p>
    </div>
  );
}