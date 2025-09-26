'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Chat, Message, User } from '@/types';
import { apiClient } from '@/lib/backend-api';
import { wsService } from '@/lib/websocket';
import { useAuth } from './AuthContext';

interface ChatContextType {
  chats: Chat[];
  archivedChats: Chat[];
  availableAgents: User[];
  availableCustomers: User[];
  selectedChat: Chat | null;
  messages: Message[];
  isLoading: boolean;
  setSelectedChat: (chat: Chat | null) => void;
  sendMessage: (content: string, type?: string) => Promise<void>;
  refreshChats: () => Promise<void>;
  refreshArchivedChats: () => Promise<void>;
  createChat: (customerId: string) => Promise<Chat | null>;
  startChatWithAgent: (agentId: string) => Promise<Chat | null>;
  startChatWithCustomer: (customerId: string) => Promise<Chat | null>;
  archiveChat: (chatId: string) => Promise<void>;
  unarchiveChat: (chatId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [archivedChats, setArchivedChats] = useState<Chat[]>([]);
  const [availableAgents, setAvailableAgents] = useState<User[]>([]);
  const [availableCustomers, setAvailableCustomers] = useState<User[]>([]);
  const [selectedChat, setSelectedChatState] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshChats = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get chats
      const chatsResponse = await apiClient.getChats();
      if (chatsResponse.success && chatsResponse.data) {
        setChats(Array.isArray(chatsResponse.data) ? chatsResponse.data : []);
      } else {
        setChats([]);
      }

      // For customers, get available agents
      if (user.role === 'customer') {
        const agentsResponse = await apiClient.getAvailableAgents();
        if (agentsResponse.success && agentsResponse.data) {
          setAvailableAgents(Array.isArray(agentsResponse.data) ? agentsResponse.data : []);
        } else {
          setAvailableAgents([]);
        }
        setAvailableCustomers([]);
      } 
      // For agents, get available customers
      else if (user.role === 'agent' || user.role === 'super-agent') {
        const customersResponse = await apiClient.getAvailableCustomers();
        if (customersResponse.success && customersResponse.data) {
          setAvailableCustomers(Array.isArray(customersResponse.data) ? customersResponse.data : []);
        } else {
          setAvailableCustomers([]);
        }
        setAvailableAgents([]);
      } else {
        setAvailableAgents([]);
        setAvailableCustomers([]);
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
      setChats([]); // Ensure we always have an array
      setAvailableAgents([]);
      setAvailableCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load chats when user is available
  useEffect(() => {
    if (user) {
      refreshChats();
    }
  }, [user, refreshChats]);

  // Load messages when selected chat changes
  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  // Set up WebSocket listeners
  useEffect(() => {
    const handleNewMessage = (data: unknown) => {
      const messageData = data as { data: Message };
      if (messageData.data) {
        // Always update the chat's last message for proper sorting, regardless of which chat is selected
        updateChatLastMessage(messageData.data.chatId, messageData.data);
        
        // Only add to messages list if this message is for the currently selected chat
        if (selectedChat && messageData.data.chatId === selectedChat.id) {
          // Prevent duplicate messages by checking if message already exists
          setMessages(prev => {
            const messageExists = prev.some(msg => msg.id === messageData.data.id);
            if (messageExists) {
              console.log('Duplicate message prevented:', messageData.data.id);
              return prev;
            }
            return [...prev, messageData.data];
          });
        }
      }
    };

    const handleUserStatusUpdate = (data: unknown) => {
      const statusData = data as { data: { userId: string; isOnline: boolean; username: string } };
      if (statusData.data) {
        // Update the user status in chats
        setChats(prevChats => prevChats.map(chat => {
          if (chat.customer?.id === statusData.data.userId) {
            return {
              ...chat,
              customer: { ...chat.customer, isOnline: statusData.data.isOnline }
            };
          }
          if (chat.agent?.id === statusData.data.userId) {
            return {
              ...chat,
              agent: { ...chat.agent, isOnline: statusData.data.isOnline }
            };
          }
          return chat;
        }));
      }
    };

    const handleNewChat = (data: unknown) => {
      const chatData = data as { data: Chat };
      if (chatData.data) {
        // Add the new chat to the beginning of the chats list
        setChats(prev => {
          // Check if chat already exists to prevent duplicates
          const chatExists = prev.some(chat => chat.id === chatData.data.id);
          if (chatExists) {
            return prev;
          }
          return [chatData.data, ...prev];
        });

        // Update available agents/customers lists
        if (user?.role === 'customer' && chatData.data.agent) {
          setAvailableAgents(prev => prev.filter(agent => agent.id !== chatData.data.agent?.id));
        } else if ((user?.role === 'agent' || user?.role === 'super-agent') && chatData.data.customer) {
          setAvailableCustomers(prev => prev.filter(customer => customer.id !== chatData.data.customer?.id));
        }
      }
    };

    wsService.on('new_message', handleNewMessage);
    wsService.on('new_chat', handleNewChat);
    wsService.on('user_connected', handleUserStatusUpdate);
    wsService.on('user_disconnected', handleUserStatusUpdate);

    return () => {
      wsService.off('new_message', handleNewMessage);
      wsService.off('new_chat', handleNewChat);
      wsService.off('user_connected', handleUserStatusUpdate);
      wsService.off('user_disconnected', handleUserStatusUpdate);
    };
  }, [selectedChat, user?.role]);

  const loadMessages = async (chatId: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.getMessages(chatId);
      if (response.success) {
        setMessages(response.data || []);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const setSelectedChat = (chat: Chat | null) => {
    setSelectedChatState(chat);
  };

  const sendMessage = async (content: string, type: string = 'text') => {
    if (!selectedChat || !user) return;

    try {
      const response = await apiClient.sendMessage(selectedChat.id, content, type);
      if (response.success) {
        // Message will be added via WebSocket automatically
        // No need for optimistic updates to avoid duplicates
        console.log('Message sent successfully:', response.data.id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  const createChat = async (customerId: string): Promise<Chat | null> => {
    try {
      const response = await apiClient.createChat(customerId);
      if (response.success) {
        const newChat = response.data;
        
        // Don't add to chats here - let the WebSocket event handle it
        // This prevents duplicate chats when both API response and WebSocket event fire
        
        return newChat;
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
    return null;
  };

  const startChatWithAgent = async (agentId: string): Promise<Chat | null> => {
    if (!user || user.role !== 'customer') return null;
    
    try {
      // Create a new chat with the selected agent
      const response = await apiClient.createChat(user.id, agentId);
      if (response.success) {
        const newChat = response.data;
        
        // Don't add to chats here - let the WebSocket event handle it
        // This prevents duplicate chats when both API response and WebSocket event fire
        
        // Remove the agent from available agents since they're now engaged
        setAvailableAgents(prev => prev.filter(agent => agent.id !== agentId));
        
        return newChat;
      }
    } catch (error) {
      console.error('Failed to start chat with agent:', error);
    }
    return null;
  };

  const startChatWithCustomer = async (customerId: string): Promise<Chat | null> => {
    if (!user || (user.role !== 'agent' && user.role !== 'super-agent')) return null;
    
    try {
      // Create a new chat with the selected customer (agent creates chat with customer)
      const response = await apiClient.createChat(customerId, user.id);
      if (response.success) {
        const newChat = response.data;
        
        // Don't add to chats here - let the WebSocket event handle it
        // This prevents duplicate chats when both API response and WebSocket event fire
        
        // Remove the customer from available customers since they're now engaged
        setAvailableCustomers(prev => prev.filter(customer => customer.id !== customerId));
        
        return newChat;
      }
    } catch (error) {
      console.error('Failed to start chat with customer:', error);
    }
    return null;
  };

  const refreshArchivedChats = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.getArchivedChats();
      if (response.success && response.data) {
        setArchivedChats(Array.isArray(response.data) ? response.data : []);
      } else {
        setArchivedChats([]);
      }
    } catch (error) {
      console.error('Failed to load archived chats:', error);
      setArchivedChats([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const archiveChat = async (chatId: string) => {
    try {
      const response = await apiClient.archiveChat(chatId);
      if (response.success) {
        // Move chat from active to archived
        const chatToArchive = chats.find(chat => chat.id === chatId);
        if (chatToArchive) {
          setChats(prev => prev.filter(chat => chat.id !== chatId));
          setArchivedChats(prev => [...prev, { ...chatToArchive, status: 'archived' }]);
        }
        
        // Clear selection if the archived chat was selected
        if (selectedChat?.id === chatId) {
          setSelectedChat(null);
        }
      }
    } catch (error) {
      console.error('Failed to archive chat:', error);
      throw error;
    }
  };

  const unarchiveChat = async (chatId: string) => {
    try {
      const response = await apiClient.unarchiveChat(chatId);
      if (response.success) {
        // Move chat from archived to active
        const chatToUnarchive = archivedChats.find(chat => chat.id === chatId);
        if (chatToUnarchive) {
          setArchivedChats(prev => prev.filter(chat => chat.id !== chatId));
          setChats(prev => [{ ...chatToUnarchive, status: 'active' }, ...prev]);
        }
      }
    } catch (error) {
      console.error('Failed to unarchive chat:', error);
      throw error;
    }
  };

  const updateChatLastMessage = (chatId: string, message: Message) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { 
            ...chat, 
            lastMessage: message, 
            updatedAt: typeof message.timestamp === 'string' ? new Date(message.timestamp) : message.timestamp
          }
        : chat
    ));
  };

  const value: ChatContextType = {
    chats,
    archivedChats,
    availableAgents,
    availableCustomers,
    selectedChat,
    messages,
    isLoading,
    setSelectedChat,
    sendMessage,
    refreshChats,
    refreshArchivedChats,
    createChat,
    startChatWithAgent,
    startChatWithCustomer,
    archiveChat,
    unarchiveChat,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};