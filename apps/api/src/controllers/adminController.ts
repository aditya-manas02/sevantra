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

    // Calculate 7-day activity data (user signups)
    const activityData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      
      const count = await prisma.user.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });
      
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][startOfDay.getDay()];
      activityData.push({ name: dayName, active: count });
    }

    res.status(200).json({
      stats: { totalUsers, totalOrgs, totalEvents, totalRegistrations },
      recentEvents,
      pendingOrgs,
      activityData
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      }
    });
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrganizations = async (req: Request, res: Response) => {
  try {
    const organizations = await prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { members: true, events: true }
        }
      }
    });
    res.status(200).json(organizations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    const updatedOrg = await prisma.organization.update({
      where: { id },
      data: { verificationStatus: status }
    });

    res.status(200).json(updatedOrg);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
