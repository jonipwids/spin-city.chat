'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { apiClient } from '@/lib/backend-api';
import { wsService } from '@/lib/websocket';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (savedUser && token) {
        try {
          // Verify the token is still valid by fetching current user
          const response = await apiClient.getMe();
          if (response.success) {
            setUser(response.data);
            // Connect to WebSocket
            connectWebSocket();
          } else {
            // Clear invalid data
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Failed to verify token:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const connectWebSocket = () => {
    const wsUrl = apiClient.getWebSocketUrl();
    wsService.connect(wsUrl);
    
    wsService.on('connected', () => {
      console.log('WebSocket connected');
    });
    
    wsService.on('disconnected', () => {
      console.log('WebSocket disconnected');
    });
    
    wsService.on('user_connected', (data: unknown) => {
      console.log('User connected:', data);
    });
    
    wsService.on('user_disconnected', (data: unknown) => {
      console.log('User disconnected:', data);
    });
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await apiClient.login(username, password);
      
      if (response.success && response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Connect to WebSocket after successful login
        connectWebSocket();
        
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Disconnect WebSocket
    wsService.disconnect();
    
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};