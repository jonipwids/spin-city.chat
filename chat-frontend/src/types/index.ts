export type UserRole = 'agent' | 'super-agent' | 'customer';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isOnline: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  sender?: User;
}

export interface Chat {
  id: string;
  customerId: string;
  agentId?: string;
  messages: Message[];
  lastMessage?: Message;
  isActive: boolean;
  customer?: User;
  agent?: User;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerFinancial {
  deposits: Transaction[];
  withdrawals: Transaction[];
  games: GameTransaction[];
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  method: string;
}

export interface GameTransaction {
  id: string;
  gameId: string;
  gameName: string;
  betAmount: number;
  winAmount: number;
  timestamp: Date;
}