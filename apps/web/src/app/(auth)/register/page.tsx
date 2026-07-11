'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterInputSchema, type RegisterInput } from 'shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterInputSchema)
  });

  const [serverError, setServerError] = useState('');

  const onSubmit = async (data: RegisterInput) => {
    try {
      setServerError('');
      const response = await api.post('/auth/register', data);
      setUser(response.data.user);
      router.push('/events');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed.';
      setServerError(message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-[var(--background)] relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md p-8 bg-[var(--surface)] rounded-xl shadow-warm-md border border-[var(--border)]">
        <h1 className="text-3xl font-bold font-heading text-[var(--text-primary)] mb-6 text-center">{t('auth.joinSevantra', 'Join Sevantra')}</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[var(--text-primary)]">{t('auth.firstName', 'First Name')}</label>
              <Input {...register('firstName')} />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--text-primary)]">{t('auth.lastName', 'Last Name')}</label>
              <Input {...register('lastName')} />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--text-primary)]">{t('auth.email', 'Email Address')}</label>
            <Input type="email" {...register('email')} />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--text-primary)]">{t('auth.password', 'Password')}</label>
            <Input type="password" {...register('password')} />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? t('auth.registering', 'Registering...') : t('auth.registerButton', 'Register')}
          </Button>

          {serverError && (
            <div className="mt-4 p-3 rounded-lg bg-[var(--background)]0/10 border border-red-500/20 text-red-500 text-sm text-center">
              {serverError}
            </div>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          {t('auth.hasAccount', 'Already have an account?')} <Link href="/login" className="text-[var(--primary)] hover:underline">{t('auth.logInLink', 'Log in')}</Link>
        </p>
      </div>
    </div>
  );
}
