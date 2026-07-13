import { Router } from 'express';
import { register, login, me, logout, verifyEmail, googleLogin } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', authMiddleware, me);
router.post('/logout', logout);

export default router;
