//import the necessary libraries for the express app
import express from 'express';
import cors from 'cors';

//import the backend routes aand middlewares for the express app
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import datasetRoutes from './routes/datasetRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import errorHandler from './middlewares/errorHandler.js';

//initalize express app
const app = express();

//use middlewares for the app
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', datasetRoutes);
app.use('/api', healthRoutes);
app.use(errorHandler);

//export the app for use in the server.js file

export default app;
