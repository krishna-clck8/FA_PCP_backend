import datasetSyncService from '../dataset/syncService.js';
import User from '../models/User.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getDataset = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [records, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(),
    ]);
    return ApiResponse.paginated(res, records, total, parseInt(page), parseInt(limit));
  } catch (error) {
    next(error);
  }
};

export const syncDataset = async (req, res, next) => {
  try {
    const report = await datasetSyncService.sync();
    return ApiResponse.success(res, report, 'Dataset synchronized successfully');
  } catch (error) {
    next(error);
  }
};
