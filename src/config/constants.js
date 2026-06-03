export const ROLES = ['admin', 'manager'];
export const USER_STATUS = ['active', 'inactive'];
export const PROJECT_STATUS = ['active', 'completed', 'archived'];
export const ISSUE_PRIORITY = ['low', 'medium', 'high'];
export const ISSUE_SEVERITY = ['minor', 'major', 'critical'];
export const ISSUE_STATUS = ['open', 'in-progress', 'testing', 'resolved', 'closed'];

export const VALID_TRANSITIONS = {
  open: ['in-progress'],
  'in-progress': ['testing', 'open'],
  testing: ['resolved', 'in-progress'],
  resolved: ['closed', 'testing'],
  closed: [],
};
