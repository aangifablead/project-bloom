const mongoose = require('mongoose');

// --- 1. SUB-SCHEMAS ---
const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member', 'viewer'],
    default: 'member'
  }
}, { _id: false });

const milestoneSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }
}, { timestamps: true });

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  tasksCount: { type: Number, default: 0 },
  category: { type: String, default: 'General' }
}, { timestamps: true });

// --- 2. MAIN PROJECT SCHEMA ---
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  color: {
    type: String,
    default: '#5c6bc0'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'on-hold', 'archived'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  members: [memberSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// --- 3. VIRTUALS TO PREVENT FRONTEND ERRORS ---

// 🔥 FIXES: "Cannot read properties of undefined (reading 'avatar')"
projectSchema.virtual('createdBy').get(function () {
  return this.owner; 
});

projectSchema.virtual('progress').get(function () {
  if (this.status === 'completed') return 100;
  return 0;
});

projectSchema.virtual('tasksCount').get(function () { return 0; });
projectSchema.virtual('completedTasksCount').get(function () { return 0; });

// --- 4. INDEXES & EXPORTS ---
projectSchema.index({ owner: 1, status: 1 });
projectSchema.index({ 'members.user': 1 });

const Project = mongoose.model('Project', projectSchema);
const Milestone = mongoose.model('Milestone', milestoneSchema);
const Template = mongoose.model('Template', templateSchema);

module.exports = { Project, Milestone, Template };