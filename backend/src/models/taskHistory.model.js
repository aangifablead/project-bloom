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
  // If 'userId' was populated, it's an object; otherwise, it's an ObjectId
  const userName = (this.userId && this.userId.name) ? this.userId.name : 'System';
  const taskTitle = this.taskTitle || 'task';

  const formatVal = (val) => (val === null || val === undefined ? 'empty' : val);

  if (this.action === 'status_changed') {
    return `${userName} changed "${taskTitle}" from ${formatVal(this.oldValue)} → ${formatVal(this.newValue)}`;
  }

  return `${userName} updated "${taskTitle}"`;
});

module.exports = mongoose.model(
  'TaskHistory',
  taskHistorySchema
);