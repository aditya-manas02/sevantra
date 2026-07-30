import { Router } from 'express';
import { createTeam, joinTeam, leaveTeam, listTeams, getLeaderboard, getMyTeams } from '../controllers/teamController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', listTeams);
router.get('/leaderboard', getLeaderboard);
router.get('/my', authMiddleware, getMyTeams);
router.post('/', authMiddleware, createTeam);
router.post('/join', authMiddleware, joinTeam);
router.delete('/:teamId/leave', authMiddleware, leaveTeam);

export default router;
