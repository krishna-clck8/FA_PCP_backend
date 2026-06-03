import { Router } from 'express';
import { getDataset, syncDataset } from '../controllers/datasetController.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';

const router = Router();

router.get('/dataset', authenticate, getDataset);
router.post('/sync', authenticate, authorize('admin', 'manager'), syncDataset);

export default router;
