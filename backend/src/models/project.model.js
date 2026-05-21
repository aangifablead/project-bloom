const mongoose = require('mongoose');

// -------------------- MEMBER --------------------
const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember', // ✅ correct (your team schema)
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member', 'viewer'],
    default: 'member'
  }
}, { _id: false });

// -------------------- MILESTONE --------------------
const milestoneSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  dueDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  }
}, { timestamps: true });

// -------------------- TEMPLATE --------------------
const templateSchema = new mongoose.Schema({
  name: String,
  description: String,
  tasksCount: { type: Number, default: 0 },
  category: { type: String, default: 'General' }
}, { timestamps: true });

// -------------------- PROJECT --------------------
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: String,
  color: { type: String, default: '#5c6bc0' },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // login user stays here
    required: true
  },

  status: {
    type: String,
    enum: ['active', 'completed', 'on-hold', 'archived'],
    default: 'active'
  },

  startDate: { type: Date, default: Date.now },
  endDate: Date,

  members: [memberSchema]
}, { timestamps: true, toJSON: { virtuals: true } });

// -------------------- VIRTUALS --------------------
projectSchema.virtual('createdBy').get(function () {
  return this.owner;
});

projectSchema.virtual('progress').get(function () {
  return this.status === 'completed' ? 100 : 0;
});

// -------------------- INDEX --------------------
projectSchema.index({ owner: 1, status: 1 });
projectSchema.index({ 'members.user': 1 });

module.exports = {
  Project: mongoose.model('Project', projectSchema),
  Milestone: mongoose.model('Milestone', milestoneSchema),
  Template: mongoose.model('Template', templateSchema)
};