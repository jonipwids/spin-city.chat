'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextType {
  fontSize: number;
  profilePicture: string;
  updateFontSize: (size: number) => void;
  updateProfilePicture: (picture: string) => void;
  updateUserName: (name: string) => void;
  userName: string;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState(16);
  const [profilePicture, setProfilePicture] = useState('');
  const [userName, setUserName] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedFontSize = localStorage.getItem('fontSize');
    const savedProfilePicture = localStorage.getItem('profilePicture');
    const savedUserName = localStorage.getItem('userName');

    if (savedFontSize) {
      const parsedSize = parseInt(savedFontSize);
      if (!isNaN(parsedSize) && parsedSize >= 12 && parsedSize <= 24) {
        setFontSize(parsedSize);
      }
    }
    if (savedProfilePicture && savedProfilePicture.trim()) {
      // Validate URL format
      try {
        new URL(savedProfilePicture);
        setProfilePicture(savedProfilePicture);
      } catch {
        // Invalid URL, don't load it
        console.warn('Invalid profile picture URL in localStorage');
      }
    }
    if (savedUserName && savedUserName.trim()) {
      setUserName(savedUserName);
    }

    setIsInitialized(true);
  }, []);

  const updateFontSize = (size: number) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size.toString());
    // Update CSS custom property
    document.documentElement.style.setProperty('--font-size', `${size}px`);
  };

  const updateProfilePicture = (picture: string) => {
    setProfilePicture(picture);
    localStorage.setItem('profilePicture', picture);
  };

  const updateUserName = (name: string) => {
    setUserName(name);
    localStorage.setItem('userName', name);
  };

  return (
    <SettingsContext.Provider
      value={{
        fontSize,
        profilePicture,
        userName,
        updateFontSize,
        updateProfilePicture,
        updateUserName,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
