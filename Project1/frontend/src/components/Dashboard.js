import React, { useEffect, useState } from 'react';
import { socket } from './socket';
import '../App.css';

export default function Dashboard({ username }) {
  const [file, setFile] = useState();
  const [toUser, setToUser] = useState('');
  const [status, setStatus] = useState('Idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    socket.emit('join', username);
    socket.on('receive-file', ({ filename, file, from }) => {
      const link = document.createElement('a');
      link.href = file;
      link.download = filename;
      link.click();
      setStatus(`File received from ${from}`);
      setProgress(100);
    });
  }, [username]);

  const sendFile = () => {
    if (!file || !toUser) {
      setStatus('Please select a file and recipient.');
      return;
    }

    const reader = new FileReader();

    reader.onloadstart = () => {
      setStatus('Reading file...');
      setProgress(10);
    };

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentRead = Math.round((event.loaded / event.total) * 100 * 0.6); // up to 60%
        setProgress(percentRead);
        setStatus(`Reading file... ${percentRead}%`);
      }
    };

    reader.onload = () => {
      setStatus('Uploading...');
      setProgress(80);

      socket.emit('send-file', {
        to: toUser,
        file: reader.result,
        filename: file.name,
        from: username,
      });

      setTimeout(() => {
        setStatus('File sent successfully!');
        setProgress(100);
      }, 500);
    };

    reader.onerror = () => {
      setStatus('Error reading file.');
      setProgress(0);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="dashboard-container">
      <h2>Welcome, {username}</h2>
      <input
        onChange={(e) => setToUser(e.target.value)}
        placeholder="Send to (username)"
        className="input-field"
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="input-field"
      />
      <button onClick={sendFile} className="send-button">Send File</button>
      <p className="status-text">{status}</p>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}
