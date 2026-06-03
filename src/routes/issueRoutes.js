import { Router } from 'express';
import {
  createIssue, getAllIssues, getIssueById, updateIssue, deleteIssue,
  assignIssue, updateIssueStatus
} from '../controllers/issueController.js';
import authenticate from '../middlewares/authenticate.js';
import validate from '../middlewares/validate.js';
import {
  CreateIssueSchema, UpdateIssueSchema, AssignIssueSchema, UpdateIssueStatusSchema
} from '../schemas/index.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(CreateIssueSchema), createIssue);
router.get('/', getAllIssues);
router.get('/:id', getIssueById);
router.patch('/:id', validate(UpdateIssueSchema), updateIssue);
router.delete('/:id', deleteIssue);
router.patch('/:id/assign', validate(AssignIssueSchema), assignIssue);
router.patch('/:id/status', validate(UpdateIssueStatusSchema), updateIssueStatus);

export default router;
