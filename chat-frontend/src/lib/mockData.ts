import { User, Chat, Message, CustomerFinancial, Transaction, GameTransaction } from '@/types';

export const mockCustomers: User[] = [
  { id: 'c1', name: 'Alice Johnson', role: 'customer', avatar: '/avatars/customer1.jpg', isOnline: true },
  { id: 'c2', name: 'Bob Smith', role: 'customer', avatar: '/avatars/customer2.jpg', isOnline: false },
  { id: 'c3', name: 'Charlie Brown', role: 'customer', avatar: '/avatars/customer3.jpg', isOnline: true },
  { id: 'c4', name: 'Diana Wilson', role: 'customer', avatar: '/avatars/customer4.jpg', isOnline: true },
  { id: 'c5', name: 'Eva Martinez', role: 'customer', avatar: '/avatars/customer5.jpg', isOnline: false },
];

export const mockAgents: User[] = [
  { id: '1', name: 'Agent John', role: 'agent', avatar: '/avatars/agent1.jpg', isOnline: true },
  { id: '2', name: 'Super Agent Sarah', role: 'super-agent', avatar: '/avatars/agent2.jpg', isOnline: true },
  { id: '3', name: 'Agent Mike', role: 'agent', avatar: '/avatars/agent3.jpg', isOnline: false },
];

export const mockMessages: Message[] = [
  { id: 'm1', chatId: 'chat1', senderId: 'c1', content: 'Hi, I need help with my withdrawal', timestamp: new Date('2024-01-15T10:30:00'), type: 'text' },
  { id: 'm2', chatId: 'chat1', senderId: '1', content: 'Hello Alice! I\'ll be happy to help you. Can you provide more details?', timestamp: new Date('2024-01-15T10:31:00'), type: 'text' },
  { id: 'm3', chatId: 'chat1', senderId: 'c1', content: 'My withdrawal has been pending for 2 days now', timestamp: new Date('2024-01-15T10:32:00'), type: 'text' },
  { id: 'm4', chatId: 'chat1', senderId: '1', content: 'Let me check your account status. One moment please.', timestamp: new Date('2024-01-15T10:33:00'), type: 'text' },
  { id: 'm4a', chatId: 'chat1', senderId: '2', content: 'Hi team, I\'m joining this conversation to assist with the withdrawal issue. Alice, I can see your withdrawal request from January 13th.', timestamp: new Date('2024-01-15T10:34:00'), type: 'text' },
  { id: 'm4b', chatId: 'chat1', senderId: 'c1', content: 'Oh, thank you! I was getting worried about the delay.', timestamp: new Date('2024-01-15T10:35:00'), type: 'text' },
  { id: 'm4c', chatId: 'chat1', senderId: '1', content: 'Great to have you here, Sarah! I was just about to escalate this.', timestamp: new Date('2024-01-15T10:36:00'), type: 'text' },
  { id: 'm4d', chatId: 'chat1', senderId: '2', content: 'Perfect timing, John. I\'ve already reviewed the case and I can see the issue. The bank transfer was flagged for additional verification due to the amount. I\'ll expedite this now.', timestamp: new Date('2024-01-15T10:37:00'), type: 'text' },
  
  { id: 'm5', chatId: 'chat2', senderId: 'c2', content: 'Can you check my game history?', timestamp: new Date('2024-01-15T11:00:00'), type: 'text' },
  { id: 'm6', chatId: 'chat2', senderId: '3', content: 'Sure! I can see your recent games. Is there something specific you\'re looking for?', timestamp: new Date('2024-01-15T11:01:00'), type: 'text' },
  { id: 'm6a', chatId: 'chat2', senderId: '2', content: 'Bob, I notice you\'ve been playing quite a bit lately. Everything okay? I\'m here if you need to talk about responsible gaming.', timestamp: new Date('2024-01-15T11:02:00'), type: 'text' },
  { id: 'm6b', chatId: 'chat2', senderId: 'c2', content: 'I appreciate the concern, Sarah. I\'m actually doing fine, just had some free time this week.', timestamp: new Date('2024-01-15T11:03:00'), type: 'text' },
  { id: 'm6c', chatId: 'chat2', senderId: '2', content: 'That\'s good to hear! Just wanted to make sure. Mike, you can continue with the game history request.', timestamp: new Date('2024-01-15T11:04:00'), type: 'text' },
  
  { id: 'm7', chatId: 'chat3', senderId: 'c3', content: 'I can\'t access my account', timestamp: new Date('2024-01-15T09:15:00'), type: 'text' },
  { id: 'm8', chatId: 'chat3', senderId: '1', content: 'I\'ll help you reset your password. Please verify your email.', timestamp: new Date('2024-01-15T09:16:00'), type: 'text' },
  { id: 'm8a', chatId: 'chat3', senderId: '2', content: 'Charlie, I see you\'ve had multiple login attempts. This might be a security measure. Let me check if there are any suspicious activities on your account.', timestamp: new Date('2024-01-15T09:17:00'), type: 'text' },
  { id: 'm8b', chatId: 'chat3', senderId: 'c3', content: 'That would be great, thank you Sarah!', timestamp: new Date('2024-01-15T09:18:00'), type: 'text' },

  // Additional messages for testing scroll
  { id: 'm9', chatId: 'chat1', senderId: 'c1', content: 'I have another question about my account balance.', timestamp: new Date('2024-01-15T09:20:00'), type: 'text' },
  { id: 'm10', chatId: 'chat1', senderId: '1', content: 'Of course! I can help with that. Your current balance is $1,250.00. Is there anything specific you\'d like to know about your transactions?', timestamp: new Date('2024-01-15T09:21:00'), type: 'text' },
  { id: 'm11', chatId: 'chat1', senderId: 'c1', content: 'Yes, I see a charge I don\'t recognize from yesterday. Can you explain what that was for?', timestamp: new Date('2024-01-15T09:22:00'), type: 'text' },
  { id: 'm12', chatId: 'chat1', senderId: '1', content: 'Let me check that transaction for you. It appears to be a monthly service fee for your premium account features. This includes enhanced security and priority support.', timestamp: new Date('2024-01-15T09:23:00'), type: 'text' },
  { id: 'm13', chatId: 'chat1', senderId: 'c1', content: 'Ah, I see. That makes sense. Thank you for clarifying!', timestamp: new Date('2024-01-15T09:24:00'), type: 'text' },
  { id: 'm14', chatId: 'chat1', senderId: '2', content: 'You\'re welcome! Is there anything else I can help you with today?', timestamp: new Date('2024-01-15T09:25:00'), type: 'text' },
  { id: 'm15', chatId: 'chat1', senderId: 'c1', content: 'Actually, yes. I was wondering about the interest rates for savings accounts.', timestamp: new Date('2024-01-15T09:26:00'), type: 'text' },
  { id: 'm16', chatId: 'chat1', senderId: '2', content: 'Great question! Our current savings account offers 3.5% APY for balances over $1,000, and 2.5% for balances under that amount. Would you like me to send you more detailed information?', timestamp: new Date('2024-01-15T09:27:00'), type: 'text' },
  { id: 'm17', chatId: 'chat1', senderId: 'c1', content: 'Yes, that would be perfect. Thank you very much for your help!', timestamp: new Date('2024-01-15T09:28:00'), type: 'text' },
];

