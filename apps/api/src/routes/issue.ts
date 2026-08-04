import { Router } from 'express';
import { createIssue, getIssues, updateIssueStatus } from '../controllers/issueController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, createIssue);
router.get('/', getIssues);
router.patch('/:issueId/status', authMiddleware, updateIssueStatus);

export default router;
