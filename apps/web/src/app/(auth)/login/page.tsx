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
import { Heart } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
// ... existing imports ...
export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(LoginInputSchema)
  });

  const [serverError, setServerError] = useState('');

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setServerError('');
      const response = await api.post('/auth/google', { token: credentialResponse.credential });
      if (response.data.token) localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      toast.success('Successfully logged in with Google!');
      router.push('/events');
    } catch (error: any) {
      setServerError(error.response?.data?.error || 'Google login failed');
    }
  };

  const onSubmit = async (data: LoginInput) => {
    try {
      setServerError('');
      const response = await api.post('/auth/login', data);
      if (response.data.token) localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      toast.success('Successfully logged in!');
      router.push('/events');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed. Please try again.';
      setServerError(message);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Image Panel */}
      <div className="hidden lg:flex w-1/2 relative bg-[var(--surface)] overflow-hidden">
        <img src="/auth-bg.png" alt="Community" className="absolute inset-0 w-full h-full object-cover z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
        
        <div className="relative z-20 flex flex-col justify-between h-full p-12 lg:p-24">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/30 group-hover:scale-105 transition-transform">
                <Heart className="text-white w-7 h-7" />
              </div>
              <span className="text-3xl font-black font-heading text-white tracking-tight">Sevantra</span>
            </div>
          </Link>
          
          <div className="text-white space-y-6 max-w-lg mb-8">
            <h2 className="text-5xl font-black font-heading leading-[1.1]">Empowering<br/>Communities,<br/>Together.</h2>
            <p className="text-lg text-white/90 font-medium leading-relaxed">Join thousands of volunteers and organizations making a real impact in local neighborhoods.</p>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col relative">
        <div className="absolute top-6 right-6 z-50">
          <LanguageSwitcher />
        </div>
        
        <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-24">
          <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center lg:text-left space-y-2 mb-8">
              <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center">
                  <Heart className="text-white w-6 h-6" />
                </div>
                <span className="text-3xl font-black font-heading text-[var(--text-primary)] tracking-tight">Sevantra</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black font-heading text-[var(--text-primary)]">{t('auth.welcomeBack', 'Welcome Back')}</h1>
              <p className="text-[var(--text-secondary)] font-medium">Please enter your details to sign in.</p>
            </div>

            <div className="flex justify-center w-full mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setServerError('Google Login Failed');
                }}
                useOneTap
                theme="outline"
                size="large"
                shape="rectangular"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[var(--background)] px-2 text-[var(--text-secondary)]">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-primary)]">{t('auth.email', 'Email Address')}</label>
                <Input type="email" {...register('email')} className="bg-[var(--surface)] h-12 text-base px-4 rounded-xl border-[var(--border)] focus:ring-[var(--primary)]" placeholder="name@example.com" />
                {errors.email && <p className="text-red-500 text-sm font-medium">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-primary)]">{t('auth.password', 'Password')}</label>
                <Input type="password" {...register('password')} className="bg-[var(--surface)] h-12 text-base px-4 rounded-xl border-[var(--border)] focus:ring-[var(--primary)]" placeholder="••••••••" />
                {errors.password && <p className="text-red-500 text-sm font-medium">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full h-14 text-lg mt-4 bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-lg shadow-[var(--primary)]/20 hover:shadow-[var(--primary)]/30 hover:-translate-y-0.5 transition-all font-bold rounded-xl" disabled={isSubmitting}>
                {isSubmitting ? t('auth.loggingIn', 'Logging in...') : t('auth.loginButton', 'Sign In')}
              </Button>

              {serverError && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold text-center flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {serverError}
                </div>
              )}
            </form>

            <p className="text-center text-base text-[var(--text-secondary)] font-medium pt-4">
              {t('auth.noAccount', "Don't have an account?")} <Link href="/register" className="text-[var(--primary)] hover:text-[var(--primary-hover)] hover:underline font-bold ml-1">{t('auth.registerHere', 'Create an account')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
