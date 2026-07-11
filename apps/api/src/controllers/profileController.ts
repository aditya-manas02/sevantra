import { Request, Response } from 'express';
import { prisma } from 'database';

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
        bio: true,
        phoneNumber: true,
        locationCity: true,
        skills: true,
        badges: {
          include: { badge: true }
        },
        registrations: {
          where: { status: 'CHECKED_IN' },
          include: { 
            event: {
              include: { category: true }
            } 
          }
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Calculate hours and impact distribution
    let totalHours = 0;
    const categoryCounts: Record<string, number> = {};
    const totalEvents = user.registrations.length;

    user.registrations.forEach(r => {
      const start = new Date(r.event.startDate).getTime();
      const end = new Date(r.event.endDate).getTime();
      const diffHrs = (end - start) / (1000 * 60 * 60);
      totalHours += diffHrs;

      const catName = r.event.category.name;
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    });

    const colors = ['#D95D39', '#2A5A4A', '#E8A343', '#2EC4B6', '#FF9F1C'];
    const impactDistribution = totalEvents === 0 ? [] : Object.entries(categoryCounts).map(([name, count], index) => ({
      name,
      value: Math.round((count / totalEvents) * 100),
      color: colors[index % colors.length]
    })).sort((a, b) => b.value - a.value);

    res.status(200).json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        phoneNumber: user.phoneNumber,
        locationCity: user.locationCity,
        skills: user.skills,
        badges: user.badges.map(b => b.badge),
        stats: {
          eventsAttended: totalEvents,
          totalHours: Math.round(totalHours * 10) / 10
        },
        impactDistribution,
        recentEvents: user.registrations.map(r => r.event).slice(0, 5)
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id; // auth middleware sets req.user to the full user object
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { firstName, lastName, bio, phoneNumber, locationCity, skills } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        bio,
        phoneNumber,
        locationCity,
        skills
      }
    });

    res.status(200).json({ user: updatedUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrgProfile = async (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        events: {
          include: {
            _count: {
              select: { registrations: { where: { status: 'CHECKED_IN' } } }
            }
          }
        }
      }
    });

    if (!org) return res.status(404).json({ error: 'Organization not found' });

    // Aggregate impact
    let totalVolunteers = 0;
    let totalHours = 0;

    org.events.forEach(e => {
      const start = new Date(e.startDate).getTime();
      const end = new Date(e.endDate).getTime();
      const diffHrs = (end - start) / (1000 * 60 * 60);
      
      const volunteers = e._count.registrations;
      totalVolunteers += volunteers;
      totalHours += volunteers * diffHrs;
    });

    res.status(200).json({
      organization: {
        id: org.id,
        name: org.name,
        description: org.description,
        stats: {
          eventsHosted: org.events.length,
          totalVolunteers,
          totalImpactHours: Math.round(totalHours * 10) / 10
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
