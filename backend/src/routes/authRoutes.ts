import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/auth/register', register);              // Public
router.post('/auth/login', login);                    // Public
router.get('/auth/me', authenticate, getCurrentUser); // Protected

export default router;