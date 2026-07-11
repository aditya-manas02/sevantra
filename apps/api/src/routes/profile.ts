import { Router } from 'express';
import { getUserProfile, getOrgProfile, updateUserProfile } from '../controllers/profileController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/users/:userId', getUserProfile);
router.patch('/users/me', authMiddleware, updateUserProfile);
router.get('/orgs/:orgId', getOrgProfile);

export default router;
