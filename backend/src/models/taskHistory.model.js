const mongoose = require('mongoose');

const taskHistorySchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  action: {
    type: String,
    required: true,
    enum: ['created', 'updated', 'deleted', 'status_changed', 'assigned', 'commented', 'attachment_added']
  },
  field: {
    type: String,
    default: null
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, { 
  timestamps: true 
});

// Optimization index for quick lookup queries inside the task history sidebar tab
taskHistorySchema.index({ taskId: 1, createdAt: -1 });

const TaskHistory = mongoose.model('TaskHistory', taskHistorySchema);
module.exports = TaskHistory;