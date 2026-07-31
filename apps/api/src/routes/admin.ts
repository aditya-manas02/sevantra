import { Router } from 'express';
import { 
  getPlatformStats, 
  getUsers, 
  updateUserRole, 
  toggleUserBan, 
  deleteUser, 
  getOrganizations, 
  verifyOrganization, 
  getAdminEvents, 
  toggleEventFeatured, 
  deleteEvent, 
  getAdminPosts, 
  deletePost 
} from '../controllers/adminController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = Router();

// Stats
router.get('/stats', authMiddleware, adminMiddleware, getPlatformStats);

// User Management
router.get('/users', authMiddleware, adminMiddleware, getUsers);
router.patch('/users/:id/role', authMiddleware, adminMiddleware, updateUserRole);
router.patch('/users/:id/ban', authMiddleware, adminMiddleware, toggleUserBan);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);

// Organization Management
router.get('/organizations', authMiddleware, adminMiddleware, getOrganizations);
router.patch('/organizations/:id/verify', authMiddleware, adminMiddleware, verifyOrganization);

// Event Governance
router.get('/events', authMiddleware, adminMiddleware, getAdminEvents);
router.patch('/events/:id/feature', authMiddleware, adminMiddleware, toggleEventFeatured);
router.delete('/events/:id', authMiddleware, adminMiddleware, deleteEvent);

// Content Moderation
router.get('/posts', authMiddleware, adminMiddleware, getAdminPosts);
router.delete('/posts/:id', authMiddleware, adminMiddleware, deletePost);

export default router;
