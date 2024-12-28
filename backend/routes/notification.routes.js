import express from 'express';
import { deleteNotifications, getNotifications } from '../controllers/notification.controllers.js';
import protectRoutes from '../middlewares/auth.protectroutes.js';

const router = express.Router();

router.get('/', protectRoutes, getNotifications);
router.delete('/', protectRoutes, deleteNotifications);

export default router;