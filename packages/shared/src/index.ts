import { z } from 'zod';

export const GlobalRoleSchema = z.enum(['CITIZEN', 'PLATFORM_ADMIN']);
export const OrgRoleSchema = z.enum(['MEMBER', 'ADMIN']);
export const VerificationStatusSchema = z.enum(['PENDING', 'VERIFIED', 'REJECTED']);

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: GlobalRoleSchema,
  avatarUrl: z.string().url().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const RegisterInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  description: z.string(),
  website: z.string().url().nullable().optional(),
  verificationStatus: VerificationStatusSchema,
  verificationDocUrl: z.string().url().nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateOrganizationInputSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  type: z.enum(['NON_PROFIT', 'CORPORATE', 'GOVERNMENT', 'COMMUNITY']),
  description: z.string().min(10, "Please provide a brief description (at least 10 characters)"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  verificationDocUrl: z.string().url("A valid document URL is required for verification"),
});

export const EventCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
});

export const EventSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  categoryId: z.string().uuid(),
  organizationId: z.string().uuid(),
  creatorId: z.string().uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  locationName: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  capacity: z.number().nullable().optional(),
  providesCertificate: z.boolean().default(false),
  requirements: z.string().nullable().optional(),
  minimumAge: z.number().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  acceptsDonations: z.boolean().default(false),
  upiId: z.string().nullable().optional(),
  minDonationAmount: z.number().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CreateEventInputSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  categoryId: z.string().min(1, "Please select a valid category"),
  organizationId: z.string().uuid("Organization is required"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  locationName: z.string().min(3, "Location name is required"),
  latitude: z.number(),
  longitude: z.number(),
  capacity: z.coerce.number().int().positive().optional(),
  providesCertificate: z.boolean().default(false),
  requirements: z.string().optional(),
  minimumAge: z.coerce.number().int().min(1).optional(),
  imageUrl: z.string().url().optional(),
  acceptsDonations: z.boolean().default(false).optional(),
  upiId: z.string().optional(),
  minDonationAmount: z.coerce.number().min(1).optional(),
});

export const EventRegistrationSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  userId: z.string().uuid(),
  status: z.enum(['ATTENDING', 'WAITLISTED', 'CHECKED_IN', 'CANCELLED']),
  checkedInAt: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const EventFeedbackSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  userId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CreateFeedbackInputSchema = z.object({
  eventId: z.string().uuid(),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;
export type CreateOrganizationInput = z.infer<typeof CreateOrganizationInputSchema>;
export type EventCategory = z.infer<typeof EventCategorySchema>;
export type Event = z.infer<typeof EventSchema>;
export type CreateEventInput = z.infer<typeof CreateEventInputSchema>;
export type EventRegistration = z.infer<typeof EventRegistrationSchema>;
export type EventFeedback = z.infer<typeof EventFeedbackSchema>;
export type CreateFeedbackInput = z.infer<typeof CreateFeedbackInputSchema>;
