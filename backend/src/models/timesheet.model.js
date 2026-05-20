const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  },
  taskTitle: String,
  hours: Number,
});

const timesheetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    weekStartDate: { type: Date, required: true },
    weekEndDate: { type: Date, required: true },

    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'rejected'],
      default: 'draft',
    },

    totalHours: {
      type: Number,
      default: 0,
    },

    entries: [
      {
        date: Date,
        projectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Project',
        },
        projectName: String,

        hoursLogged: Number,
        tasks: [timeEntrySchema],
      },
    ],

    submittedAt: Date,
    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    rejectionReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Timesheet', timesheetSchema);