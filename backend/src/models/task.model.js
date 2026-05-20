const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const attachmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number }, // in bytes
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const timeEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number, default: 0 }, // dynamically calculated in minutes
  description: { type: String, trim: true }
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [150, 'Task title cannot exceed 150 characters']
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['backlog', 'todo', 'in-progress', 'review', 'done'],
      message: 'Invalid task status'
    },
    default: 'backlog'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Invalid task priority'
    },
    default: 'medium'
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Task must belong to a project']
  },
  assigneeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  dueDate: {
    type: Date,
    default: null
  },
  labels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Label'
  }],
  subtasks: [subtaskSchema],
  comments: [commentSchema],
  attachments: [attachmentSchema],
  timeEntries: [timeEntrySchema]
}, {
  timestamps: true
});

// Optimization Indexes
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ assigneeId: 1 });

// Pre-save validation logic for durations
timeEntrySchema.pre('save', function (next) {
  if (this.startTime && this.endTime) {
    const diffMs = this.endTime - this.startTime;
    this.duration = Math.max(0, Math.round(diffMs / 60000)); // Round to nearest minute
  }
  next();
});

// Instance Method: Safely push a clean history record changes pipeline payload
taskSchema.methods.logHistory = async function (userId, action, details = {}) {
  // Using this.db.model guarantees model resolution regardless of model load ordering
  return await this.db.model('TaskHistory').create({
    taskId: this._id,
    userId,
    action,
    ...details
  });
};

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;