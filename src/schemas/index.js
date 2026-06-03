import { z } from 'zod';

const ROLES = ['admin', 'manager'];
const USER_STATUS = ['active', 'inactive'];
const PROJECT_STATUS = ['active', 'completed', 'archived'];
const ISSUE_PRIORITY = ['low', 'medium', 'high'];
const ISSUE_SEVERITY = ['minor', 'major', 'critical'];
const ISSUE_STATUS = ['open', 'in-progress', 'testing', 'resolved', 'closed'];

export const RegisterUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(ROLES).optional().default('manager'),
    department: z.string().optional().default('General'),
  }),
});

export const LoginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const CreateProjectSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional().default(''),
    members: z.array(z.string()).optional().default([]),
    status: z.enum(PROJECT_STATUS).optional().default('active'),
  }),
});

export const UpdateProjectSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    members: z.array(z.string()).optional(),
    status: z.enum(PROJECT_STATUS).optional(),
  }),
  params: z.object({ id: z.string().min(1, 'Project ID is required') }),
});

export const CreateIssueSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional().default(''),
    project: z.string().min(1, 'Project ID is required'),
    assignedTo: z.string().optional(),
    priority: z.enum(ISSUE_PRIORITY).optional().default('medium'),
    severity: z.enum(ISSUE_SEVERITY).optional().default('major'),
  }),
});

export const UpdateIssueSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    priority: z.enum(ISSUE_PRIORITY).optional(),
    severity: z.enum(ISSUE_SEVERITY).optional(),
  }),
  params: z.object({ id: z.string().min(1, 'Issue ID is required') }),
});

export const AssignIssueSchema = z.object({
  body: z.object({
    assignedTo: z.string().min(1, 'Assignee ID is required'),
  }),
  params: z.object({ id: z.string().min(1, 'Issue ID is required') }),
});

export const UpdateIssueStatusSchema = z.object({
  body: z.object({
    status: z.enum(ISSUE_STATUS, { message: 'Invalid status' }),
  }),
  params: z.object({ id: z.string().min(1, 'Issue ID is required') }),
});

export const CreateCommentSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Comment message is required'),
    issue: z.string().min(1, 'Issue ID is required'),
  }),
});

export const DatasetSyncSchema = z.object({
  body: z.object({}).optional(),
});

