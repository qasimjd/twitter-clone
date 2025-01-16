import express from 'express';
import { followUnfollowUser, getFollowers, getFollowings, getProfile, grtsugestedUsers, updateProfile } from '../controllers/user.controllers.js';
import protectRoutes from '../middlewares/auth.protectroutes.js';

const router = express.Router();

router.get('/profile/:username', protectRoutes, getProfile);
router.post('/follow-unfollow/:id', protectRoutes, followUnfollowUser);
router.get('/sugested', protectRoutes, grtsugestedUsers);
router.post('/update-profile', protectRoutes, updateProfile);

// Get followers
router.get("/followers/:userId", getFollowers);

// Get followings
router.get("/followings/:userId", getFollowings);

export default router;