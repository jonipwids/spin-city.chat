'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import HelpForm from './HelpForm';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showHelpForm, setShowHelpForm] = useState(false);
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await login(username, password);
    if (!success) {
      setError('Invalid credentials. Try: agent1/password123 or agent2/password123');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl p-8 w-full max-w-md shadow-lg border border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Customer Service</h1>
          <p className="text-muted-foreground">Agent Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mx-1 my-3">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-input text-foreground rounded-xl px-4 py-2 border border-border focus:border-primary focus:outline-none transition-colors text-lg"
              required
            />
          </div>

          <div className="mx-1 my-3">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-input text-foreground rounded-xl px-4 py-2 border border-border focus:border-primary focus:outline-none transition-colors text-lg"
              required
            />
          </div>

          {error && (
            <div className="text-red-400 text-base text-center bg-red-950 rounded-xl p-3 mx-1 my-3">
              {error}
            </div>
          )}

          <div className="mx-1 my-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground font-medium py-2 rounded-xl transition-colors text-lg"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-base text-muted-foreground space-y-1 mx-1 my-3">
          <p>Demo accounts:</p>
          <p>Agent: <span className="text-primary">agent1</span> / password123</p>
          <p>Super Agent: <span className="text-primary">agent2</span> / password123</p>
          <p>Customer: <span className="text-primary">customer1</span> / password123</p>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowHelpForm(true)}
            className="text-primary hover:text-primary/80 underline text-sm transition-colors"
          >
            Having trouble logging in?
          </button>
        </div>
      </div>
      
      <HelpForm 
        isOpen={showHelpForm} 
        onClose={() => setShowHelpForm(false)} 
      />
    </div>
  );
}