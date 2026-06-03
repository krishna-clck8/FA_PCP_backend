import fetcherService from './fetcherService.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Issue from '../models/Issue.js';
import Comment from '../models/Comment.js';
import logger from '../utils/logger.js';

class DatasetSyncService {
  async sync() {
    const report = { totalFetched: 0, inserted: 0, duplicates: 0, rejected: 0 };

    try {
      const dataset = await fetcherService.fetchDataset();
      if (!dataset) {
        logger.warn('No dataset received');
        return report;
      }

      const userMap = await this.syncUsers(dataset.users || [], report);
      const projectMap = await this.syncProjects(dataset.projects || [], report);
      await this.syncIssues(dataset.issues || [], userMap, projectMap, report);
      await this.syncComments(dataset.comments || [], userMap, report);

      logger.info('Sync report:', report);
      return report;
    } catch (error) {
      logger.error('Dataset sync failed:', error.message);
      throw error;
    }
  }

  normalizeRole(role) {
    if (!role) return 'manager';
    const r = role.toLowerCase().trim();
    if (r === 'admin') return 'admin';
    if (r === 'manager') return 'manager';
    return 'manager';
  }

  normalizeProjectStatus(status) {
    if (!status) return 'active';
    const s = status.toLowerCase().trim();
    if (s === 'completed') return 'completed';
    if (s === 'archived') return 'archived';
    return 'active';
  }

  normalizeIssueStatus(status) {
    if (!status) return 'open';
    const s = status.toLowerCase().trim();
    if (['in-progress', 'in_progress'].includes(s)) return 'in-progress';
    if (s === 'testing') return 'testing';
    if (s === 'resolved') return 'resolved';
    if (['closed', 'done'].includes(s)) return 'closed';
    return 'open';
  }

  normalizePriority(p) {
    if (!p) return 'medium';
    const v = p.toLowerCase().trim();
    if (['low', 'medium', 'high'].includes(v)) return v;
    return 'medium';
  }

  normalizeSeverity(s) {
    if (!s) return 'major';
    const v = s.toLowerCase().trim();
    if (['minor', 'major', 'critical'].includes(v)) return v;
    return 'major';
  }

  async syncUsers(users, report) {
    const userMap = {};

    for (const u of users) {
      try {
        if (!u || !u.email) { report.rejected++; continue; }

        const name = (u.name || '').trim();
        const email = u.email.trim().toLowerCase();
        if (!name || !email) { report.rejected++; continue; }

        const existing = await User.findOne({ email });
        if (existing) {
          userMap[u.userId] = existing._id;
          report.duplicates++;
          continue;
        }

        const newUser = await User.create({
          userId: u.userId || `USR_${Date.now()}`,
          name,
          email,
          password: 'default123456',
          role: this.normalizeRole(u.role),
          department: (u.department || 'General').trim(),
          status: u.status === 'active' ? 'active' : 'active',
        });

        userMap[u.userId] = newUser._id;
        report.inserted++;
      } catch (error) {
        if (error.code === 11000) {
          const existing = await User.findOne({ email: u.email?.trim().toLowerCase() });
          if (existing) userMap[u.userId] = existing._id;
          report.duplicates++;
        } else {
          logger.warn(`User sync error: ${error.message}`);
          report.rejected++;
        }
      }
    }

    logger.info(`Users synced: ${report.inserted} inserted`);
    return userMap;
  }

  async syncProjects(projects, report) {
    const projectMap = {};

    for (const p of projects) {
      try {
        if (!p || !p.title) { report.rejected++; continue; }

        const title = p.title.trim();
        if (!title) { report.rejected++; continue; }

        const existing = await Project.findOne({ projectId: p.projectId });
        if (existing) {
          projectMap[p.projectId] = existing._id;
          report.duplicates++;
          continue;
        }

        const newProject = await Project.create({
          projectId: p.projectId || `PRJ_${Date.now()}`,
          title,
          description: (p.description || '').trim(),
          status: this.normalizeProjectStatus(p.status),
        });

        projectMap[p.projectId] = newProject._id;
        report.inserted++;
      } catch (error) {
        if (error.code === 11000) {
          const existing = await Project.findOne({ projectId: p.projectId });
          if (existing) projectMap[p.projectId] = existing._id;
          report.duplicates++;
        } else {
          logger.warn(`Project sync error: ${error.message}`);
          report.rejected++;
        }
      }
    }

    logger.info(`Projects synced. Map size: ${Object.keys(projectMap).length}`);
    return projectMap;
  }

  async syncIssues(issues, userMap, projectMap, report) {
    let inserted = 0;

    for (const i of issues) {
      try {
        if (!i || !i.title) { report.rejected++; continue; }

        const existing = await Issue.findOne({ issueId: i.issueId });
        if (existing) { report.duplicates++; continue; }

        const projectId = projectMap[i.projectId];
        if (!projectId) {
          logger.debug(`Issue ${i.issueId}: project ${i.projectId} not found, skipping`);
          report.rejected++;
          continue;
        }

        const reportedBy = userMap[i.reportedBy];
        if (!reportedBy) {
          logger.debug(`Issue ${i.issueId}: reporter ${i.reportedBy} not found, skipping`);
          report.rejected++;
          continue;
        }

        await Issue.create({
          issueId: i.issueId,
          title: i.title.trim(),
          description: (i.description || '').trim(),
          project: projectId,
          assignedTo: userMap[i.assignedTo] || null,
          reportedBy,
          priority: this.normalizePriority(i.priority),
          severity: this.normalizeSeverity(i.severity),
          status: this.normalizeIssueStatus(i.status),
        });
        inserted++;
      } catch (error) {
        if (error.code === 11000) {
          report.duplicates++;
        } else {
          logger.warn(`Issue sync error: ${error.message}`);
          report.rejected++;
        }
      }
    }

    report.inserted += inserted;
    logger.info(`Issues synced: ${inserted} inserted`);
  }

  async syncComments(comments, userMap, report) {
    let inserted = 0;

    for (const c of comments) {
      try {
        if (!c || !c.message) { report.rejected++; continue; }

        const existing = await Comment.findOne({ commentId: c.commentId });
        if (existing) { report.duplicates++; continue; }

        const userId = userMap[c.userId];
        if (!userId) {
          logger.debug(`Comment ${c.commentId}: user ${c.userId} not found, skipping`);
          report.rejected++;
          continue;
        }

        const issue = await Issue.findOne({ issueId: c.issueId });
        if (!issue) {
          logger.debug(`Comment ${c.commentId}: issue ${c.issueId} not found, skipping`);
          report.rejected++;
          continue;
        }

        await Comment.create({
          commentId: c.commentId,
          message: c.message.trim(),
          user: userId,
          issue: issue._id,
        });
        inserted++;
      } catch (error) {
        if (error.code === 11000) {
          report.duplicates++;
        } else {
          logger.warn(`Comment sync error: ${error.message}`);
          report.rejected++;
        }
      }
    }

    report.inserted += inserted;
    logger.info(`Comments synced: ${inserted} inserted`);
  }
}

export default new DatasetSyncService();
