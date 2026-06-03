import issueService from '../services/issueService.js';
import ApiResponse from '../utils/ApiResponse.js';

export const createIssue = async (req, res, next) => {
  try {
    const issue = await issueService.create(req.body, req.user._id);
    return ApiResponse.success(res, issue, 'Issue created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getAllIssues = async (req, res, next) => {
  try {
    const { issues, total } = await issueService.getAll(req.query);
    return ApiResponse.paginated(res, issues, total, parseInt(req.query.page || 1), parseInt(req.query.limit || 10));
  } catch (error) {
    next(error);
  }
};

export const getIssueById = async (req, res, next) => {
  try {
    const issue = await issueService.getById(req.params.id);
    return ApiResponse.success(res, issue);
  } catch (error) {
    next(error);
  }
};

export const updateIssue = async (req, res, next) => {
  try {
    const issue = await issueService.update(req.params.id, req.body);
    return ApiResponse.success(res, issue, 'Issue updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteIssue = async (req, res, next) => {
  try {
    const issue = await issueService.delete(req.params.id);
    return ApiResponse.success(res, issue, 'Issue deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const assignIssue = async (req, res, next) => {
  try {
    const issue = await issueService.assign(req.params.id, req.body.assignedTo);
    return ApiResponse.success(res, issue, 'Issue assigned successfully');
  } catch (error) {
    next(error);
  }
};

export const updateIssueStatus = async (req, res, next) => {
  try {
    const issue = await issueService.updateStatus(req.params.id, req.body.status, req.user);
    return ApiResponse.success(res, issue, 'Issue status updated successfully');
  } catch (error) {
    next(error);
  }
};
