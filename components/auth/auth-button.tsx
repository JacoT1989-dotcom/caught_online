'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { getAuthUrl, getLogoutUrl } from '@/lib/shopify/auth';
import { LogIn, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthButtonProps {
  className?: string;
}

export function AuthButton({ className }: AuthButtonProps) {
  const { isAuthenticated, user } = useAuth();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleAuth = () => {
    if (isAuthenticated) {
      // Logout
      const logoutUrl = getLogoutUrl(`${baseUrl}/auth/callback`);
      window.location.href = logoutUrl;
    } else {
      // Login
      const authUrl = getAuthUrl(`${baseUrl}/auth/callback`);
      window.location.href = authUrl;
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleAuth}
      className={cn("h-8 w-8", className)}
    >
      {isAuthenticated ? (
        <LogOut className="h-4 w-4" />
      ) : (
        <User className="h-4 w-4" />
      )}
    </Button>
  );
}