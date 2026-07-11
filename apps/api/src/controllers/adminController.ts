import { Request, Response } from 'express';
import { prisma } from 'database';

export const getPlatformStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalOrgs = await prisma.organization.count();
    const totalEvents = await prisma.event.count();
    const totalRegistrations = await prisma.eventRegistration.count();

    const recentEvents = await prisma.event.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { organization: true }
    });

    const pendingOrgs = await prisma.organization.findMany({
      where: { verificationStatus: 'PENDING' },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      stats: { totalUsers, totalOrgs, totalEvents, totalRegistrations },
      recentEvents,
      pendingOrgs
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
