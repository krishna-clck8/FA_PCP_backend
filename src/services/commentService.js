import Comment from '../models/Comment.js';
import Issue from '../models/Issue.js';
import ApiError from '../utils/ApiError.js';
import { generateId } from '../utils/helpers.js';

class CommentService {
  async create(data, userId) {
    const issue = await Issue.findById(data.issue);
    if (!issue) throw new ApiError(404, 'Issue not found');

    const commentId = generateId('CMT');
    const comment = await Comment.create({
      commentId,
      message: data.message,
      user: userId,
      issue: data.issue,
    });
    return comment.populate(['user', 'issue']);
  }

  async getByIssue(issueId, query) {
    const { page = 1, limit = 10 } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { issue: issueId };
    const [comments, total] = await Promise.all([
      Comment.find(filter)
        .populate('user', 'name email userId')
        .populate('issue', 'issueId title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Comment.countDocuments(filter),
    ]);

    return { comments, total };
  }

  async getAll(query) {
    const { page = 1, limit = 10 } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [comments, total] = await Promise.all([
      Comment.find()
        .populate('user', 'name email userId')
        .populate('issue', 'issueId title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Comment.countDocuments(),
    ]);

    return { comments, total };
  }

  async delete(id, userId) {
    const comment = await Comment.findById(id);
    if (!comment) throw new ApiError(404, 'Comment not found');
    if (comment.user.toString() !== userId) {
      throw new ApiError(403, 'You can only delete your own comments');
    }
    await Comment.findByIdAndDelete(id);
    return comment;
  }
}

export default new CommentService();
