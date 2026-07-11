"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateFeedbackInputSchema = exports.EventFeedbackSchema = exports.EventRegistrationSchema = exports.CreateEventInputSchema = exports.EventSchema = exports.EventCategorySchema = exports.CreateOrganizationInputSchema = exports.OrganizationSchema = exports.LoginInputSchema = exports.RegisterInputSchema = exports.UserSchema = exports.VerificationStatusSchema = exports.OrgRoleSchema = exports.GlobalRoleSchema = void 0;
const zod_1 = require("zod");
exports.GlobalRoleSchema = zod_1.z.enum(['CITIZEN', 'PLATFORM_ADMIN']);
exports.OrgRoleSchema = zod_1.z.enum(['MEMBER', 'ADMIN']);
exports.VerificationStatusSchema = zod_1.z.enum(['PENDING', 'VERIFIED', 'REJECTED']);
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    role: exports.GlobalRoleSchema,
    avatarUrl: zod_1.z.string().url().nullable().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.RegisterInputSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters long"),
    firstName: zod_1.z.string().min(1, "First name is required"),
    lastName: zod_1.z.string().min(1, "Last name is required"),
});
exports.LoginInputSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.OrganizationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(2),
    description: zod_1.z.string(),
    website: zod_1.z.string().url().nullable().optional(),
    verificationStatus: exports.VerificationStatusSchema,
    verificationDocUrl: zod_1.z.string().url().nullable().optional(),
    logoUrl: zod_1.z.string().url().nullable().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.CreateOrganizationInputSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters long"),
    type: zod_1.z.enum(['NON_PROFIT', 'CORPORATE', 'GOVERNMENT', 'COMMUNITY']),
    description: zod_1.z.string().min(10, "Please provide a brief description (at least 10 characters)"),
    website: zod_1.z.string().url("Must be a valid URL").optional().or(zod_1.z.literal('')),
    verificationDocUrl: zod_1.z.string().url("A valid document URL is required for verification"),
});
exports.EventCategorySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string(),
    description: zod_1.z.string().nullable().optional(),
    icon: zod_1.z.string().nullable().optional(),
});
exports.EventSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    categoryId: zod_1.z.string().uuid(),
    organizationId: zod_1.z.string().uuid(),
    creatorId: zod_1.z.string().uuid(),
    startDate: zod_1.z.coerce.date(),
    endDate: zod_1.z.coerce.date(),
    locationName: zod_1.z.string(),
    latitude: zod_1.z.number(),
    longitude: zod_1.z.number(),
    capacity: zod_1.z.number().nullable().optional(),
    providesCertificate: zod_1.z.boolean().default(false),
    requirements: zod_1.z.string().nullable().optional(),
    minimumAge: zod_1.z.number().nullable().optional(),
    imageUrl: zod_1.z.string().url().nullable().optional(),
    acceptsDonations: zod_1.z.boolean().default(false),
    upiId: zod_1.z.string().nullable().optional(),
    minDonationAmount: zod_1.z.number().nullable().optional(),
    createdAt: zod_1.z.coerce.date(),
    updatedAt: zod_1.z.coerce.date(),
});
exports.CreateEventInputSchema = zod_1.z.object({
    title: zod_1.z.string().min(5, "Title must be at least 5 characters"),
    description: zod_1.z.string().min(20, "Description must be at least 20 characters"),
    categoryId: zod_1.z.string().min(1, "Please select a valid category"),
    organizationId: zod_1.z.string().uuid("Organization is required"),
    startDate: zod_1.z.coerce.date(),
    endDate: zod_1.z.coerce.date(),
    locationName: zod_1.z.string().min(3, "Location name is required"),
    latitude: zod_1.z.number(),
    longitude: zod_1.z.number(),
    capacity: zod_1.z.coerce.number().int().positive().optional(),
    providesCertificate: zod_1.z.boolean().default(false),
    requirements: zod_1.z.string().optional(),
    minimumAge: zod_1.z.coerce.number().int().min(1).optional(),
    imageUrl: zod_1.z.string().url().optional(),
    acceptsDonations: zod_1.z.boolean().default(false).optional(),
    upiId: zod_1.z.string().optional(),
    minDonationAmount: zod_1.z.coerce.number().min(1).optional(),
});
exports.EventRegistrationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    eventId: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    status: zod_1.z.enum(['ATTENDING', 'WAITLISTED', 'CHECKED_IN', 'CANCELLED']),
    checkedInAt: zod_1.z.coerce.date().nullable().optional(),
    createdAt: zod_1.z.coerce.date(),
    updatedAt: zod_1.z.coerce.date(),
});
exports.EventFeedbackSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    eventId: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    rating: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string().nullable().optional(),
    createdAt: zod_1.z.coerce.date(),
    updatedAt: zod_1.z.coerce.date(),
});
exports.CreateFeedbackInputSchema = zod_1.z.object({
    eventId: zod_1.z.string().uuid(),
    rating: zod_1.z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
    comment: zod_1.z.string().optional(),
});
