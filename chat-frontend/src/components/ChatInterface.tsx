'use client';

import { useState } from 'react';
import { Chat } from '@/types';
import ChatTab from './ChatTab';
import FinancialTab from './FinancialTab';
import GamesTab from './GamesTab';

interface ChatInterfaceProps {
  chat: Chat;
}

type TabType = 'chat' | 'financial' | 'games';

export default function ChatInterface({ chat }: ChatInterfaceProps) {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  
  const customer = chat.customer;
  const agent = chat.agent;
  
  const getAvatar = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3390ec&color=fff&size=32&rounded=true`;
  };

  const tabs = [
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'financial', label: 'Deposits/Withdrawals', icon: '💰' },
    { id: 'games', label: 'Games', icon: '🎮' }
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Fixed Header - Customer Info and Tabs */}
      <div className="flex-shrink-0 bg-sidebar p-4 border-b border-sidebar-border">
        <div className="flex items-center mb-4">
          <img
            src={getAvatar(customer?.name || 'Unknown')}
            alt=""
            className="w-12 h-12 rounded-full"
          />
          <div className="ml-4 flex-1">
            <h2 className="font-medium text-sidebar-foreground">{customer?.name || 'Unknown Customer'}</h2>
            <div className="flex items-center text-sm text-muted-foreground">
              <div className={`w-2 h-2 rounded-full mr-2 ${customer?.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              {customer?.isOnline ? 'Online' : 'Offline'}
              <span className="mx-2">•</span>
              <span>Agent: {agent?.name || 'Unassigned'}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-1 bg-background rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 flex items-center justify-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
            >
              <span className="mr-2 text-base">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden min-h-0">
        {activeTab === 'chat' && <ChatTab chat={chat} />}
        {activeTab === 'financial' && (
          <FinancialTab
            deposits={[]}
            withdrawals={[]}
          />
        )}
        {activeTab === 'games' && (
          <GamesTab games={[]} />
        )}
      </div>
    </div>
  );
}