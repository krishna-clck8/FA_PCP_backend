import { Router } from 'express';
import { createComment, getCommentsByIssue, getAllComments, deleteComment } from '../controllers/commentController.js';
import authenticate from '../middlewares/authenticate.js';
import validate from '../middlewares/validate.js';
import { CreateCommentSchema } from '../schemas/index.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(CreateCommentSchema), createComment);
router.get('/', getAllComments);
router.get('/:issueId', getCommentsByIssue);
router.delete('/:id', deleteComment);

export default router;
