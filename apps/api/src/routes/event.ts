import { Router } from 'express';
import { createEvent, getEvents, getEventCategories, createEventCategory, getEventById, getMyHostedEvents, deleteEvent } from '../controllers/eventController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/categories', getEventCategories);
router.post('/categories', authMiddleware, createEventCategory);
router.get('/my/hosted', authMiddleware, getMyHostedEvents);
router.get('/:eventId', getEventById);
router.get('/', getEvents);
router.post('/', authMiddleware, createEvent);
router.delete('/:eventId', authMiddleware, deleteEvent);

export default router;
