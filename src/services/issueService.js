import Issue from '../models/Issue.js';
import ApiError from '../utils/ApiError.js';
import { generateId } from '../utils/helpers.js';
import { VALID_TRANSITIONS } from '../config/constants.js';

class IssueService {
  async create(data, reporterId) {
    const issueId = generateId('ISS');
    const issue = await Issue.create({
      issueId,
      title: data.title,
      description: data.description || '',
      project: data.project,
      assignedTo: data.assignedTo || null,
      reportedBy: reporterId,
      priority: data.priority || 'medium',
      severity: data.severity || 'major',
      status: 'open',
    });
    return issue.populate(['project', 'assignedTo', 'reportedBy']);
  }

  async getAll(query) {
    const { search, status, priority, severity, project, assignedTo, reportedBy, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { issueId: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (severity) filter.severity = severity;
    if (project) filter.project = project;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (reportedBy) filter.reportedBy = reportedBy;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [issues, total] = await Promise.all([
      Issue.find(filter)
        .populate('project', 'title projectId')
        .populate('assignedTo', 'name email userId')
        .populate('reportedBy', 'name email userId')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Issue.countDocuments(filter),
    ]);

    return { issues, total };
  }

  async getById(id) {
    const issue = await Issue.findById(id)
      .populate('project', 'title projectId')
      .populate('assignedTo', 'name email userId')
      .populate('reportedBy', 'name email userId');
    if (!issue) throw new ApiError(404, 'Issue not found');
    return issue;
  }

  async update(id, data) {
    const issue = await Issue.findById(id);
    if (!issue) throw new ApiError(404, 'Issue not found');
    if (issue.status === 'resolved' || issue.status === 'closed') {
      throw new ApiError(403, 'Cannot edit resolved or closed issues directly');
    }
    Object.assign(issue, data);
    await issue.save();
    return issue.populate(['project', 'assignedTo', 'reportedBy']);
  }

  async assign(id, assigneeId) {
    const issue = await Issue.findById(id);
    if (!issue) throw new ApiError(404, 'Issue not found');
    issue.assignedTo = assigneeId;
    await issue.save();
    return issue.populate(['project', 'assignedTo', 'reportedBy']);
  }

  async updateStatus(id, newStatus, user) {
    const issue = await Issue.findById(id);
    if (!issue) throw new ApiError(404, 'Issue not found');

    const currentStatus = issue.status;
    const allowedTransitions = VALID_TRANSITIONS[currentStatus];

    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw new ApiError(422, `Cannot transition from '${currentStatus}' to '${newStatus}'`);
    }

    if (currentStatus === 'closed') {
      throw new ApiError(403, 'Closed issues cannot be reopened');
    }

    if (newStatus === 'testing' && issue.assignedTo?.toString() !== user._id.toString() && user.role !== 'admin' && user.role !== 'manager') {
      throw new ApiError(403, 'Only the assigned user can move issue to testing');
    }

    if (newStatus === 'closed' && user.role !== 'admin' && user.role !== 'manager') {
      throw new ApiError(403, 'Only admin or manager can close issues');
    }

    issue.status = newStatus;
    await issue.save();
    return issue.populate(['project', 'assignedTo', 'reportedBy']);
  }

  async delete(id) {
    const issue = await Issue.findByIdAndDelete(id);
    if (!issue) throw new ApiError(404, 'Issue not found');
    return issue;
  }
}

export default new IssueService();
