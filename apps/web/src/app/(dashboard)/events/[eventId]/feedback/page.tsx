'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateFeedbackInputSchema, type CreateFeedbackInput } from 'shared';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';

export default function FeedbackPage() {
  const { eventId } = useParams();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateFeedbackInput>({
    resolver: zodResolver(CreateFeedbackInputSchema),
    defaultValues: { eventId: eventId as string }
  });

  const onSubmit = async (data: CreateFeedbackInput) => {
    try {
      await api.post(`/registrations/${eventId}/feedback`, data);
      toast.success('Thank you for your feedback!');
      router.push('/events');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit feedback');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-[var(--background)]">
      <div className="w-full max-w-xl p-8 bg-[var(--surface)] rounded-xl shadow-warm-md border border-[var(--border)]">
        <h1 className="text-3xl font-bold font-heading text-[var(--text-primary)] mb-2">Event Feedback</h1>
        <p className="text-[var(--text-secondary)] mb-6 text-sm">How was your experience? Your feedback helps organizations improve civic engagement.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] mb-2 block">Rating (1 to 5)</label>
            <input 
              type="range" 
              min="1" 
              max="5" 
              {...register('rating', { valueAsNumber: true })}
              className="w-full accent-[var(--primary)]"
            />
            {errors.rating && <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] mb-2 block">Comments (Optional)</label>
            <textarea 
              {...register('comment')} 
              className="flex min-h-[100px] w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-warm-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              placeholder="What did you like? What could be better?"
            />
          </div>

          <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
      </div>
    </div>
  );
}
