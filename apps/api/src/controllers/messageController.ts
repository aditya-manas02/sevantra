import { Request, Response } from 'express';
import { prisma } from 'database';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const senderId = (req as any).user.id;
    const { receiverId, content } = req.body;

    if (!content || !receiverId) {
      return res.status(400).json({ error: 'Receiver and content are required' });
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId
      },
      include: {
        sender: { select: { firstName: true, lastName: true, avatarUrl: true } }
      }
    });

    res.status(201).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { otherUserId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    // Mark as read
    await prisma.message.updateMany({
      where: { senderId: otherUserId, receiverId: userId, isRead: false },
      data: { isRead: true }
    });

    res.status(200).json({ messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRecentChats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // Simple approach: get all users we have messages with
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
      }
    });

    const uniqueUsers = new Map();
    
    messages.forEach(msg => {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!uniqueUsers.has(otherUser.id)) {
        uniqueUsers.set(otherUser.id, {
          user: otherUser,
          lastMessage: msg.content,
          time: msg.createdAt,
          unread: msg.receiverId === userId && !msg.isRead ? 1 : 0
        });
      } else if (msg.receiverId === userId && !msg.isRead) {
        uniqueUsers.get(otherUser.id).unread += 1;
      }
    });

    res.status(200).json({ chats: Array.from(uniqueUsers.values()) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
