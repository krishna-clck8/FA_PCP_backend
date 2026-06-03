import projectService from '../services/projectService.js';
import ApiResponse from '../utils/ApiResponse.js';

export const createProject = async (req, res, next) => {
  try {
    const project = await projectService.create(req.body, req.user._id);
    return ApiResponse.success(res, project, 'Project created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getAllProjects = async (req, res, next) => {
  try {
    const { projects, total } = await projectService.getAll(req.query);
    return ApiResponse.paginated(res, projects, total, parseInt(req.query.page || 1), parseInt(req.query.limit || 10));
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getById(req.params.id);
    return ApiResponse.success(res, project);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.update(req.params.id, req.body, req.user._id);
    return ApiResponse.success(res, project, 'Project updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await projectService.delete(req.params.id, req.user._id);
    return ApiResponse.success(res, project, 'Project deleted successfully');
  } catch (error) {
    next(error);
  }
};
