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
  
  const [step, setStep] = useState<1 | 2>(1);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterInputSchema)
  });

  const [serverError, setServerError] = useState('');

  const onSubmit = async (data: RegisterInput) => {
    try {
      setServerError('');
      await api.post('/auth/register', data);
      setRegisteredEmail(data.email);
      setStep(2);
      toast.success('Registration successful. Please check your email for the OTP.');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed.';
      setServerError(message);
    }
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    
    try {
      setIsVerifying(true);
      setServerError('');
      const response = await api.post('/auth/verify-email', { email: registeredEmail, otp });
      setUser(response.data.user);
      toast.success('Email verified successfully!');
      router.push('/events');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Verification failed.';
      setServerError(message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 animated-gradient-bg relative overflow-hidden">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md p-8 glass rounded-xl shadow-warm-md border border-[var(--border)] relative z-10">
        <h1 className="text-3xl font-bold font-heading text-[var(--text-primary)] mb-6 text-center">
          {step === 1 ? t('auth.joinSevantra', 'Join Sevantra') : 'Verify Email'}
        </h1>
        
        {step === 1 ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[var(--text-primary)]">{t('auth.firstName', 'First Name')}</label>
                <Input {...register('firstName')} className="bg-[var(--surface)]" />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-primary)]">{t('auth.lastName', 'Last Name')}</label>
                <Input {...register('lastName')} className="bg-[var(--surface)]" />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

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
              {isSubmitting ? t('auth.registering', 'Registering...') : t('auth.registerButton', 'Register')}
            </Button>
          </form>
        ) : (
          <form onSubmit={onVerify} className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)] text-center mb-4">
              We've sent a 6-digit one-time password to <strong>{registeredEmail}</strong>. Please enter it below to verify your account.
            </p>
            <div>
              <label className="text-sm font-medium text-[var(--text-primary)]">OTP Code</label>
              <Input 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                required
                className="text-center text-lg tracking-widest bg-[var(--surface)]"
              />
            </div>
            <Button type="submit" className="w-full mt-4 bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-lg shadow-orange-500/30" disabled={isVerifying || otp.length < 6}>
              {isVerifying ? 'Verifying...' : 'Verify Email'}
            </Button>
            <div className="text-center mt-2">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="text-sm text-[var(--primary)] hover:underline font-medium"
              >
                Use a different email
              </button>
            </div>
          </form>
        )}

        {serverError && (
          <div className="mt-4 p-3 rounded-lg bg-[var(--background)]0/10 border border-red-500/20 text-red-500 text-sm text-center">
            {serverError}
          </div>
        )}

        {step === 1 && (
          <p className="mt-6 text-center text-sm text-[var(--text-secondary)] font-medium">
            {t('auth.hasAccount', 'Already have an account?')} <Link href="/login" className="text-[var(--primary)] hover:underline font-bold">{t('auth.logInLink', 'Log in')}</Link>
          </p>
        )}
      </div>
      
      {/* Ambient background blur blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--secondary)]/20 rounded-full blur-[120px] pointer-events-none z-0" />
    </div>
  );
}
