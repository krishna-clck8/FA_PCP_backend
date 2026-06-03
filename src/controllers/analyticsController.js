import analyticsService from '../services/analyticsService.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getIssueAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getIssueAnalytics();
    return ApiResponse.success(res, data, 'Issue analytics retrieved');
  } catch (error) {
    next(error);
  }
};

export const getProjectAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getProjectAnalytics();
    return ApiResponse.success(res, data, 'Project analytics retrieved');
  } catch (error) {
    next(error);
  }
};

export const getDeveloperAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getDeveloperAnalytics();
    return ApiResponse.success(res, data, 'Developer analytics retrieved');
  } catch (error) {
    next(error);
  }
};
