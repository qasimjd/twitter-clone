import express from 'express';

import { login, logout, signup, checkAuth } from '../controllers/auth.controllers.js';
import protectRoutes from '../middlewares/auth.protectroutes.js';

const router = express.Router();

router.post("/signup", signup);
router.post('/login', login);
router.post('/logout', logout);

router.get('/check', protectRoutes, checkAuth);

export default router;