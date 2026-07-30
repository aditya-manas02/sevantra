import { Router } from 'express';
import { sendMessage, getConversation, getRecentChats } from '../controllers/messageController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/chats', authMiddleware, getRecentChats);
router.get('/:otherUserId', authMiddleware, getConversation);
router.post('/', authMiddleware, sendMessage);

export default router;
