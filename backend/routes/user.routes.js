import express from 'express';
import { followUnfollowUser, getProfile, grtsugestedUsers, updateProfile } from '../controllers/user.controllers.js';
import protectRoutes from '../middlewares/auth.protectroutes.js';

const router = express.Router();

router.get('/profile/:username', protectRoutes, getProfile);
router.post('/follow/:id', protectRoutes, followUnfollowUser);
router.get('/sugested', protectRoutes, grtsugestedUsers);
router.post('/update-profile', protectRoutes, updateProfile);

export default router;