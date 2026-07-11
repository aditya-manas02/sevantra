import { Router } from 'express';
import { getPlatformStats } from '../controllers/adminController';
import { verifyOrganization } from '../controllers/orgController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = Router();

router.get('/stats', authMiddleware, adminMiddleware, getPlatformStats);
router.patch('/organizations/:id/verify', authMiddleware, adminMiddleware, verifyOrganization);

export default router;
