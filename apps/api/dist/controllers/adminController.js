"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatformStats = void 0;
const database_1 = require("database");
const getPlatformStats = async (req, res) => {
    try {
        const totalUsers = await database_1.prisma.user.count();
        const totalOrgs = await database_1.prisma.organization.count();
        const totalEvents = await database_1.prisma.event.count();
        const totalRegistrations = await database_1.prisma.eventRegistration.count();
        const recentEvents = await database_1.prisma.event.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { organization: true }
        });
        const pendingOrgs = await database_1.prisma.organization.findMany({
            where: { verificationStatus: 'PENDING' },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({
            stats: { totalUsers, totalOrgs, totalEvents, totalRegistrations },
            recentEvents,
            pendingOrgs
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getPlatformStats = getPlatformStats;
