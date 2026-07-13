import { Request, Response } from 'express';
import { prisma } from 'database';

export const getPlatformStats = async (req: Request, res: Response) => {
  try {
    const userCount = await prisma.user.count();
    const eventCount = await prisma.event.count();
    
    // For cities covered, we could do a distinct count on events or organizations
    // Let's count unique cities where events are happening or organizations are based.
    // To keep it fast, we can just return a baseline or do a query.
    // Let's do distinct cities from events.
    const uniqueCities = await prisma.event.findMany({
      select: { locationName: true },
      distinct: ['locationName'],
    });
    
    // Add 50 as a base just for marketing padding, or just return actual.
    // Since it's early, maybe just return actual if it's > 0, else return some baseline.
    const cityCount = uniqueCities.length;

    res.json({
      volunteers: userCount,
      events: eventCount,
      cities: cityCount,
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
