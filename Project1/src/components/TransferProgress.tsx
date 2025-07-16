import React from 'react';
import { FileTransfer } from '../types';
import { CheckCircle, XCircle, Clock, Download, Send, AlertCircle, FileText, Image, Video, Music, File } from 'lucide-react';

interface TransferProgressProps {
  transfers: FileTransfer[];
  onAcceptTransfer: (transferId: string) => void;
  onRejectTransfer: (transferId: string) => void;
  onDownloadFile: (transfer: FileTransfer) => void;
  currentUserId: string;
}

const TransferProgress: React.FC<TransferProgressProps> = ({
  transfers,
  onAcceptTransfer,
  onRejectTransfer,
  onDownloadFile,
  currentUserId
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-400';
      case 'rejected':
        return 'text-red-400';
      case 'accepted':
        return 'text-blue-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'accepted':
        return <Send className="w-5 h-5 text-blue-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-6 h-6 text-blue-400" />;
    if (fileType.startsWith('video/')) return <Video className="w-6 h-6 text-purple-400" />;
    if (fileType.startsWith('audio/')) return <Music className="w-6 h-6 text-green-400" />;
    if (fileType.includes('text') || fileType.includes('document')) return <FileText className="w-6 h-6 text-yellow-400" />;
    return <File className="w-6 h-6 text-gray-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTransferDirection = (transfer: FileTransfer) => {
    return transfer.sender.id === currentUserId ? 'sent' : 'received';
  };

  if (transfers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 glass-3d rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
          <Send className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-400 text-lg font-medium">No file transfers yet</p>
        <p className="text-gray-500 text-sm mt-2">Your file transfers will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {transfers.map((transfer) => {
        const direction = getTransferDirection(transfer);
        const isPending = transfer.status === 'pending' && direction === 'received';
        
        return (
          <div
            key={transfer._id}
            className="glass-3d card-3d rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <div className="mr-3 glass-3d p-2 rounded-lg">
                    {getFileIcon(transfer.fileType)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg">{transfer.fileName}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(transfer.status)}
                      <span className={`text-sm font-medium ${getStatusColor(transfer.status)}`}>
                        {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-400">
                        • {direction === 'sent' ? 'Sent' : 'Received'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mb-4">
                  <div className="glass-3d p-3 rounded-lg">
                    <span className="text-gray-400 block text-xs">From</span>
                    <span className="text-white font-medium">{transfer.sender.username}</span>
                  </div>
                  <div className="glass-3d p-3 rounded-lg">
                    <span className="text-gray-400 block text-xs">To</span>
                    <span className="text-white font-medium">{transfer.recipient.username}</span>
                  </div>
                  <div className="glass-3d p-3 rounded-lg">
                    <span className="text-gray-400 block text-xs">Size</span>
                    <span className="text-blue-400 font-medium">{formatFileSize(transfer.fileSize)}</span>
                  </div>
                  <div className="glass-3d p-3 rounded-lg">
                    <span className="text-gray-400 block text-xs">Type</span>
                    <span className="text-purple-400 font-medium">{transfer.fileType.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-300 font-medium">Progress</span>
                    <span className="text-white font-semibold">{transfer.progress}%</span>
                  </div>
                  
                  <div className="progress-3d h-3 rounded-full overflow-hidden">
                    <div
                      className={`progress-fill-3d h-full transition-all duration-500 ${
                        transfer.status === 'completed' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                        transfer.status === 'rejected' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                        'bg-gradient-to-r from-cyan-400 to-blue-600'
                      }`}
                      style={{ width: `${transfer.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="ml-4 flex flex-col gap-2">
                {isPending && (
                  <>
                    <button
                      onClick={() => onAcceptTransfer(transfer._id)}
                      className="button-3d px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-medium hover:from-emerald-400 hover:to-emerald-500 transition-all duration-200 shadow-lg flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Accept
                    </button>
                    <button
                      onClick={() => onRejectTransfer(transfer._id)}
                      className="button-3d px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-medium hover:from-red-400 hover:to-red-500 transition-all duration-200 shadow-lg flex items-center"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </button>
                  </>
                )}
                
                {transfer.status === 'completed' && (
                  <button
                    onClick={() => onDownloadFile(transfer)}
                    className="button-3d px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-blue-400 hover:to-purple-500 transition-all duration-200 shadow-lg flex items-center"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                )}

                {transfer.status === 'pending' && direction === 'sent' && (
                  <div className="glass-3d px-3 py-2 rounded-lg text-center">
                    <AlertCircle className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                    <span className="text-xs text-yellow-400">Waiting</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransferProgress;