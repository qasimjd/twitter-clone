import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';


import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';
import notificationRoutes from './routes/notification.routes.js';

import connectDB from './lib/db.js';
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notification", notificationRoutes);

app.listen(port, () => {
    connectDB();
    console.log(`Server is running on http://localhost:${port}`);
});