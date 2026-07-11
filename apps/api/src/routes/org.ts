import { Router } from 'express';
import { createOrganization, getOrganizations, getPendingOrganizations, verifyOrganization } from '../controllers/orgController';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/', getOrganizations);
router.post('/', authMiddleware, createOrganization);

// Admin routes
router.get('/pending', authMiddleware, requireRole(['PLATFORM_ADMIN']), getPendingOrganizations);
router.put('/:id/verify', authMiddleware, requireRole(['PLATFORM_ADMIN']), verifyOrganization);

export default router;
