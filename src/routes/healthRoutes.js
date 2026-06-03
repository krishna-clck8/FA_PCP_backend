import { Router } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Issue from '../models/Issue.js';
import Project from '../models/Project.js';
import Comment from '../models/Comment.js';
import ApiResponse from '../utils/ApiResponse.js';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const isConnected = dbState === 1;

    let documentCount = 0;
    if (isConnected) {
      const [users, issues, projects, comments] = await Promise.all([
        User.countDocuments(),
        Issue.countDocuments(),
        Project.countDocuments(),
        Comment.countDocuments(),
      ]);
      documentCount = users + issues + projects + comments;
    }

    return ApiResponse.success(res, {
      database: isConnected ? 'connected' : 'disconnected',
      documentCount,
    }, 'Database connected successfully');
  } catch (error) {
    return ApiResponse.success(res, {
      database: 'disconnected',
      documentCount: 0,
    }, 'Database connection check failed');
  }
});

export default router;
