import mongoose from 'mongoose';
import { PROJECT_STATUS } from '../config/constants.js';

const projectSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: PROJECT_STATUS, default: 'active' },
  },
  { timestamps: true }
);

projectSchema.index({ title: 'text', description: 'text' });
projectSchema.index({ owner: 1 });
projectSchema.index({ status: 1 });

export default mongoose.model('Project', projectSchema);
