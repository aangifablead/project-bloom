const mongoose = require('mongoose');

const taskHistorySchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },

    taskTitle: {
      type: String,
      default: '',
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    action: {
      type: String,
      required: true,
    },

    field: {
      type: String,
      default: null,
    },

    oldValue: mongoose.Schema.Types.Mixed,

    newValue: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  }
);

// ======================================
// VIRTUAL MESSAGE
// ======================================
taskHistorySchema.virtual('message').get(function () {
  // Fix: Show name if user exists, otherwise fallback to "System" or "Anonymous"
  const userName = this.userId?.name || 'System'; 
  const taskTitle = this.taskTitle || 'task';

  // Only show changes if they are NOT null or undefined
  const formatVal = (val) => (val === null || val === undefined ? 'empty' : val);

  if (this.action === 'status_changed') {
    return `${userName} changed "${taskTitle}" from ${formatVal(this.oldValue)} → ${formatVal(this.newValue)}`;
  }

  if (this.action === 'updated' && this.field === 'title') {
    return `${userName} renamed "${formatVal(this.oldValue)}" to "${formatVal(this.newValue)}"`;
  }

  return `${userName} updated "${taskTitle}"`;
});

module.exports = mongoose.model(
  'TaskHistory',
  taskHistorySchema
);