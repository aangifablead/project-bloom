const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    type: {
      type: String,
      enum: [
        'task_created',
        'task_updated',
        'task_completed',
        'project_created',
        'timesheet_submitted',
        'timesheet_approved',
      ],
    },

    message: String,

    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);