import { Request, Response } from 'express';
import { prisma } from 'database';

export const createPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { content, imageUrl } = req.body;

    if (!content) return res.status(400).json({ error: 'Post content is required' });

    const post = await prisma.post.create({
      data: {
        content,
        imageUrl,
        userId
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, avatarUrl: true }
        }
      }
    });

    res.status(201).json({ post });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const listPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: { firstName: true, lastName: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.status(200).json({ posts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
