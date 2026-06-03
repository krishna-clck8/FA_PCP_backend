import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import authenticate from '../middlewares/authenticate.js';
import validate from '../middlewares/validate.js';
import { RegisterUserSchema, LoginSchema } from '../schemas/index.js';

const router = Router();

router.post('/register', validate(RegisterUserSchema), register);
router.post('/login', validate(LoginSchema), login);
router.get('/me', authenticate, getMe);

export default router;
