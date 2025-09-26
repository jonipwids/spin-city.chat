'use client';

import { useState, useRef, useEffect } from 'react';
import { Chat } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useSettings } from '@/contexts/SettingsContext';

interface ChatTabProps {
  chat: Chat;
}

export default function ChatTab({ chat }: ChatTabProps) {
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const { messages, sendMessage, isLoading } = useChat();
  const { profilePicture, userName, fontSize } = useSettings();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);

  const scrollToBottom = (instant: boolean = false) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: instant ? 'auto' : 'smooth'
    });
  };

  useEffect(() => {
    // Use instant scroll for initial load to show bottom immediately
    scrollToBottom(isInitialLoadRef.current);
    isInitialLoadRef.current = false;
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getMessageSender = (senderId: string) => {
    if (senderId === user?.id) return user;
    if (senderId === chat.customerId) return chat.customer;
    if (senderId === chat.agentId) return chat.agent;
    // Find from messages if available
    const messageWithSender = messages?.find(m => m.senderId === senderId && m.sender);
    return messageWithSender?.sender;
  };

  const isAgentMessage = (senderId: string) => {
    return senderId === user?.id || (senderId === chat.agentId);
  };

  const isSuperAgentMessage = (senderId: string) => {
    const sender = getMessageSender(senderId);
    return sender?.role === 'super-agent';
  };

  const getAvatar = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3390ec&color=fff&size=32&rounded=true`;
  };

  const getFallbackAvatar = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=666666&color=fff&size=32&rounded=true`;
  };

  const getMessagePosition = (senderId: string) => {
    if (senderId === user?.id) return 'justify-end'; // Current user (agent)
    if (senderId === chat.customerId) return 'justify-start'; // Customer
    if (isSuperAgentMessage(senderId)) return 'justify-end'; // Super agent
    return 'justify-end'; // Regular agent
  };

  const getMessageAlignment = (senderId: string) => {
    if (senderId === user?.id) return 'text-right'; // Current user (agent)
    if (senderId === chat.customerId) return 'text-left'; // Customer
    if (isSuperAgentMessage(senderId)) return 'text-right'; // Super agent
    return 'text-right'; // Regular agent
  };

  const getMessageStyle = (senderId: string) => {
    if (senderId === user?.id) return 'bg-accent text-foreground border border-border'; // Current user (agent)
    if (senderId === chat.customerId) return 'bg-muted text-foreground border border-border'; // Customer
    if (isSuperAgentMessage(senderId)) return 'bg-sidebar-primary text-sidebar-primary-foreground border border-sidebar-primary'; // Super agent
    return 'bg-accent text-foreground border border-border'; // Regular agent
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Messages Container - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sidebar-primary mx-auto mb-2"></div>
              <p className="text-sm">Loading messages...</p>
            </div>
          </div>
        ) : messages.length > 0 ? (
          messages.map((message) => {
            const sender = getMessageSender(message.senderId);
            const isAgent = isAgentMessage(message.senderId);
            const isOwnMessage = message.senderId === user?.id;
            const isSuperAgent = isSuperAgentMessage(message.senderId);
            const messagePosition = getMessagePosition(message.senderId);
            const messageAlignment = getMessageAlignment(message.senderId);
            const messageStyle = getMessageStyle(message.senderId);
            
            return (
              <div key={message.id} className={`flex ${messagePosition}`}>
                <div className={`flex max-w-[70%] ${isSuperAgent ? 'flex-row-reverse' : isAgent ? 'flex-row-reverse' : 'flex-row'}`}>
                  <img
                    src={isOwnMessage ? (profilePicture || getAvatar(sender?.name || 'Unknown')) : getAvatar(sender?.name || 'Unknown')}
                    alt=""
                    className="w-8 h-8 rounded-full flex-shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getFallbackAvatar(sender?.name || 'Unknown');
                    }}
                  />
                  <div className={`mx-2 ${messageAlignment}`}>
                    <div
                      className={`inline-block px-4 py-2 rounded-2xl font-sans ${messageStyle}`}
                    >
                      <p className="text-sm" style={{ fontSize: `${fontSize}px` }}>{message.content}</p>
                    </div>
                    <div className={`flex items-center mt-1 text-xs text-muted-foreground font-sans ${
                      messageAlignment === 'text-right' ? 'justify-end' : 'justify-start'
                    }`}>
                      {isSuperAgent && (
                        <span className="mr-2">{sender?.name}</span>
                      )}
                      {!isSuperAgent && <span className="mr-2">{isOwnMessage && userName ? userName : sender?.name}</span>}
                      <span>{formatTime(message.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <p className="text-lg mb-2">No messages yet</p>
              <p className="text-sm">Start the conversation by sending a message below</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Container - Fixed at Bottom */}
      <div className="flex-shrink-0 p-4 border-t border-sidebar-border">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-sidebar text-sidebar-foreground placeholder:text-muted-foreground rounded-2xl px-5 py-4 resize-none focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:ring-opacity-50 max-h-32"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-sidebar-primary hover:bg-sidebar-primary/90 disabled:bg-muted disabled:cursor-not-allowed text-sidebar-primary-foreground p-2.5 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}