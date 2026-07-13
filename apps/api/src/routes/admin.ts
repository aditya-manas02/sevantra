import { Router } from 'express';
import { getPlatformStats, getUsers, getOrganizations } from '../controllers/adminController';
import { verifyOrganization } from '../controllers/orgController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = Router();

router.get('/stats', authMiddleware, adminMiddleware, getPlatformStats);
router.get('/users', authMiddleware, adminMiddleware, getUsers);
router.get('/organizations', authMiddleware, adminMiddleware, getOrganizations);
router.patch('/organizations/:id/verify', authMiddleware, adminMiddleware, verifyOrganization);

export default router;