export const mockChats: Chat[] = [
  {
    id: 'chat1',
    customerId: 'c1',
    agentId: '1',
    messages: mockMessages.filter(m => ['c1', '1', '2'].includes(m.senderId)),
    lastMessage: mockMessages.find(m => m.id === 'm17'),
    isActive: true,
    createdAt: new Date('2024-01-15T09:20:00'),
    updatedAt: new Date('2024-01-15T09:28:00')
  },
  {
    id: 'chat2',
    customerId: 'c2',
    agentId: '3',
    messages: mockMessages.filter(m => ['c2', '3', '2'].includes(m.senderId)),
    lastMessage: mockMessages.find(m => m.id === 'm6c'),
    isActive: true,
    createdAt: new Date('2024-01-15T11:00:00'),
    updatedAt: new Date('2024-01-15T11:04:00')
  },
  {
    id: 'chat3',
    customerId: 'c3',
    agentId: '1',
    messages: mockMessages.filter(m => ['c3', '1', '2'].includes(m.senderId)),
    lastMessage: mockMessages.find(m => m.id === 'm8b'),
    isActive: false,
    createdAt: new Date('2024-01-15T09:15:00'),
    updatedAt: new Date('2024-01-15T09:18:00')
  },
  {
    id: 'chat4',
    customerId: 'c4',
    agentId: '1',
    messages: [],
    isActive: false,
    createdAt: new Date('2024-01-14T15:30:00'),
    updatedAt: new Date('2024-01-14T15:30:00')
  },
  {
    id: 'chat5',
    customerId: 'c5',
    agentId: '3',
    messages: [],
    isActive: false,
    createdAt: new Date('2024-01-13T12:00:00'),
    updatedAt: new Date('2024-01-13T12:00:00')
  }
];

export const mockFinancialData: Record<string, CustomerFinancial> = {
  c1: {
    deposits: [
      { id: 'd1', amount: 500, currency: 'USD', timestamp: new Date('2024-01-10T14:00:00'), status: 'completed', method: 'Credit Card' },
      { id: 'd2', amount: 200, currency: 'USD', timestamp: new Date('2024-01-12T16:30:00'), status: 'completed', method: 'Bank Transfer' },
    ],
    withdrawals: [
      { id: 'w1', amount: 350, currency: 'USD', timestamp: new Date('2024-01-13T10:00:00'), status: 'pending', method: 'Bank Transfer' },
    ],
    games: [
      { id: 'g1', gameId: 'slot1', gameName: 'Lucky Slots', betAmount: 50, winAmount: 150, timestamp: new Date('2024-01-14T20:15:00') },
      { id: 'g2', gameId: 'poker1', gameName: 'Texas Hold\'em', betAmount: 100, winAmount: 0, timestamp: new Date('2024-01-14T21:30:00') },
    ]
  },
  c2: {
    deposits: [
      { id: 'd3', amount: 1000, currency: 'USD', timestamp: new Date('2024-01-08T12:00:00'), status: 'completed', method: 'Crypto' },
    ],
    withdrawals: [],
    games: [
      { id: 'g3', gameId: 'blackjack1', gameName: 'Blackjack', betAmount: 25, winAmount: 50, timestamp: new Date('2024-01-15T10:00:00') },
      { id: 'g4', gameId: 'roulette1', gameName: 'European Roulette', betAmount: 75, winAmount: 150, timestamp: new Date('2024-01-15T10:30:00') },
    ]
  },
  c3: {
    deposits: [
      { id: 'd4', amount: 300, currency: 'USD', timestamp: new Date('2024-01-01T10:00:00'), status: 'completed', method: 'Credit Card' },
    ],
    withdrawals: [
      { id: 'w2', amount: 250, currency: 'USD', timestamp: new Date('2024-01-05T14:00:00'), status: 'completed', method: 'Credit Card' },
    ],
    games: [
      { id: 'g5', gameId: 'slot2', gameName: 'Mega Jackpot', betAmount: 10, winAmount: 0, timestamp: new Date('2024-01-05T18:00:00') },
    ]
  }
};