import { Router } from 'express';
import { getComments, postComment } from '../controllers/commentController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/:eventId/comments', getComments);
router.post('/:eventId/comments', authMiddleware, postComment);

export default router;
