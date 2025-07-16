export interface User {
  id: string;
  username: string;
  email: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface FileTransfer {
  _id: string;
  sender: User;
  recipient: User;
  fileName: string;
  fileSize: number;
  fileType: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  transferDate: string;
  progress: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}