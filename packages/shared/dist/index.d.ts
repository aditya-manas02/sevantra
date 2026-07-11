import { z } from 'zod';
export declare const GlobalRoleSchema: z.ZodEnum<["CITIZEN", "PLATFORM_ADMIN"]>;
export declare const OrgRoleSchema: z.ZodEnum<["MEMBER", "ADMIN"]>;
export declare const VerificationStatusSchema: z.ZodEnum<["PENDING", "VERIFIED", "REJECTED"]>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodEnum<["CITIZEN", "PLATFORM_ADMIN"]>;
    avatarUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "CITIZEN" | "PLATFORM_ADMIN";
    createdAt: Date;
    updatedAt: Date;
    avatarUrl?: string | null | undefined;
}, {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "CITIZEN" | "PLATFORM_ADMIN";
    createdAt: Date;
    updatedAt: Date;
    avatarUrl?: string | null | undefined;
}>;
export declare const RegisterInputSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
}, {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
}>;
export declare const LoginInputSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const OrganizationSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    website: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    verificationStatus: z.ZodEnum<["PENDING", "VERIFIED", "REJECTED"]>;
    verificationDocUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    logoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string;
    verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
    website?: string | null | undefined;
    verificationDocUrl?: string | null | undefined;
    logoUrl?: string | null | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string;
    verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
    website?: string | null | undefined;
    verificationDocUrl?: string | null | undefined;
    logoUrl?: string | null | undefined;
}>;
export declare const CreateOrganizationInputSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["NON_PROFIT", "CORPORATE", "GOVERNMENT", "COMMUNITY"]>;
    description: z.ZodString;
    website: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    verificationDocUrl: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "NON_PROFIT" | "CORPORATE" | "GOVERNMENT" | "COMMUNITY";
    name: string;
    description: string;
    verificationDocUrl: string;
    website?: string | undefined;
}, {
    type: "NON_PROFIT" | "CORPORATE" | "GOVERNMENT" | "COMMUNITY";
    name: string;
    description: string;
    verificationDocUrl: string;
    website?: string | undefined;
}>;
export declare const EventCategorySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    icon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    description?: string | null | undefined;
    icon?: string | null | undefined;
}, {
    id: string;
    name: string;
    description?: string | null | undefined;
    icon?: string | null | undefined;
}>;
export declare const EventSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    categoryId: z.ZodString;
    organizationId: z.ZodString;
    creatorId: z.ZodString;
    startDate: z.ZodDate;
    endDate: z.ZodDate;
    locationName: z.ZodString;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    capacity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    providesCertificate: z.ZodDefault<z.ZodBoolean>;
    requirements: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    minimumAge: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    imageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    acceptsDonations: z.ZodDefault<z.ZodBoolean>;
    upiId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    minDonationAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    title: string;
    categoryId: string;
    organizationId: string;
    creatorId: string;
    startDate: Date;
    endDate: Date;
    locationName: string;
    latitude: number;
    longitude: number;
    providesCertificate: boolean;
    acceptsDonations: boolean;
    capacity?: number | null | undefined;
    requirements?: string | null | undefined;
    minimumAge?: number | null | undefined;
    imageUrl?: string | null | undefined;
    upiId?: string | null | undefined;
    minDonationAmount?: number | null | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    title: string;
    categoryId: string;
    organizationId: string;
    creatorId: string;
    startDate: Date;
    endDate: Date;
    locationName: string;
    latitude: number;
    longitude: number;
    capacity?: number | null | undefined;
    providesCertificate?: boolean | undefined;
    requirements?: string | null | undefined;
    minimumAge?: number | null | undefined;
    imageUrl?: string | null | undefined;
    acceptsDonations?: boolean | undefined;
    upiId?: string | null | undefined;
    minDonationAmount?: number | null | undefined;
}>;
export declare const CreateEventInputSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    categoryId: z.ZodString;
    organizationId: z.ZodString;
    startDate: z.ZodDate;
    endDate: z.ZodDate;
    locationName: z.ZodString;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    capacity: z.ZodOptional<z.ZodNumber>;
    providesCertificate: z.ZodDefault<z.ZodBoolean>;
    requirements: z.ZodOptional<z.ZodString>;
    minimumAge: z.ZodOptional<z.ZodNumber>;
    imageUrl: z.ZodOptional<z.ZodString>;
    acceptsDonations: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    upiId: z.ZodOptional<z.ZodString>;
    minDonationAmount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    description: string;
    title: string;
    categoryId: string;
    organizationId: string;
    startDate: Date;
    endDate: Date;
    locationName: string;
    latitude: number;
    longitude: number;
    providesCertificate: boolean;
    capacity?: number | undefined;
    requirements?: string | undefined;
    minimumAge?: number | undefined;
    imageUrl?: string | undefined;
    acceptsDonations?: boolean | undefined;
    upiId?: string | undefined;
    minDonationAmount?: number | undefined;
}, {
    description: string;
    title: string;
    categoryId: string;
    organizationId: string;
    startDate: Date;
    endDate: Date;
    locationName: string;
    latitude: number;
    longitude: number;
    capacity?: number | undefined;
    providesCertificate?: boolean | undefined;
    requirements?: string | undefined;
    minimumAge?: number | undefined;
    imageUrl?: string | undefined;
    acceptsDonations?: boolean | undefined;
    upiId?: string | undefined;
    minDonationAmount?: number | undefined;
}>;
export declare const EventRegistrationSchema: z.ZodObject<{
    id: z.ZodString;
    eventId: z.ZodString;
    userId: z.ZodString;
    status: z.ZodEnum<["ATTENDING", "WAITLISTED", "CHECKED_IN", "CANCELLED"]>;
    checkedInAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: "ATTENDING" | "WAITLISTED" | "CHECKED_IN" | "CANCELLED";
    eventId: string;
    userId: string;
    checkedInAt?: Date | null | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: "ATTENDING" | "WAITLISTED" | "CHECKED_IN" | "CANCELLED";
    eventId: string;
    userId: string;
    checkedInAt?: Date | null | undefined;
}>;
export declare const EventFeedbackSchema: z.ZodObject<{
    id: z.ZodString;
    eventId: z.ZodString;
    userId: z.ZodString;
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    eventId: string;
    userId: string;
    rating: number;
    comment?: string | null | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    eventId: string;
    userId: string;
    rating: number;
    comment?: string | null | undefined;
}>;
export declare const CreateFeedbackInputSchema: z.ZodObject<{
    eventId: z.ZodString;
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    eventId: string;
    rating: number;
    comment?: string | undefined;
}, {
    eventId: string;
    rating: number;
    comment?: string | undefined;
}>;
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
