'use client';

import { useState } from 'react';

interface HelpFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpForm({ isOpen, onClose }: HelpFormProps) {
  const [from, setFrom] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Log the help request to console for now
    console.log('Help Request:', {
      from,
      message,
      timestamp: new Date().toISOString()
    });
    
    // Reset form and close modal
    setFrom('');
    setMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-lg border border-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-foreground">Need Help Logging In?</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="from" className="block text-sm font-medium text-foreground mb-2">
              From
            </label>
            <input
              id="from"
              type="text"
              placeholder="Your name or email"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full bg-input text-foreground rounded-xl px-4 py-3 border border-border focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
              Message
            </label>
            <textarea
              id="message"
              placeholder="Describe the issue you're experiencing..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full bg-input text-foreground rounded-xl px-4 py-3 border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              required
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-muted hover:bg-muted/80 text-muted-foreground font-medium py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-xl transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
