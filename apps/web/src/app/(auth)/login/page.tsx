'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginInputSchema, type LoginInput } from 'shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(LoginInputSchema)
  });

  const [serverError, setServerError] = useState('');

  const onSubmit = async (data: LoginInput) => {
    try {
      setServerError('');
      const response = await api.post('/auth/login', data);
      setUser(response.data.user);
      router.push('/events');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed.';
      setServerError(message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 animated-gradient-bg relative overflow-hidden">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md p-8 glass rounded-xl shadow-warm-md border border-[var(--border)] relative z-10">
        <h1 className="text-3xl font-bold font-heading text-[var(--text-primary)] mb-6 text-center">{t('auth.welcomeBack', 'Welcome Back')}</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)]">{t('auth.email', 'Email Address')}</label>
            <Input type="email" {...register('email')} className="bg-[var(--surface)]" />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--text-primary)]">{t('auth.password', 'Password')}</label>
            <Input type="password" {...register('password')} className="bg-[var(--surface)]" />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full mt-4 bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-lg shadow-orange-500/30" disabled={isSubmitting}>
            {isSubmitting ? t('auth.loggingIn', 'Logging in...') : t('auth.loginButton', 'Login')}
          </Button>

          {serverError && (
            <div className="mt-4 p-3 rounded-lg bg-[var(--background)]0/10 border border-red-500/20 text-red-500 text-sm text-center">
              {serverError}
            </div>
          )}
        </form>
        
        <p className="mt-6 text-center text-sm text-[var(--text-secondary)] font-medium">
          {t('auth.noAccount', "Don't have an account?")} <Link href="/register" className="text-[var(--primary)] hover:underline font-bold">{t('auth.registerHere', 'Register here')}</Link>
        </p>
      </div>
      
      {/* Ambient background blur blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--secondary)]/20 rounded-full blur-[120px] pointer-events-none z-0" />
    </div>
  );
}
