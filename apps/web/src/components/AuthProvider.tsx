'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

import { usePathname, useRouter } from 'next/navigation';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();
  const router = useRouter();

  // Define routes that require authentication
  const protectedRoutes = ['/profile', '/admin', '/events/new', '/organizations/new'];
  const isProtected = protectedRoutes.some(route => pathname?.startsWith(route));

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        logout();
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [setUser, logout]);

  useEffect(() => {
    if (!isInitializing) {
      if (isProtected && !user) {
        router.push('/login');
      } else if (pathname?.startsWith('/admin') && user?.role !== 'PLATFORM_ADMIN') {
        router.push('/events'); // Redirect regular users away from admin
      }
    }
  }, [isInitializing, isProtected, user, pathname, router]);

  // Optional: You could return a loading skeleton here instead of rendering children immediately,
  // but to avoid hydration mismatch flashes, it's often better to let children render and handle their own loading states,
  // or at least wait for auth check to finish before rendering protected routes.
  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--background)]">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
