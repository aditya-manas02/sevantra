import { Request, Response } from 'express';
import { prisma } from 'database';
import { CreateEventInputSchema } from 'shared';

export const createEvent = async (req: Request, res: Response) => {
  try {
    const data = CreateEventInputSchema.parse(req.body);
    const userId = (req as any).user.id;
    
    let orgId = data.organizationId;
    
    // Check if the user is a member of the provided organization
    let orgMember = await prisma.orgMember.findUnique({
      where: {
        userId_organizationId: {
          userId: userId,
          organizationId: orgId
        }
      }
    });

    // If not a member (or if they sent a dummy ID), try to find ANY organization they belong to
    if (!orgMember) {
      orgMember = await prisma.orgMember.findFirst({
        where: { userId: userId }
      });
      
      // If they belong to no organizations, auto-create a Personal Organization for them
      if (!orgMember) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const newOrg = await prisma.organization.create({
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
      } else {
        orgId = orgMember.organizationId;
      }
    }

    const event = await prisma.event.create({
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
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        category: true,
        organization: true,
        _count: {
          select: { registrations: { where: { status: { in: ['ATTENDING', 'CHECKED_IN'] } } } }
        }
      }
    });

    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.status(200).json({ event });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius, categoryId } = req.query;

    if (lat && lng && radius) {
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const radiusMiles = parseFloat(radius as string);

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

      const events = await prisma.$queryRawUnsafe(query);
      return res.status(200).json({ events });
    }

    // Fallback simple list
    const filter: any = {};
    if (categoryId) filter.categoryId = categoryId;

    const events = await prisma.event.findMany({
      where: filter,
      orderBy: { startDate: 'asc' },
      take: 50
    });

    res.status(200).json({ events });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getEventCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.eventCategory.findMany();
    res.status(200).json({ categories });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createEventCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const category = await prisma.eventCategory.create({
      data: {
        name,
        description: description || 'User created category',
      }
    });
    res.status(201).json({ category });
  } catch (error: any) {
    // Handle unique constraint failure if category already exists
    if (error.code === 'P2002') {
       const existing = await prisma.eventCategory.findUnique({ where: { name } });
       return res.status(200).json({ category: existing });
    }
    res.status(500).json({ error: error.message });
  }
};

export const getMyHostedEvents = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const events = await prisma.event.findMany({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = (req as any).user.id;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { organization: { include: { members: true } } }
    });

    if (!event) return res.status(404).json({ error: 'Event not found' });

    const isCreator = event.creatorId === userId;
    const isOrgAdmin = event.organization.members.some((m: any) => m.userId === userId && m.role === 'ADMIN');

    if (!isCreator && !isOrgAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }

    await prisma.event.delete({ where: { id: eventId } });
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
