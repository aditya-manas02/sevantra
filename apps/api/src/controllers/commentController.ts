import { Request, Response } from 'express';
import { prisma } from 'database';

export const getComments = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const comments = await prisma.eventComment.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ comments });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const postComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { eventId } = req.params;
    const { content, mediaUrl } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }

    const comment = await prisma.eventComment.create({
      data: {
        content,
        mediaUrl,
        eventId,
        userId
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
      }
    });

    res.status(201).json({ comment });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
