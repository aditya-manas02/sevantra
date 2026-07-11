import { Request, Response } from 'express';
import { prisma } from 'database';
import { CreateOrganizationInputSchema } from 'shared';

export const createOrganization = async (req: Request, res: Response) => {
  try {
    const data = CreateOrganizationInputSchema.parse(req.body);
    const userId = (req as any).user.id;
    
    const existing = await prisma.organization.findUnique({ where: { name: data.name } });
    if (existing) {
      return res.status(400).json({ error: 'Organization name already in use' });
    }

    const org = await prisma.organization.create({
      data: {
        name: data.name,
        type: data.type,
        description: data.description,
        website: data.website || null,
        verificationDocUrl: data.verificationDocUrl,
        verificationStatus: 'PENDING',
        members: {
          create: {
            userId: userId,
            role: 'ADMIN',
          }
        }
      }
    });

    res.status(201).json({ organization: org });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getOrganizations = async (req: Request, res: Response) => {
  try {
    const orgs = await prisma.organization.findMany({
      where: { verificationStatus: 'VERIFIED' }
    });
    res.status(200).json({ organizations: orgs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPendingOrganizations = async (req: Request, res: Response) => {
  try {
    const orgs = await prisma.organization.findMany({
      where: { verificationStatus: 'PENDING' }
    });
    res.status(200).json({ organizations: orgs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'VERIFIED' or 'REJECTED'

    if (status !== 'VERIFIED' && status !== 'REJECTED') {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const org = await prisma.organization.update({
      where: { id },
      data: { verificationStatus: status }
    });

    res.status(200).json({ organization: org });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
