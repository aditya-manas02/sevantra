'use client';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateEventInputSchema, type CreateEventInput } from 'shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import MapLocationPickerDynamic from '@/components/MapLocationPickerDynamic';
import DateTimePicker from '@/components/DateTimePicker';
import CustomSelect from '@/components/CustomSelect';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

export default function CreateEventPage() {
  const { t } = useTranslation();
  const router = useRouter();
  
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/events/categories')).data.categories
  });

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await api.get('/auth/me')).data.user
  });

  const orgId = user?.orgMembers?.[0]?.organizationId || "00000000-0000-0000-0000-000000000000";

  const { register, control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<CreateEventInput>({
    resolver: zodResolver(CreateEventInputSchema) as any,
    defaultValues: {
      providesCertificate: false,
      acceptsDonations: false
    }
  });

  const selectedCategory = watch('categoryId');
  const [customCategoryName, setCustomCategoryName] = useState('');

  useEffect(() => {
    if (orgId) {
      setValue('organizationId', orgId);
    }
  }, [orgId, setValue]);

  const onSubmit = async (data: CreateEventInput) => {
    try {
      let finalCategoryId = data.categoryId;

      // If user selected to write a custom category
      if (finalCategoryId === 'custom-new') {
        if (!customCategoryName.trim()) {
          toast.error('Please enter a custom category name');
          return;
        }
        
        // Create the new category via API
        const catRes = await api.post('/events/categories', { name: customCategoryName });
        finalCategoryId = catRes.data.category.id;
      }

      await api.post('/events', { ...data, categoryId: finalCategoryId, organizationId: orgId });
      toast.success('Event created successfully!');
      router.push('/events');
    } catch (error) {
      console.error('Failed to create event', error);
      toast.error('Failed to create event.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-start p-4 md:py-12 bg-transparent min-h-full">
      <div className="w-full max-w-3xl p-6 md:p-10 bg-[var(--surface)] rounded-3xl shadow-soft border border-[var(--border)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full blur-[80px] opacity-10 pointer-events-none" />
        <div className="relative z-10 mb-8 pb-6 border-b border-[var(--border)]/50">
          <h1 className="text-3xl font-black font-heading text-[var(--primary)] mb-2">{t('events.createTitle', 'Create New Event')}</h1>
          <p className="text-[var(--text-secondary)] text-lg font-medium">{t('events.createSubtitle', 'Fill in the details to publish a new civic engagement event.')}</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[var(--text-primary)]">{t('events.eventTitle', 'Title')}</label>
              <Input {...register('title')} placeholder="e.g. Community Tree Plantation" />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--text-primary)]">{t('events.eventDesc', 'Description')}</label>
              <textarea 
                {...register('description')} 
                className="flex min-h-[100px] w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 shadow-warm-sm"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 bg-[var(--background)] p-6 rounded-2xl border border-[var(--border)]">
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <DateTimePicker 
                      label={t('events.startDate', 'Start Date & Time')}
                      value={field.value} 
                      onChange={field.onChange} 
                      error={errors.startDate?.message}
                    />
                  )}
                />
              
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field }) => (
                    <DateTimePicker 
                      label={t('events.endDate', 'End Date & Time')}
                      value={field.value} 
                      onChange={field.onChange} 
                      error={errors.endDate?.message}
                    />
                  )}
                />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--text-primary)] mb-2 block">{t('events.category', 'Category')}</label>
              
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <CustomSelect
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder={t('events.selectCategory', 'Select Category')}
                    className="h-12"
                    options={[
                      { value: 'custom-new', label: t('events.customCategory', 'Write Custom Category...'), className: 'font-bold text-[var(--primary)] hover:!bg-[var(--primary)] hover:!text-white' },
                      ...(categories?.map((c: any) => ({
                        value: c.id,
                        label: c.name
                      })) || [])
                    ]}
                  />
                )}
              />
              
              {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
            </div>

            {selectedCategory === 'custom-new' && (
              <div className="bg-[var(--primary)]/10 p-5 rounded-2xl border border-[var(--primary)]/20 mt-4 fade-in">
                <label className="text-sm font-bold text-[var(--text-primary)] mb-2 block">{t('events.newCategory', 'What is your new category?')}</label>
                <Input 
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  placeholder="e.g. Robotics Workshop"
                  className="h-12 border-[var(--primary)]/30 focus-visible:ring-[var(--primary)] bg-[var(--surface)]"
                  autoFocus
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-[var(--text-primary)]">{t('events.locationName', 'Location Name (e.g., Central Park)')}</label>
              <Input {...register('locationName')} />
              {errors.locationName && <p className="text-red-500 text-sm mt-1">{errors.locationName.message}</p>}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[var(--border)]/50">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">{t('events.requirements', 'Event Requirements')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-[var(--text-primary)]">{t('events.volunteersNeeded', 'Total Volunteers Needed')}</label>
                <Input type="number" {...register('capacity', { valueAsNumber: true })} placeholder="Optional" />
                {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>}
              </div>
              
              <div>
                <label className="text-sm font-medium text-[var(--text-primary)]">{t('events.minAge', 'Minimum Age Requirement')}</label>
                <Input type="number" {...register('minimumAge', { valueAsNumber: true })} placeholder="Optional (e.g. 18)" />
                {errors.minimumAge && <p className="text-red-500 text-sm mt-1">{errors.minimumAge.message}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[var(--background)] p-4 rounded-xl border border-[var(--border)]">
              <input 
                type="checkbox" 
                id="providesCertificate"
                {...register('providesCertificate')}
                className="w-5 h-5 rounded text-[var(--primary)] focus:ring-[var(--primary)] border-[var(--border)]"
              />
              <label htmlFor="providesCertificate" className="text-sm font-bold text-[var(--text-primary)] cursor-pointer">
                {t('events.providesCert', 'Will you provide an official certificate of participation to volunteers?')}
              </label>
            </div>

            <div className="bg-[var(--background)] p-6 rounded-xl border border-[var(--border)] space-y-4">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="acceptsDonations"
                  {...register('acceptsDonations')}
                  className="w-5 h-5 rounded text-[var(--primary)] focus:ring-[var(--primary)] border-[var(--border)]"
                />
                <label htmlFor="acceptsDonations" className="text-sm font-bold text-[var(--text-primary)] cursor-pointer">
                  {t('events.acceptDonations', 'Accept Donations via UPI (INR)')}
                </label>
              </div>

              {watch('acceptsDonations') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--border)]/50 fade-in">
                  <div>
                    <label className="text-sm font-medium text-[var(--text-primary)]">{t('events.upiId', 'Your UPI ID')} <span className="text-red-500">*</span></label>
                    <Input {...register('upiId')} placeholder="e.g. yourname@okicici" />
                    {errors.upiId && <p className="text-red-500 text-sm mt-1">{errors.upiId.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--text-primary)]">{t('events.minDonation', 'Minimum Donation Amount (₹)')}</label>
                    <Input type="number" {...register('minDonationAmount', { valueAsNumber: true })} placeholder="Optional (e.g. 50)" />
                    {errors.minDonationAmount && <p className="text-red-500 text-sm mt-1">{errors.minDonationAmount.message}</p>}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--text-primary)]">{t('events.specificReqs', 'Specific Requirements / Things to Bring')}</label>
              <textarea 
                {...register('requirements')} 
                placeholder="e.g. Bring your own gloves, wear closed-toe shoes..."
                className="flex min-h-[80px] w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 shadow-warm-sm"
              />
              {errors.requirements && <p className="text-red-500 text-sm mt-1">{errors.requirements.message}</p>}
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)]/50">
            <label className="text-sm font-medium text-[var(--text-primary)] mb-2 block">{t('events.pinLocation', 'Pin Location on Map')}</label>
            <MapLocationPickerDynamic onLocationSelect={(lat, lng) => {
              setValue('latitude', lat);
              setValue('longitude', lng);
            }} />
            {(errors.latitude || errors.longitude) && <p className="text-red-500 text-sm mt-1">Please select a location on the map</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t('events.creating', 'Creating...') : t('events.createButton', 'Create Event')}
          </Button>
        </form>
      </div>
    </div>
  );
}
