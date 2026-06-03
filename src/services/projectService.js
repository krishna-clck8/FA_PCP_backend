import Project from '../models/Project.js';
import Issue from '../models/Issue.js';
import ApiError from '../utils/ApiError.js';
import { generateId } from '../utils/helpers.js';

class ProjectService {
  async create(data, ownerId) {
    const projectId = generateId('PRJ');
    const project = await Project.create({
      projectId,
      title: data.title,
      description: data.description || '',
      owner: ownerId,
      members: data.members || [],
      status: data.status || 'active',
    });
    return project.populate(['owner', 'members']);
  }

  async getAll(query) {
    const { search, status, owner, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { projectId: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) filter.status = status;
    if (owner) filter.owner = owner;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [projects, total] = await Promise.all([
      Project.find(filter).populate('owner', 'name email userId').populate('members', 'name email userId').sort(sort).skip(skip).limit(parseInt(limit)),
      Project.countDocuments(filter),
    ]);

    return { projects, total };
  }

  async getById(id) {
    const project = await Project.findById(id)
      .populate('owner', 'name email userId')
      .populate('members', 'name email userId');
    if (!project) throw new ApiError(404, 'Project not found');
    return project;
  }

  async update(id, data, userId) {
    const project = await Project.findById(id);
    if (!project) throw new ApiError(404, 'Project not found');
    if (project.owner.toString() !== userId) {
      throw new ApiError(403, 'Only the project owner can update it');
    }

    Object.assign(project, data);
    await project.save();
    return project.populate(['owner', 'members']);
  }

  async delete(id, userId) {
    const project = await Project.findById(id);
    if (!project) throw new ApiError(404, 'Project not found');

    const issues = await Issue.countDocuments({ project: id });
    if (issues > 0) {
      throw new ApiError(409, 'Cannot delete project with existing issues');
    }

    await Project.findByIdAndDelete(id);
    return project;
  }
}

export default new ProjectService();
