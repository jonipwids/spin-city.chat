'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import ChatList from './ChatList';
import ChatInterface from './ChatInterface';
import Settings from './Settings';
import { Chat } from '@/types';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { selectedChat, setSelectedChat } = useChat();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<'chat' | 'settings'>('chat');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    setCurrentView('chat'); // Switch to chat view when a chat is selected
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    const handleNavigateBack = (event: CustomEvent) => {
      if (event.detail.view === 'chat') {
        setCurrentView('chat');
        setSelectedChat(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('navigate-back', handleNavigateBack as EventListener);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('navigate-back', handleNavigateBack as EventListener);
    };
  }, [setSelectedChat]);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
  };

  return (
    <div className="h-screen bg-background flex min-h-0" data-dashboard>
      {/* Sidebar */}
      <div className={`w-full md:w-80 flex-shrink-0 ${(selectedChat || currentView === 'settings') ? 'hidden md:block' : 'block'}`}>
        <div className="h-full flex flex-col min-h-0">
          {/* Header */}
          <div className="bg-sidebar p-6 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-10 h-10 bg-sidebar-primary rounded-full flex items-center justify-center hover:bg-sidebar-primary/90 transition-colors"
                  >
                    <span className="text-sidebar-primary-foreground text-sm font-bold">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute top-12 left-0 w-48 bg-background border border-border rounded-lg shadow-lg z-10">
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            toggleTheme();
                          }}
                          className="w-full px-4 py-1.5 text-left text-foreground hover:bg-accent hover:text-accent-foreground flex items-center space-x-2"
                        >
                          {isDarkMode ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                              <span>Light Mode</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                              </svg>
                              <span>Dark Mode</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            setCurrentView('settings');
                            setSelectedChat(null);
                          }}
                          className="w-full px-4 py-1.5 text-left text-foreground hover:bg-accent hover:text-accent-foreground flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Settings</span>
                        </button>
                        
                        <hr className="my-2 border-border" />
                        
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            logout();
                          }}
                          className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400 flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-sidebar-foreground font-medium text-lg">{user?.name}</h2>
                  <p className="text-muted-foreground text-sm capitalize">
                    {user?.role?.replace('-', ' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chat List */}
          <div className="flex-1 min-h-0">
            <ChatList onChatSelect={handleChatSelect} selectedChatId={selectedChat?.id} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${(selectedChat || currentView === 'settings') ? 'block' : 'hidden md:block'} min-h-0`}>
        {currentView === 'settings' ? (
          <Settings onBack={() => setCurrentView('chat')} />
        ) : selectedChat ? (
          <div className="h-full flex flex-col min-h-0">
            {/* Mobile Back Button */}
            <div className="md:hidden bg-sidebar p-3 border-b border-sidebar-border">
              <button
                onClick={() => setSelectedChat(null)}
                className="flex items-center text-sidebar-primary hover:text-sidebar-primary/90 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to chats
              </button>
            </div>

            {/* Chat Interface */}
            <div className="flex-1 min-h-0">
              <ChatInterface chat={selectedChat} />
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="hidden md:flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center p-8">
              <div className="text-6xl mb-6">💬</div>
              <h2 className="text-xl font-medium text-foreground mb-3">Welcome to Customer Service</h2>
              <p className="text-base">Select a chat from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}