import express from 'express';
import protectRoutes from '../middlewares/auth.protectroutes.js';
import { createPoat, deletePoat, getFollowingPosts, getLikedPosts, getUserPosts, getPosts, likePost } from '../controllers/post.controllers.js';

const router = express.Router()

router.get('/posts', protectRoutes, getPosts)
router.get('/liked/:id', protectRoutes, getLikedPosts)
router.get('/user/:username', protectRoutes, getUserPosts)
router.get('/following', protectRoutes, getFollowingPosts)
router.post('/create', protectRoutes, createPoat)
router.delete('/delete/:id', protectRoutes, deletePoat)
router.post('/like/:id', protectRoutes, likePost)

export default router;