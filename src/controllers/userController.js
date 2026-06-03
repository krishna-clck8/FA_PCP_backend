import userService from '../services/userService.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const { users, total } = await userService.getAll(req.query);
    return ApiResponse.paginated(res, users, total, parseInt(req.query.page || 1), parseInt(req.query.limit || 10));
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getById(req.params.id);
    return ApiResponse.success(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.update(req.params.id, req.body);
    return ApiResponse.success(res, user, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await userService.delete(req.params.id);
    return ApiResponse.success(res, user, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};
