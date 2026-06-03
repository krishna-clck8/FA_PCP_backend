import { Router } from 'express';
import { getIssueAnalytics, getProjectAnalytics, getDeveloperAnalytics } from '../controllers/analyticsController.js';
import authenticate from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/issues', getIssueAnalytics);
router.get('/projects', getProjectAnalytics);
router.get('/developers', getDeveloperAnalytics);

export default router;
