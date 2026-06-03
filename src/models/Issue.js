import mongoose from 'mongoose';
import { ISSUE_PRIORITY, ISSUE_SEVERITY, ISSUE_STATUS } from '../config/constants.js';

const issueSchema = new mongoose.Schema(
  {
    issueId: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    priority: { type: String, enum: ISSUE_PRIORITY, default: 'medium' },
    severity: { type: String, enum: ISSUE_SEVERITY, default: 'major' },
    status: { type: String, enum: ISSUE_STATUS, default: 'open' },
  },
  { timestamps: true }
);

issueSchema.index({ title: 'text', description: 'text' });
issueSchema.index({ project: 1 });
issueSchema.index({ assignedTo: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ priority: 1 });
issueSchema.index({ severity: 1 });

export default mongoose.model('Issue', issueSchema);
