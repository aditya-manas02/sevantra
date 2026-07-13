import express from 'express';
import { getPlatformStats } from '../controllers/publicController';

const router = express.Router();

router.get('/stats', getPlatformStats);

export default router;
