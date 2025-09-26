'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { Chat } from '@/types';

interface ChatListProps {
  onChatSelect: (chat: Chat) => void;
  selectedChatId?: string;
}

export default function ChatList({ onChatSelect, selectedChatId }: ChatListProps) {
  const { user } = useAuth();
  const { chats, archivedChats, availableAgents, availableCustomers, isLoading, startChatWithAgent, startChatWithCustomer, refreshArchivedChats, archiveChat, unarchiveChat } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState<'active' | 'archived'>('active');

  // Update timestamps every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1 * 60 * 1000); // 5 minutes in milliseconds

    return () => clearInterval(interval);
  }, []);

  // Load archived chats when switching to archived view
  useEffect(() => {
    if (viewMode === 'archived') {
      refreshArchivedChats();
    }
  }, [viewMode, refreshArchivedChats]);

  const getFilteredChats = () => {
    // Choose the appropriate chat list based on view mode
    const chatList = viewMode === 'archived' ? archivedChats : chats;
    
    // Ensure chatList is always an array
    if (!chatList || !Array.isArray(chatList)) {
      return [];
    }
    
    let filteredChats = chatList;
    
    if (searchTerm) {
      filteredChats = chatList.filter(chat => {
        const customerName = chat.customer?.name?.toLowerCase() || '';
        const agentName = chat.agent?.name?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();
        
        return customerName.includes(searchLower) || agentName.includes(searchLower);
      });
    }
    
    return filteredChats.sort((a, b) => {
      // Use updatedAt as primary sort (most recent activity first)
      // This ensures new chats and chats with recent messages appear at the top
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a.createdAt).getTime();
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b.createdAt).getTime();
      return bTime - aTime;
    });
  };

  const formatTime = (date?: Date | string) => {
    if (!date) return '';
    
    // Convert string to Date if necessary
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) return '';
    
    // Use currentTime state to ensure timestamps update when component re-renders
    const diff = currentTime.getTime() - dateObj.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 5) return 'now';
    if (hours < 1) return `~${minutes}m`;
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return dateObj.toLocaleDateString();
  };

  const getAvatar = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3390ec&color=fff&size=40&rounded=true`;
  };

  const getChatTitle = (chat: Chat) => {
    const customer = chat.customer;
    const agent = chat.agent;
    
    if (user?.role === 'super-agent') {
      return `${agent?.name || 'Unknown Agent'} • ${customer?.name || 'Unknown Customer'}`;
    }
    
    return customer?.name || 'Unknown Customer';
  };

  const handleStartChatWithAgent = async (agentId: string, agentName: string) => {
    try {
      const newChat = await startChatWithAgent(agentId);
      if (newChat) {
        onChatSelect(newChat);
      }
    } catch (error) {
      console.error('Failed to start chat with agent:', error);
    }
  };

  const handleStartChatWithCustomer = async (customerId: string, customerName: string) => {
    try {
      const newChat = await startChatWithCustomer(customerId);
      if (newChat) {
        onChatSelect(newChat);
      }
    } catch (error) {
      console.error('Failed to start chat with customer:', error);
    }
  };

  const handleArchiveChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent chat selection
    try {
      await archiveChat(chatId);
    } catch (error) {
      console.error('Failed to archive chat:', error);
    }
  };

  const handleUnarchiveChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent chat selection
    try {
      await unarchiveChat(chatId);
    } catch (error) {
      console.error('Failed to unarchive chat:', error);
    }
  };

  const getOnlineStatus = (chat: Chat) => {
    // For super-agents, show if either customer or agent is online
    if (user?.role === 'super-agent') {
      return {
        customer: chat.customer?.isOnline || false,
        agent: chat.agent?.isOnline || false,
        anyOnline: (chat.customer?.isOnline || false) || (chat.agent?.isOnline || false)
      };
    }
    
    // For agents, show customer online status
    if (user?.role === 'agent') {
      return {
        customer: chat.customer?.isOnline || false,
        agent: false,
        anyOnline: chat.customer?.isOnline || false
      };
    }
    
    // For customers, show agent online status
    return {
      customer: false,
      agent: chat.agent?.isOnline || false,
      anyOnline: chat.agent?.isOnline || false
    };
  };

  return (
    <div className="h-full flex flex-col bg-sidebar">
      <div className="px-6 py-3 border-b border-sidebar-border">
        {/* View Mode Toggle */}
        <div className="mb-4">
          <div className="flex bg-sidebar-accent rounded-lg p-1">
            <button
              onClick={() => setViewMode('active')}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'active'
                  ? 'bg-sidebar text-sidebar-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-sidebar-foreground'
              }`}
            >
              Active Chats
            </button>
            <button
              onClick={() => setViewMode('archived')}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'archived'
                  ? 'bg-sidebar text-sidebar-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-sidebar-foreground'
              }`}
            >
              Archived
            </button>
          </div>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-input text-foreground placeholder:text-muted-foreground rounded-full px-4 py-1.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 border border-border"
          />
          <svg className="absolute left-3 top-2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-muted-foreground">Loading chats...</div>
          </div>
        ) : (
          <>
            {/* Existing Chats */}
            {getFilteredChats().length > 0 && (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-sidebar-border/30">
                  {viewMode === 'archived' ? 'Archived Chats' : 'Active Chats'}
                </div>
                {getFilteredChats().map((chat) => {
                  const isSelected = selectedChatId === chat.id;
                  const onlineStatus = getOnlineStatus(chat);
                  
                  return (
                    <div
                      key={chat.id}
                      onClick={() => onChatSelect(chat)}
                      className={`group flex items-center p-5 hover:bg-sidebar-accent cursor-pointer transition-colors border-b border-sidebar-border/50 active:bg-sidebar-accent touch-manipulation select-none ${
                        isSelected ? 'bg-sidebar-primary hover:bg-sidebar-primary' : ''
                      }`}
                    >
                      <div className="relative flex-shrink-0 mr-4">
                        <img
                          src={getAvatar(getChatTitle(chat))}
                          alt=""
                          className="w-12 h-12 rounded-full"
                        />
                        {onlineStatus.anyOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-sidebar"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center min-w-0">
                            <h3 className={`font-medium text-sm truncate ${
                              isSelected ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground'
                            }`}>
                              {getChatTitle(chat)}
                            </h3>
                            {onlineStatus.anyOnline && (
                              <div className="ml-2 flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className={`ml-1 text-xs ${
                                  isSelected ? 'text-sidebar-primary-foreground/70' : 'text-green-500'
                                }`}>
                                  {user?.role === 'super-agent' 
                                    ? (onlineStatus.customer && onlineStatus.agent 
                                        ? 'Both online' 
                                        : onlineStatus.customer 
                                          ? 'Customer online' 
                                          : 'Agent online')
                                    : 'Online'
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                          <span className={`text-xs ${
                            isSelected ? 'text-sidebar-primary-foreground/80' : 'text-muted-foreground'
                          }`}>
                            {formatTime(chat.lastMessage?.timestamp)}
                          </span>
                        </div>
                        
                        <p className={`text-sm truncate mt-1 ${
                          isSelected ? 'text-sidebar-primary-foreground/80' : 'text-muted-foreground'
                        }`}>
                          {chat.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>

                      <div className="flex items-center ml-2">
                        {/* Archive/Unarchive Button */}
                        {viewMode === 'active' ? (
                          <button
                            onClick={(e) => handleArchiveChat(chat.id, e)}
                            className="p-1 hover:bg-sidebar-accent rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            title="Archive chat"
                          >
                            <svg className="w-4 h-4 text-muted-foreground hover:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 4 4-4" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M5 14h14l-1 6H6l-1-6z" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={(e) => handleUnarchiveChat(chat.id, e)}
                            className="p-1 hover:bg-sidebar-accent rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            title="Unarchive chat"
                          >
                            <svg className="w-4 h-4 text-muted-foreground hover:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-4-4-4 4" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M5 14h14l-1 6H6l-1-6z" />
                            </svg>
                          </button>
                        )}

                        {/* Active Status Indicator */}
                        {chat.isActive && viewMode === 'active' && (
                          <div className="ml-2 w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Available Agents (Only for customers and active view) */}
            {viewMode === 'active' && user?.role === 'customer' && availableAgents.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-sidebar-border/30">
                  Available Agents
                </div>
                {availableAgents.map((agent) => (
                  <div
                    key={`agent-${agent.id}`}
                    onClick={() => handleStartChatWithAgent(agent.id, agent.name)}
                    className="flex items-center p-5 hover:bg-sidebar-accent cursor-pointer transition-colors border-b border-sidebar-border/50 active:bg-sidebar-accent touch-manipulation select-none"
                  >
                    <div className="relative flex-shrink-0 mr-4">
                      <img
                        src={getAvatar(agent.name)}
                        alt=""
                        className="w-12 h-12 rounded-full"
                      />
                      {agent.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-sidebar"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                          <h3 className="font-medium text-sm truncate text-sidebar-foreground">
                            {agent.name}
                          </h3>
                          <div className="ml-2 flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="ml-1 text-xs text-green-500">Available</span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground capitalize">
                          {agent.role.replace('-', ' ')}
                        </span>
                      </div>
                      
                      <p className="text-sm truncate mt-1 text-muted-foreground">
                        Click to start a conversation
                      </p>
                    </div>

                    <div className="ml-2 flex items-center">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Available Customers (Only for agents and active view) */}
            {viewMode === 'active' && (user?.role === 'agent' || user?.role === 'super-agent') && availableCustomers.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-sidebar-border/30">
                  Available Customers
                </div>
                {availableCustomers.map((customer) => (
                  <div
                    key={`customer-${customer.id}`}
                    onClick={() => handleStartChatWithCustomer(customer.id, customer.name)}
                    className="flex items-center p-5 hover:bg-sidebar-accent cursor-pointer transition-colors border-b border-sidebar-border/50 active:bg-sidebar-accent touch-manipulation select-none"
                  >
                    <div className="relative flex-shrink-0 mr-4">
                      <img
                        src={getAvatar(customer.name)}
                        alt=""
                        className="w-12 h-12 rounded-full"
                      />
                      {customer.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-sidebar"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                          <h3 className="font-medium text-sm truncate text-sidebar-foreground">
                            {customer.name}
                          </h3>
                          <div className="ml-2 flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="ml-1 text-xs text-blue-500">Needs Help</span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground capitalize">
                          Customer
                        </span>
                      </div>
                      
                      <p className="text-sm truncate mt-1 text-muted-foreground">
                        Click to start helping this customer
                      </p>
                    </div>

                    <div className="ml-2 flex items-center">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Empty State */}
            {getFilteredChats().length === 0 && 
             (viewMode === 'archived' || 
              (user?.role !== 'customer' || availableAgents.length === 0) && 
              ((user?.role !== 'agent' && user?.role !== 'super-agent') || availableCustomers.length === 0)) && (
              <div className="flex justify-center items-center h-32">
                <div className="text-muted-foreground">
                  {viewMode === 'archived' 
                    ? 'No archived chats' 
                    : user?.role === 'customer' 
                      ? 'No agents available' 
                      : 'No chats found'
                  }
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}