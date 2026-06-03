import { VALID_TRANSITIONS } from '../config/constants.js';
import Issue from '../models/Issue.js';
import ApiError from '../utils/ApiError.js';

export class TransitionValidator {
  static canTransition(currentStatus, newStatus) {
    const allowed = VALID_TRANSITIONS[currentStatus];
    return allowed && allowed.includes(newStatus);
  }

  static validateTransition(currentStatus, newStatus) {
    if (!this.canTransition(currentStatus, newStatus)) {
      throw new ApiError(422, `Invalid transition: '${currentStatus}' -> '${newStatus}'`);
    }
  }
}

export class IssueStateMachine {
  static getValidTransitions(status) {
    return VALID_TRANSITIONS[status] || [];
  }

  static async transition(issueId, newStatus, user) {
    const issue = await Issue.findById(issueId);
    if (!issue) throw new ApiError(404, 'Issue not found');

    TransitionValidator.validateTransition(issue.status, newStatus);

    if (issue.status === 'closed') {
      throw new ApiError(403, 'Closed issues cannot be reopened');
    }

    if (newStatus === 'testing') {
      if (issue.assignedTo && issue.assignedTo.toString() !== user._id.toString()) {
        if (user.role !== 'admin' && user.role !== 'manager') {
          throw new ApiError(403, 'Only the assigned user can move issue to testing');
        }
      }
    }

    if (newStatus === 'closed' && user.role !== 'admin' && user.role !== 'manager') {
      throw new ApiError(403, 'Only admin or manager can close issues');
    }

    issue.status = newStatus;
    await issue.save();
    return issue.populate(['project', 'assignedTo', 'reportedBy']);
  }
}

export class WorkflowService {
  static getTransitions(status) {
    return IssueStateMachine.getValidTransitions(status);
  }

  static async executeTransition(issueId, newStatus, user) {
    return IssueStateMachine.transition(issueId, newStatus, user);
  }
}
