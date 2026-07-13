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
import { Heart } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
// ... existing imports ...
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

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setServerError('');
      const response = await api.post('/auth/google', { token: credentialResponse.credential });
      setUser(response.data.user);
      toast.success('Successfully logged in with Google!');
      router.push('/events');
    } catch (error: any) {
      setServerError(error.response?.data?.error || 'Google login failed');
    }
  };

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
            <h2 className="text-5xl font-black font-heading leading-[1.1]">Join the<br/>Movement,<br/>Today.</h2>
            <p className="text-lg text-white/90 font-medium leading-relaxed">Create an account to start volunteering, discovering local events, and connecting with non-profits in your area.</p>
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
              <h1 className="text-3xl md:text-4xl font-black font-heading text-[var(--text-primary)]">
                {step === 1 ? t('auth.joinSevantra', 'Create Account') : 'Verify Email'}
              </h1>
              <p className="text-[var(--text-secondary)] font-medium">
                {step === 1 ? 'Enter your details below to get started.' : 'Enter the code sent to your email.'}
              </p>
            </div>

            {step === 1 && (
              <>
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
                    width="100%"
                  />
                </div>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[var(--border)]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[var(--background)] px-2 text-[var(--text-secondary)]">Or continue with email</span>
                  </div>
                </div>
              </>
            )}

            {step === 1 ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--text-primary)]">{t('auth.firstName', 'First Name')}</label>
                    <Input {...register('firstName')} className="bg-[var(--surface)] h-12 text-base px-4 rounded-xl border-[var(--border)] focus:ring-[var(--primary)]" placeholder="John" />
                    {errors.firstName && <p className="text-red-500 text-sm font-medium">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--text-primary)]">{t('auth.lastName', 'Last Name')}</label>
                    <Input {...register('lastName')} className="bg-[var(--surface)] h-12 text-base px-4 rounded-xl border-[var(--border)] focus:ring-[var(--primary)]" placeholder="Doe" />
                    {errors.lastName && <p className="text-red-500 text-sm font-medium">{errors.lastName.message}</p>}
                  </div>
                </div>

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
                  {isSubmitting ? t('auth.registering', 'Creating Account...') : t('auth.registerButton', 'Create Account')}
                </Button>
              </form>
            ) : (
              <form onSubmit={onVerify} className="space-y-6">
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  <p className="text-sm text-[var(--text-secondary)] text-center leading-relaxed">
                    We've sent a 6-digit one-time password to <br/><strong className="text-[var(--text-primary)]">{registeredEmail}</strong>
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-primary)] text-center block">OTP Code</label>
                  <Input 
                    type="text" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    required
                    className="text-center text-2xl tracking-[0.5em] font-mono h-16 bg-[var(--surface)] rounded-xl border-[var(--border)] focus:ring-[var(--primary)] uppercase"
                  />
                </div>
                
                <Button type="submit" className="w-full h-14 text-lg mt-2 bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-lg shadow-[var(--primary)]/20 hover:shadow-[var(--primary)]/30 hover:-translate-y-0.5 transition-all font-bold rounded-xl" disabled={isVerifying || otp.length < 6}>
                  {isVerifying ? 'Verifying...' : 'Verify Email'}
                </Button>
                
                <div className="text-center pt-2">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] hover:underline font-medium transition-colors"
                  >
                    Not your email? Change it here
                  </button>
                </div>
              </form>
            )}

            {serverError && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold text-center flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {serverError}
              </div>
            )}

            {step === 1 && (
              <p className="text-center text-base text-[var(--text-secondary)] font-medium pt-4">
                {t('auth.hasAccount', 'Already have an account?')} <Link href="/login" className="text-[var(--primary)] hover:text-[var(--primary-hover)] hover:underline font-bold ml-1">{t('auth.logInLink', 'Sign In')}</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
