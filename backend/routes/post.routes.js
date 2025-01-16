import express from 'express';
import protectRoutes from '../middlewares/auth.protectroutes.js';
import { createPost, deletePost, getFollowingPosts, getLikedPosts, getUserPosts, getPosts, likePost, commentOnPost } from '../controllers/post.controllers.js';

const router = express.Router()

router.get('/allPost', protectRoutes, getPosts)
router.get('/liked/:id', protectRoutes, getLikedPosts)
router.get('/user/:username', protectRoutes, getUserPosts)
router.get('/following', protectRoutes, getFollowingPosts)
router.post('/create', protectRoutes, createPost)
router.delete('/delete/:id', protectRoutes, deletePost)
router.post('/like/:id', protectRoutes, likePost)
router.post("/comment", protectRoutes, commentOnPost);

export default router;