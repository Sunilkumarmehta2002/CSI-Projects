import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Users, FileText, Image, Video, Music } from 'lucide-react';
import { User } from '../types';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClearFile: () => void;
  users: User[];
  selectedRecipient: User | null;
  onRecipientSelect: (user: User) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  selectedFile,
  onClearFile,
  users,
  selectedRecipient,
  onRecipientSelect
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-8 h-8 text-blue-400" />;
    if (fileType.startsWith('video/')) return <Video className="w-8 h-8 text-purple-400" />;
    if (fileType.startsWith('audio/')) return <Music className="w-8 h-8 text-green-400" />;
    if (fileType.includes('text') || fileType.includes('document')) return <FileText className="w-8 h-8 text-yellow-400" />;
    return <File className="w-8 h-8 text-gray-400" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        {...getRootProps()}
        className={`upload-zone-3d border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive ? 'drag-active border-cyan-400' : 
          selectedFile ? 'border-emerald-400' : 'border-gray-400 hover:border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center w-20 h-20 glass-3d rounded-full mx-auto animate-pulse-3d">
              {getFileIcon(selectedFile.type)}
            </div>
            <div>
              <p className="font-semibold text-white text-lg">{selectedFile.name}</p>
              <p className="text-sm text-gray-300 mt-1">{formatFileSize(selectedFile.size)}</p>
              <div className="mt-2 inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium border border-emerald-400/30">
                Ready to send
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearFile();
              }}
              className="button-3d inline-flex items-center px-4 py-2 bg-red-500/20 text-red-400 rounded-full text-sm hover:bg-red-500/30 transition-all duration-200 border border-red-400/30"
            >
              <X className="w-4 h-4 mr-1" />
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center w-20 h-20 glass-3d rounded-full mx-auto animate-float">
              <Upload className="w-10 h-10 text-cyan-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">
                {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
              </p>
              <p className="text-sm text-gray-300">or click to select a file</p>
              <p className="text-xs text-gray-400 mt-3 glass-3d px-3 py-1 rounded-full inline-block">Maximum file size: 50MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Recipient Selection */}
      <div className="glass-3d card-3d rounded-2xl p-6">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
            <Users className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-white text-lg">Select Recipient</h3>
        </div>
        
        {users.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 glass-3d rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-400 text-sm">No users available</p>
            <p className="text-xs text-gray-500 mt-1">Users will appear here when they come online</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => onRecipientSelect(user)}
                className={`user-card-3d p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedRecipient?.id === user.id ? 'selected' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{user.username}</p>
                      <p className="text-sm text-gray-300">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 ${getStatusColor(user.status || 'online')} rounded-full mr-2 animate-pulse`}></div>
                    <span className="text-xs text-gray-300 font-medium capitalize">
                      {user.status || 'online'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;