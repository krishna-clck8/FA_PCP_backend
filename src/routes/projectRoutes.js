import { Router } from 'express';
import { createProject, getAllProjects, getProjectById, updateProject, deleteProject } from '../controllers/projectController.js';
import authenticate from '../middlewares/authenticate.js';
import validate from '../middlewares/validate.js';
import { CreateProjectSchema, UpdateProjectSchema } from '../schemas/index.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(CreateProjectSchema), createProject);
router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.patch('/:id', validate(UpdateProjectSchema), updateProject);
router.delete('/:id', deleteProject);

export default router;
