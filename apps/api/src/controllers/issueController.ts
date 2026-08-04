import { Request, Response } from 'express';
import { prisma } from 'database';

export const createIssue = async (req: Request, res: Response) => {
  try {
    const { title, description, category, latitude, longitude, locationName, imageUrl } = req.body;
    const userId = (req as any).user.id;

    if (!title || !description || latitude === undefined || longitude === undefined || !locationName) {
      return res.status(400).json({ error: 'Title, description, location name, and coordinates are required.' });
    }

    const issue = await prisma.civicIssue.create({
      data: {
        title,
        description,
        category: category || 'OTHER',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        locationName,
        imageUrl: imageUrl || null,
        reporterId: userId
      },
      include: {
        reporter: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } }
      }
    });

    res.status(201).json({ issue });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getIssues = async (req: Request, res: Response) => {
  try {
    const { status, category } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const issues = await prisma.civicIssue.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        resolver: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
      }
    });

    res.status(200).json({ issues });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateIssueStatus = async (req: Request, res: Response) => {
  try {
    const { issueId } = req.params;
    const { status, resolutionImageUrl } = req.body;
    const userId = (req as any).user.id;

    if (!['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid issue status.' });
    }

    const data: any = { status };
    if (status === 'RESOLVED') {
      data.resolverId = userId;
      if (resolutionImageUrl) data.resolutionImageUrl = resolutionImageUrl;
    }

    const issue = await prisma.civicIssue.update({
      where: { id: issueId },
      data,
      include: {
        reporter: { select: { firstName: true, lastName: true } },
        resolver: { select: { firstName: true, lastName: true } }
      }
    });

    res.status(200).json({ issue });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
