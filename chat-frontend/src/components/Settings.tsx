'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';

interface SettingsProps {
  onBack?: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const { user, logout } = useAuth();
  const { fontSize, profilePicture, userName, updateFontSize, updateProfilePicture, updateUserName } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempName, setTempName] = useState(userName || user?.name || '');

  // Update tempName when userName changes
  useEffect(() => {
    if (userName) {
      setTempName(userName);
    }
  }, [userName]);

  // Generate fallback avatar URL
  const getFallbackAvatar = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3390ec&color=fff&size=32&rounded=true`;
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateProfilePicture(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameChange = () => {
    updateUserName(tempName);
  };

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 2, 24);
    updateFontSize(newSize);
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 2, 12);
    updateFontSize(newSize);
  };

  const resetFontSize = () => {
    updateFontSize(16);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Mobile Back Button */}
      <div className="md:hidden bg-sidebar p-3 border-b border-sidebar-border">
        <button
          onClick={() => {
            if (onBack) {
              onBack();
            } else {
              // Fallback navigation
              window.location.href = '/';
            }
          }}
          className="flex items-center text-sidebar-primary hover:text-sidebar-primary/90 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to chat
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex flex-shrink-0 bg-sidebar p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div>
              <h2 className="text-sidebar-foreground font-medium text-lg">Settings</h2>
              <p className="text-muted-foreground text-sm">Customize your experience</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Profile Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Profile Settings</h2>
              <p className="text-muted-foreground mt-1">Manage your personal information and profile picture.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              {/* Profile Picture Card */}
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <img
                    src={profilePicture || getFallbackAvatar(user?.name || 'User')}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-4 border-background shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getFallbackAvatar(user?.name || 'User');
                    }}
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-medium text-foreground">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground">Upload a new profile picture or use a generated avatar.</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      Change Picture
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                    <span className="text-sm text-muted-foreground">JPG, PNG up to 5MB</span>
                  </div>
                </div>
              </div>

              {/* Display Name */}
              <div className="border-t border-border pt-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Display Name</label>
                    <p className="text-sm text-muted-foreground">This is the name that appears in your chat messages.</p>
                  </div>
                  <div className="flex space-x-3 max-w-md">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      placeholder="Enter your display name"
                      className="flex-1 px-3 py-2 bg-background text-foreground border border-input rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      onClick={handleNameChange}
                      disabled={!tempName.trim() || tempName === userName}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Appearance</h2>
              <p className="text-muted-foreground mt-1">Customize how the application looks and feels.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-foreground">Font Size</h3>
                  <p className="text-sm text-muted-foreground">Adjust the text size for better readability.</p>
                </div>

                <div className="flex items-center justify-between max-w-md">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={decreaseFontSize}
                      disabled={fontSize <= 12}
                      className="w-10 h-10 bg-secondary hover:bg-secondary/80 disabled:bg-muted/50 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <svg className="w-4 h-4 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>

                    <div className="min-w-[60px] text-center">
                      <span className="text-lg font-semibold text-foreground">{fontSize}px</span>
                    </div>

                    <button
                      onClick={increaseFontSize}
                      disabled={fontSize >= 24}
                      className="w-10 h-10 bg-secondary hover:bg-secondary/80 disabled:bg-muted/50 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <svg className="w-4 h-4 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  <button
                    onClick={resetFontSize}
                    className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Preview</h2>
              <p className="text-muted-foreground mt-1">See how your settings will appear in the chat.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg border border-border/50">
                  <img
                    src={profilePicture || getFallbackAvatar(userName || user?.name || 'User')}
                    alt="Preview"
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getFallbackAvatar(userName || user?.name || 'User');
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-foreground font-medium" style={{ fontSize: fontSize + 'px' }}>
                        {userName || user?.name || 'Your Name'}
                      </span>
                      <span className="text-xs text-muted-foreground">now</span>
                    </div>
                    <p className="text-muted-foreground" style={{ fontSize: fontSize + 'px' }}>
                      This is how your messages and profile will appear in the chat.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
