import { Router } from 'express';
import { createPost, listPosts } from '../controllers/feedController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', listPosts);
router.post('/', authMiddleware, createPost);

export default router;
