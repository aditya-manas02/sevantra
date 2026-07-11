"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.getMyHostedEvents = exports.createEventCategory = exports.getEventCategories = exports.getEvents = exports.getEventById = exports.createEvent = void 0;
const database_1 = require("database");
const shared_1 = require("shared");
const createEvent = async (req, res) => {
    try {
        const data = shared_1.CreateEventInputSchema.parse(req.body);
        const userId = req.user.id;
        let orgId = data.organizationId;
        // Check if the user is a member of the provided organization
        let orgMember = await database_1.prisma.orgMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: userId,
                    organizationId: orgId
                }
            }
        });
        // If not a member (or if they sent a dummy ID), try to find ANY organization they belong to
        if (!orgMember) {
            orgMember = await database_1.prisma.orgMember.findFirst({
                where: { userId: userId }
            });
            // If they belong to no organizations, auto-create a Personal Organization for them
            if (!orgMember) {
                const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
                const newOrg = await database_1.prisma.organization.create({
                    data: {
                        name: `${user?.firstName || 'Community'}s Organization ${Date.now().toString().slice(-4)}`,
                        description: 'Personal organization for community events.',
                        type: 'COMMUNITY',
                        members: {
                            create: {
                                userId: userId,
                                role: 'ADMIN'
                            }
                        }
                    }
                });
                orgId = newOrg.id;
            }
            else {
                orgId = orgMember.organizationId;
            }
        }
        const event = await database_1.prisma.event.create({
            data: {
                title: data.title,
                description: data.description,
                categoryId: data.categoryId,
                organizationId: orgId,
                creatorId: userId,
                startDate: data.startDate,
                endDate: data.endDate,
                locationName: data.locationName,
                latitude: data.latitude,
                longitude: data.longitude,
                capacity: data.capacity,
                providesCertificate: data.providesCertificate,
                requirements: data.requirements,
                minimumAge: data.minimumAge,
                imageUrl: data.imageUrl,
                acceptsDonations: data.acceptsDonations || false,
                upiId: data.upiId,
                minDonationAmount: data.minDonationAmount,
            }
        });
        res.status(201).json({ event });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createEvent = createEvent;
const getEventById = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await database_1.prisma.event.findUnique({
            where: { id: eventId },
            include: {
                category: true,
                organization: true,
                _count: {
                    select: { registrations: { where: { status: { in: ['ATTENDING', 'CHECKED_IN'] } } } }
                }
            }
        });
        if (!event)
            return res.status(404).json({ error: 'Event not found' });
        res.status(200).json({ event });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getEventById = getEventById;
const getEvents = async (req, res) => {
    try {
        const { lat, lng, radius, categoryId } = req.query;
        if (lat && lng && radius) {
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lng);
            const radiusMiles = parseFloat(radius);
            let categoryFilter = '';
            if (categoryId) {
                // Prevent SQL injection by strictly typing categoryId
                const parsedCategory = String(categoryId).replace(/[^a-zA-Z0-9-]/g, '');
                categoryFilter = `AND "categoryId" = '${parsedCategory}'`;
            }
            // Use earthdistance (point <@> point returns miles)
            const query = `
        SELECT e.*, 
               (point(e.longitude, e.latitude) <@> point(${longitude}, ${latitude})) as distance 
        FROM "Event" e
        WHERE (point(e.longitude, e.latitude) <@> point(${longitude}, ${latitude})) <= ${radiusMiles}
        ${categoryFilter}
        ORDER BY distance ASC
        LIMIT 50;
      `;
            const events = await database_1.prisma.$queryRawUnsafe(query);
            return res.status(200).json({ events });
        }
        // Fallback simple list
        const filter = {};
        if (categoryId)
            filter.categoryId = categoryId;
        const events = await database_1.prisma.event.findMany({
            where: filter,
            orderBy: { startDate: 'asc' },
            take: 50
        });
        res.status(200).json({ events });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getEvents = getEvents;
const getEventCategories = async (req, res) => {
    try {
        const categories = await database_1.prisma.eventCategory.findMany();
        res.status(200).json({ categories });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getEventCategories = getEventCategories;
const createEventCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name)
            return res.status(400).json({ error: 'Category name is required' });
        const category = await database_1.prisma.eventCategory.create({
            data: {
                name,
                description: description || 'User created category',
            }
        });
        res.status(201).json({ category });
    }
    catch (error) {
        // Handle unique constraint failure if category already exists
        if (error.code === 'P2002') {
            const categoryName = String(name);
            const existing = await database_1.prisma.eventCategory.findUnique({ where: { name: categoryName } });
            return res.status(200).json({ category: existing });
        }
        res.status(500).json({ error: error.message });
    }
};
exports.createEventCategory = createEventCategory;
const getMyHostedEvents = async (req, res) => {
    try {
        const userId = req.user.id;
        const events = await database_1.prisma.event.findMany({
            where: {
                OR: [
                    { creatorId: userId },
                    {
                        organization: {
                            members: {
                                some: {
                                    userId: userId,
                                    role: 'ADMIN'
                                }
                            }
                        }
                    }
                ]
            },
            include: {
                category: true,
                organization: true,
                _count: {
                    select: { registrations: { where: { status: { in: ['ATTENDING', 'CHECKED_IN'] } } } }
                }
            },
            orderBy: { startDate: 'desc' }
        });
        res.status(200).json({ events });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMyHostedEvents = getMyHostedEvents;
const deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;
        const event = await database_1.prisma.event.findUnique({
            where: { id: eventId },
            include: { organization: { include: { members: true } } }
        });
        if (!event)
            return res.status(404).json({ error: 'Event not found' });
        const isCreator = event.creatorId === userId;
        const isOrgAdmin = event.organization.members.some((m) => m.userId === userId && m.role === 'ADMIN');
        if (!isCreator && !isOrgAdmin) {
            return res.status(403).json({ error: 'Not authorized to delete this event' });
        }
        await database_1.prisma.event.delete({ where: { id: eventId } });
        res.status(200).json({ message: 'Event deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteEvent = deleteEvent;
