import Issue from '../models/Issue.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

class AnalyticsService {
  async getIssueAnalytics() {
    const [totalIssues, openIssues, resolvedIssues, closedIssues] = await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ status: 'open' }),
      Issue.countDocuments({ status: 'resolved' }),
      Issue.countDocuments({ status: 'closed' }),
    ]);

    return { totalIssues, openIssues, resolvedIssues, closedIssues };
  }

  async getProjectAnalytics() {
    const result = await Issue.aggregate([
      {
        $group: {
          _id: '$project',
          totalIssues: { $sum: 1 },
          openIssues: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
          closedIssues: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'project',
        },
      },
      { $unwind: '$project' },
      {
        $project: {
          _id: 1,
          projectId: '$project.projectId',
          title: '$project.title',
          totalIssues: 1,
          openIssues: 1,
          closedIssues: 1,
        },
      },
    ]);

    return result;
  }

  async getDeveloperAnalytics() {
    const result = await Issue.aggregate([
      { $match: { assignedTo: { $ne: null }, status: { $in: ['resolved', 'closed'] } } },
      {
        $group: {
          _id: '$assignedTo',
          resolvedIssues: { $sum: 1 },
          avgResolutionTime: {
            $avg: { $subtract: ['$updatedAt', '$createdAt'] },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'developer',
        },
      },
      { $unwind: '$developer' },
      {
        $project: {
          _id: 1,
          userId: '$developer.userId',
          name: '$developer.name',
          email: '$developer.email',
          resolvedIssues: 1,
          averageResolutionTime: {
            $round: [{ $divide: ['$avgResolutionTime', 1000 * 60 * 60] }, 1],
          },
        },
      },
      { $sort: { resolvedIssues: -1 } },
    ]);

    let highestResolvedIssueCount = 0;
    if (result.length > 0) {
      highestResolvedIssueCount = result[0].resolvedIssues;
    }

    return {
      developers: result,
      highestResolvedIssueCount,
    };
  }
}

export default new AnalyticsService();
