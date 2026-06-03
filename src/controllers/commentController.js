import commentService from '../services/commentService.js';
import ApiResponse from '../utils/ApiResponse.js';

export const createComment = async (req, res, next) => {
  try {
    const comment = await commentService.create(req.body, req.user._id);
    return ApiResponse.success(res, comment, 'Comment created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getCommentsByIssue = async (req, res, next) => {
  try {
    const { comments, total } = await commentService.getByIssue(req.params.issueId, req.query);
    return ApiResponse.paginated(res, comments, total, parseInt(req.query.page || 1), parseInt(req.query.limit || 10));
  } catch (error) {
    next(error);
  }
};

export const getAllComments = async (req, res, next) => {
  try {
    const { comments, total } = await commentService.getAll(req.query);
    return ApiResponse.paginated(res, comments, total, parseInt(req.query.page || 1), parseInt(req.query.limit || 10));
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await commentService.delete(req.params.id, req.user._id);
    return ApiResponse.success(res, comment, 'Comment deleted successfully');
  } catch (error) {
    next(error);
  }
};
