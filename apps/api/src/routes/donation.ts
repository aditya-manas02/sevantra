import { Router } from 'express';
import { createCheckoutSession, handleStripeWebhook } from '../controllers/donationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/checkout', authMiddleware, createCheckoutSession);
// Note: Webhook needs raw body, but for simplicity we rely on standard parsing or handle it specially if needed
router.post('/webhook', handleStripeWebhook);

export default router;
