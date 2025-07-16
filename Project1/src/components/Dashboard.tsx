import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { User, FileTransfer } from '../types';
import FileUpload from './FileUpload';
import TransferProgress from './TransferProgress';
import { Send, LogOut, RefreshCw, Bell, Upload, Activity, Shield } from 'lucide-react';
import axios from 'axios';
import CryptoJS from 'crypto-js';

interface Notification {
  id: string;
  type: 'request' | 'accepted' | 'rejected' | 'download';
  message: string;
  timestamp: number;
  isVisible: boolean;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { socket, isConnected } = useSocket();
  const [users, setUsers] = useState<User[]>([]);
  const [transfers, setTransfers] = useState<FileTransfer[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const ENCRYPTION_KEY = 'your-32-char-encryption-key-here';

  useEffect(() => {
    fetchUsers();
    fetchTransfers();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('fileTransferRequest', (data) => {
        addNotification('request', `${data.sender} wants to send you ${data.fileName}`, data);
        fetchTransfers();
      });

      socket.on('transferAccepted', (data) => {
        addNotification('accepted', `${data.recipient} accepted your file transfer`);
        fetchTransfers();
      });

      socket.on('transferRejected', (data) => {
        addNotification('rejected', `${data.recipient} rejected your file transfer`);
        fetchTransfers();
      });

      socket.on('fileData', (data) => {
        handleFileReceived(data);
      });

      socket.on('progressUpdate', (data) => {
        setTransfers(prev => prev.map(transfer => 
          transfer._id === data.transferId 
            ? { ...transfer, progress: data.progress }
            : transfer
        ));
      });

      return () => {
        socket.off('fileTransferRequest');
        socket.off('transferAccepted');
        socket.off('transferRejected');
        socket.off('fileData');
        socket.off('progressUpdate');
      };
    }
  }, [socket]);

  const addNotification = (type: Notification['type'], message: string, data?: any) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now(),
      isVisible: true
    };

    setNotifications(prev => [...prev, notification]);
    setUnreadCount(prev => prev + 1);

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, isVisible: false } : n)
      );
      
      // Remove from array after animation
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 500);
    }, 5000);
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTransfers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/transfers');
      setTransfers(response.data);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    }
  };

  const handleRefresh = () => {
    fetchUsers();
    fetchTransfers();
    setUnreadCount(0);
  };

  const handleFileReceived = (data: any) => {
    try {
      // Decrypt the file data
      const decryptedData = CryptoJS.AES.decrypt(data.encryptedData, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
      
      // Convert base64 to blob
      const byteCharacters = atob(decryptedData.split(',')[1] || decryptedData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      
      // Create download link
      const blob = new Blob([byteArray], { type: data.fileType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addNotification('download', `Downloaded ${data.fileName} successfully`);
      fetchTransfers();
    } catch (error) {
      console.error('Error processing received file:', error);
      addNotification('rejected', `Failed to download ${data.fileName}`);
    }
  };

  const handleFileTransfer = async () => {
    if (!selectedFile || !selectedRecipient) return;

    setIsTransferring(true);
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = e.target?.result as string;
        
        // Encrypt the file data
        const encryptedData = CryptoJS.AES.encrypt(fileData, ENCRYPTION_KEY).toString();
        
        // Send transfer request
        await axios.post('http://localhost:5000/api/transfer', {
          recipientId: selectedRecipient.id,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileType: selectedFile.type,
          encryptedData
        });

        // Clear selections
        setSelectedFile(null);
        setSelectedRecipient(null);
        
        // Refresh transfers
        fetchTransfers();
        
        addNotification('request', `File transfer request sent to ${selectedRecipient.username}`);
      };
      
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Error transferring file:', error);
      addNotification('rejected', 'Failed to send file transfer request');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleAcceptTransfer = (transferId: string) => {
    socket?.emit('acceptFileTransfer', transferId);
  };

  const handleRejectTransfer = (transferId: string) => {
    socket?.emit('rejectFileTransfer', transferId);
  };

  const handleDownloadFile = (transfer: FileTransfer) => {
    // For demo purposes, create a simple file
    const content = `File: ${transfer.fileName}\nFrom: ${transfer.sender.username}\nTo: ${transfer.recipient.username}\nSize: ${transfer.fileSize} bytes\nTransferred: ${new Date(transfer.transferDate).toLocaleString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = transfer.fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    addNotification('download', `Downloaded ${transfer.fileName}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="glass-3d border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center mr-3 animate-pulse-3d">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">SecureTransfer</h1>
              </div>
              <div className="ml-6 flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-sm text-gray-300">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                className="button-3d p-2 text-gray-300 hover:text-white transition-colors rounded-lg glass-3d"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <div className="relative">
                <button className="button-3d p-2 text-gray-300 hover:text-white transition-colors rounded-lg glass-3d">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse-3d">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
              
              <span className="text-sm text-gray-300">
                Welcome, <span className="text-cyan-400 font-semibold">{user?.username}</span>
              </span>
              
              <button
                onClick={logout}
                className="button-3d flex items-center px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-200 border border-red-400/30"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File Upload Section */}
          <div className="glass-3d card-3d rounded-3xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                <Upload className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Send File</h2>
            </div>
            
            <FileUpload
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
              onClearFile={() => setSelectedFile(null)}
              users={users}
              selectedRecipient={selectedRecipient}
              onRecipientSelect={setSelectedRecipient}
            />
            
            <div className="mt-6">
              <button
                onClick={handleFileTransfer}
                disabled={!selectedFile || !selectedRecipient || isTransferring}
                className="w-full button-3d flex items-center justify-center px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-2xl font-semibold hover:from-cyan-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isTransferring ? (
                  <>
                    <div className="spinner-3d mr-2"></div>
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Transfer Request
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Transfer Progress Section */}
          <div className="glass-3d card-3d rounded-3xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-white">File Transfers</h2>
            </div>
            
            <TransferProgress
              transfers={transfers}
              onAcceptTransfer={handleAcceptTransfer}
              onRejectTransfer={handleRejectTransfer}
              onDownloadFile={handleDownloadFile}
              currentUserId={user?.id || ''}
            />
          </div>
        </div>
      </main>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 space-y-3 z-50">
          {notifications.slice(-5).map((notification) => (
            <div
              key={notification.id}
              className={`notification-3d rounded-2xl shadow-2xl p-4 max-w-sm transform transition-all duration-500 ${
                notification.isVisible ? 'animate-slide-in-right' : 'animate-slide-out-right'
              }`}
            >
              <div className="flex items-start">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <Send className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 font-medium">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;