"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyRegistration = exports.submitFeedback = exports.checkInEvent = exports.rsvpEvent = void 0;
const database_1 = require("database");
const shared_1 = require("shared");
const rsvpEvent = async (req, res) => {
    try {
        const userId = req.user.id;
        const { eventId } = req.params;
        const event = await database_1.prisma.event.findUnique({
            where: { id: eventId },
            include: {
                _count: {
                    select: { registrations: { where: { status: { in: ['ATTENDING', 'CHECKED_IN'] } } } }
                }
            }
        });
        if (!event)
            return res.status(404).json({ error: 'Event not found' });
        const existing = await database_1.prisma.eventRegistration.findUnique({
            where: { eventId_userId: { eventId, userId } }
        });
        if (existing) {
            return res.status(400).json({ error: 'You are already registered for this event.' });
        }
        let status = 'ATTENDING';
        if (event.capacity && event._count.registrations >= event.capacity) {
            status = 'WAITLISTED';
        }
        const registration = await database_1.prisma.eventRegistration.create({
            data: {
                eventId,
                userId,
                status,
                checkInToken: crypto.randomUUID()
            }
        });
        res.status(201).json({ registration, message: status === 'WAITLISTED' ? 'Added to waitlist' : 'RSVP successful' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.rsvpEvent = rsvpEvent;
const checkInEvent = async (req, res) => {
    try {
        const adminId = req.user.id;
        const { eventId } = req.params;
        const { userId, token } = req.body;
        const event = await database_1.prisma.event.findUnique({ where: { id: eventId } });
        if (!event)
            return res.status(404).json({ error: 'Event not found' });
        // Verify admin is part of the org or is the event creator, or is PLATFORM_ADMIN
        const currentUser = req.user;
        const orgMember = await database_1.prisma.orgMember.findUnique({
            where: { userId_organizationId: { userId: adminId, organizationId: event.organizationId } }
        });
        if (!orgMember && event.creatorId !== adminId && currentUser.role !== 'PLATFORM_ADMIN') {
            return res.status(403).json({ error: `Unauthorized. adminId=${adminId}, creatorId=${event.creatorId}, orgId=${event.organizationId}` });
        }
        let registration;
        if (token) {
            registration = await database_1.prisma.eventRegistration.findFirst({
                where: { checkInToken: { startsWith: token.toLowerCase() } }
            });
            if (registration && registration.eventId !== eventId) {
                return res.status(400).json({ error: 'Invalid token for this event' });
            }
        }
        else if (userId) {
            registration = await database_1.prisma.eventRegistration.findUnique({
                where: { eventId_userId: { eventId, userId } }
            });
        }
        if (!registration)
            return res.status(404).json({ error: 'User is not registered for this event' });
        const targetUserId = registration.userId;
        const updated = await database_1.prisma.eventRegistration.update({
            where: { id: registration.id },
            data: {
                status: 'CHECKED_IN',
                checkedInAt: new Date()
            }
        });
        // Phase 5: Impact Tracking - Award Badges logic
        const completedEventsCount = await database_1.prisma.eventRegistration.count({
            where: { userId: targetUserId, status: 'CHECKED_IN' }
        });
        let newlyAwardedBadge = null;
        const checkAndAwardBadge = async (threshold, badgeName) => {
            if (completedEventsCount === threshold) {
                const badge = await database_1.prisma.badge.findUnique({ where: { name: badgeName } });
                if (badge) {
                    const existing = await database_1.prisma.userBadge.findUnique({
                        where: { userId_badgeId: { userId: targetUserId, badgeId: badge.id } }
                    });
                    if (!existing) {
                        await database_1.prisma.userBadge.create({
                            data: { userId: targetUserId, badgeId: badge.id }
                        });
                        newlyAwardedBadge = badge;
                    }
                }
            }
        };
        await checkAndAwardBadge(1, 'First Timer');
        await checkAndAwardBadge(5, 'Regular');
        await checkAndAwardBadge(10, 'Community Leader');
        res.status(200).json({ registration: updated, badgeAwarded: newlyAwardedBadge });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.checkInEvent = checkInEvent;
const submitFeedback = async (req, res) => {
    try {
        const userId = req.user.id;
        const { eventId } = req.params;
        const data = shared_1.CreateFeedbackInputSchema.parse({ ...req.body, eventId });
        // Only allow feedback if user was CHECKED_IN (or ATTENDING depending on rules, let's say CHECKED_IN)
        const registration = await database_1.prisma.eventRegistration.findUnique({
            where: { eventId_userId: { eventId, userId } }
        });
        if (!registration || registration.status !== 'CHECKED_IN') {
            return res.status(403).json({ error: 'You must attend and check-in to the event to leave feedback.' });
        }
        const feedback = await database_1.prisma.eventFeedback.create({
            data: {
                eventId,
                userId,
                rating: data.rating,
                comment: data.comment
            }
        });
        res.status(201).json({ feedback });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.submitFeedback = submitFeedback;
const getMyRegistration = async (req, res) => {
    try {
        const userId = req.user.id;
        const { eventId } = req.params;
        const registration = await database_1.prisma.eventRegistration.findUnique({
            where: { eventId_userId: { eventId, userId } }
        });
        if (!registration) {
            return res.status(404).json({ error: 'Not registered' });
        }
        res.status(200).json({ registration });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMyRegistration = getMyRegistration;
