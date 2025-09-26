'use client';

import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return user ? <Dashboard /> : <LoginForm />;
}
