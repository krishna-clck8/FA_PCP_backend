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
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      'https://fa-pcp-frontend-g5im.vercel.app',
      'https://fa-pcp-frontend-01.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests
app.use(express.json());

//serve frontend static files (if they exist)
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '../../frontend/dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('/', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // If frontend not built, just return API message
  app.get('/', (req, res) => {
    res.json({ message: 'BugTracker API Server', version: '1.0.0' });
  });
}

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', datasetRoutes);
app.use('/api', healthRoutes);

//catch-all for 404s
app.use((req, res) => {
  res.status(404).json({ message: 'Not found', path: req.path });
});

app.use(errorHandler);

//export the app for use in the server.js file

export default app;
