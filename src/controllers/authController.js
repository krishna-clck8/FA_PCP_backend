import authService from '../services/authService.js';
import ApiResponse from '../utils/ApiResponse.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return ApiResponse.success(res, result, 'User registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return ApiResponse.success(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user._id);
    return ApiResponse.success(res, user, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};
