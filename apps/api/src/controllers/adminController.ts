import { Request, Response } from 'express';
import { prisma } from 'database';

export const getPlatformStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalOrgs = await prisma.organization.count();
    const totalEvents = await prisma.event.count();
    const totalRegistrations = await prisma.eventRegistration.count();
    const totalPosts = await prisma.post.count();
    const totalTeams = await prisma.team.count();

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
      stats: { totalUsers, totalOrgs, totalEvents, totalRegistrations, totalPosts, totalTeams },
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
        isBanned: true,
        isEmailVerified: true,
        createdAt: true,
        _count: {
          select: { registrations: true, createdEvents: true }
        }
      }
    });
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminId = (req as any).user.id;

    if (id === adminId && role !== 'PLATFORM_ADMIN') {
      return res.status(400).json({ error: 'You cannot demote your own admin account.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role }
    });

    res.status(200).json({ message: 'User role updated successfully', user: updatedUser });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const toggleUserBan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user.id;

    if (id === adminId) {
      return res.status(400).json({ error: 'You cannot ban your own account.' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isBanned: !user.isBanned }
    });

    res.status(200).json({ message: `User ${updatedUser.isBanned ? 'banned' : 'unbanned'} successfully`, user: updatedUser });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user.id;

    if (id === adminId) {
      return res.status(400).json({ error: 'You cannot delete your own admin account.' });
    }

    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
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

export const getAdminEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        organization: { select: { name: true } },
        category: { select: { name: true } },
        _count: { select: { registrations: true } }
      }
    });
    res.status(200).json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleEventFeatured = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { isFeatured: !event.isFeatured }
    });

    res.status(200).json({ message: 'Event featured status updated', event: updatedEvent });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.event.delete({ where: { id } });
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAdminPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } }
      }
    });
    res.status(200).json(posts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.post.delete({ where: { id } });
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
