import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { generateId } from '../utils/helpers.js';

class AuthService {
  async register({ name, email, password, role, department }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    const userId = generateId('USR');
    const user = await User.create({
      userId,
      name,
      email,
      password,
      role: role || 'manager',
      department: department || 'General',
    });

    const token = user.generateToken();
    const userObj = user.toJSON();
    delete userObj.password;

    return { user: userObj, token };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (user.status === 'inactive') {
      throw new ApiError(403, 'Account is inactive');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = user.generateToken();
    const userObj = user.toJSON();

    return { user: userObj, token };
  }

  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }
}

export default new AuthService();
