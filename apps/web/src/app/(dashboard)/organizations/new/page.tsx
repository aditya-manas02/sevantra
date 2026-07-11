'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateOrganizationInputSchema, type CreateOrganizationInput } from 'shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Leaf, FileText, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CreateOrganizationPage() {
  const { t } = useTranslation();
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateOrganizationInput>({
    resolver: zodResolver(CreateOrganizationInputSchema),
    defaultValues: {
      type: 'NON_PROFIT'
    }
  });

  const onSubmit = async (data: CreateOrganizationInput) => {
    try {
      await api.post('/orgs', data);
      toast.success('Organization registered successfully! Pending admin verification.');
      router.push('/events');
    } catch (error) {
      console.error('Failed to create organization', error);
      toast.error('Failed to create organization. Please ensure the name is unique.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      
      <div className="mb-8 relative overflow-hidden bg-[var(--surface)] p-8 rounded-3xl border border-[var(--border)] shadow-soft">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full blur-[80px] opacity-10 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black font-heading text-[var(--primary)] mb-2 tracking-tight flex items-center gap-3">
            <Leaf className="w-8 h-8 text-[var(--secondary)]" />
            {t('orgs.startCommunityGroup', 'Start a Community Group')}
          </h1>
          <p className="text-lg text-[var(--text-secondary)] font-medium">
            {t('orgs.startCommunityGroupDesc', 'Register your organization to start hosting events and growing your local community.')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        <section className="bg-[var(--surface)] p-6 md:p-8 rounded-3xl border border-[var(--border)] shadow-soft">
          <h2 className="text-2xl font-bold font-heading text-[var(--text-primary)] mb-6 flex items-center gap-2">
            {t('orgs.groupDetails', '1. Group Details')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-bold text-[var(--text-primary)]">
                {t('orgs.orgName', 'Organization Name')} <span className="text-red-500">*</span>
              </label>
              <Input 
                {...register('name')} 
                placeholder={t('orgs.orgNamePlaceholder', 'e.g. Green Earth Initiative')} 
              />
              {errors.name && <p className="text-red-500 font-medium text-sm">{errors.name.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-bold text-[var(--text-primary)]">
                {t('orgs.orgType', 'Organization Type')} <span className="text-red-500">*</span>
              </label>
              <select 
                {...register('type')} 
                className="flex h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-base text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] shadow-sm"
              >
                <option value="COMMUNITY">{t('orgs.orgTypeCommunity', 'Community Group')}</option>
                <option value="NON_PROFIT">{t('orgs.orgTypeNonProfit', 'Non-Profit / NGO')}</option>
                <option value="CORPORATE">{t('orgs.orgTypeCorporate', 'Corporate CSR')}</option>
                <option value="GOVERNMENT">{t('orgs.orgTypeGovt', 'Government Agency')}</option>
              </select>
              {errors.type && <p className="text-red-500 font-medium text-sm">{errors.type.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-bold text-[var(--text-primary)]">
                {t('orgs.missionStatement', 'Mission Statement & Activities')} <span className="text-red-500">*</span>
              </label>
              <textarea 
                {...register('description')} 
                placeholder={t('orgs.missionPlaceholder', 'What does your organization do?')}
                className="flex min-h-[120px] w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-y shadow-sm"
              />
              {errors.description && <p className="text-red-500 font-medium text-sm">{errors.description.message}</p>}
            </div>
          </div>
        </section>

        <section className="bg-[var(--surface)] p-6 md:p-8 rounded-3xl border border-[var(--border)] shadow-soft">
          <h2 className="text-2xl font-bold font-heading text-[var(--text-primary)] mb-6 flex items-center gap-2">
            {t('orgs.verificationLinks', '2. Verification Links')}
          </h2>
          
          <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-2xl mb-6 flex gap-3">
            <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 font-medium">
              {t('orgs.verificationWarning', 'To keep our platform safe, all new organizations must provide a link to a public presence (website, social media, or registry) for manual verification.')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-bold text-[var(--text-primary)]">
                {t('orgs.verificationDocUrl', 'Verification Document / Social Link')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-[var(--text-secondary)]" />
                </div>
                <Input 
                  type="url" 
                  {...register('verificationDocUrl')} 
                  placeholder="https://" 
                  className="pl-12" 
                />
              </div>
              {errors.verificationDocUrl && <p className="text-red-500 font-medium text-sm">{errors.verificationDocUrl.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-bold text-[var(--text-primary)]">
                {t('orgs.officialWebsite', 'Official Website (Optional)')}
              </label>
              <Input 
                type="url" 
                {...register('website')} 
                placeholder="https://" 
              />
              {errors.website && <p className="text-red-500 font-medium text-sm">{errors.website.message}</p>}
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            className="w-full md:w-auto h-12 px-8 text-lg font-bold shadow-soft"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : t('orgs.submitApplication', 'Submit Application')}
          </Button>
        </div>
      </form>
    </div>
  );
}
