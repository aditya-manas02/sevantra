import { Router } from 'express';
import { rsvpEvent, checkInEvent, submitFeedback, getMyRegistration } from '../controllers/registrationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/my/:eventId', authMiddleware, getMyRegistration);
router.post('/:eventId/rsvp', authMiddleware, rsvpEvent);
router.post('/:eventId/checkin', authMiddleware, checkInEvent);
router.post('/:eventId/feedback', authMiddleware, submitFeedback);

export default router;
