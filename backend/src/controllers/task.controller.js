const TaskHistory = require('../models/taskHistory.model');

const Task = require('../models/task.model');
const Label = require('../models/label.model');

const getUserId = (req) => req.user?._id?.toString() || req.user?.id || null;
const hasValueChanged = (a, b) => {
  if (a === undefined && b === undefined) return false;
  return String(a) !== String(b);
};

const createHistory = async ({ task, userId, action, field = null, oldValue = null, newValue = null }) => {
  if (!action) return;

  await TaskHistory.create({
    taskId: task._id,
    taskTitle: task.title,
    userId: userId || null,
    action,
    field,
    oldValue,
    newValue,
  });
};

const taskController = {
  getAllTasks: async (req, res, next) => {
    try {
      const { projectId, status, priority, assigneeId, search } = req.query;
      const query = {};

      if (projectId) query.projectId = projectId;
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (assigneeId) query.assigneeId = assigneeId === 'null' ? null : assigneeId;
      if (search) query.title = { $regex: search, $options: 'i' };

      const tasks = await Task.find(query)
        .populate('assigneeId', 'name email avatar')
        .populate('labels')
        .sort({ updatedAt: -1 });

      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },

  // ---------------- GET BY ID ----------------
  getTaskById: async (req, res, next) => {
    try {
      const task = await Task.findById(req.params.id)
        .populate('assigneeId', 'name email avatar')
        .populate('labels')
        .populate('comments.userId', 'name avatar');

      if (!task) return res.status(404).json({ message: 'Task not found' });

      res.json(task);
    } catch (err) {
      next(err);
    }
  },

  // ---------------- CREATE ----------------
  createTask: async (req, res, next) => {
    try {
      const task = await Task.create(req.body);

      await createHistory({
        task,
        userId: getUserId(req),
        action: 'created',
      });

      res.status(201).json({ message: 'Task created', data: task });
    } catch (err) {
      next(err);
    }
  },

  // ---------------- UPDATE TASK ----------------
  updateTask: async (req, res, next) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });

      const actorId = getUserId(req);
      const changes = [];

      const fields = ['title', 'description', 'status', 'priority', 'assigneeId'];

      fields.forEach((field) => {
        if (req.body[field] !== undefined && hasValueChanged(task[field], req.body[field])) {
          changes.push({
            action: field === 'status' ? 'status_changed' : 'updated',
            field,
            oldValue: task[field],
            newValue: req.body[field],
          });

          task[field] = req.body[field];
        }
      });

      await task.save();

      if (changes.length) {
        await TaskHistory.insertMany(
          changes.map((c) => ({
            taskId: task._id,
            taskTitle: task.title,
            userId: actorId,
            ...c,
          }))
        );
      }

      res.json(task);
    } catch (err) {
      next(err);
    }
  },

  // ---------------- STATUS ----------------
// controllers/task.controller.js
updateStatus: async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const oldStatus = task.status;
    const newStatus = req.body.status;
    
    // Update the task status
    task.status = newStatus;
    await task.save();

    // 1. Capture the ID
    const userId = req.user?.id || req.userId; // Ensure this matches your auth middleware

    // 2. Log history
    await createHistory({
      task, // Ensure your createHistory function handles the task object correctly
      userId: userId, 
      action: 'status_changed',
      field: 'status',
      oldValue: oldStatus,
      newValue: newStatus,
    });

    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
},

  // ---------------- DELETE ----------------
  deleteTask: async (req, res, next) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });

      // log history BEFORE delete
      await TaskHistory.create({
        taskId: task._id,
        taskTitle: task.title,
        userId: req.user?._id || null,
        action: 'deleted',
        field: null,
        oldValue: task.title,
        newValue: null,
      });

      await Task.findByIdAndDelete(req.params.id);

      res.json({ message: 'Task deleted' });
    } catch (err) {
      next(err);
    }
  },

  // ---------------- BULK ----------------
  bulkUpdateTasks: async (req, res, next) => {
    try {
      await Task.updateMany(
        { _id: { $in: req.body.taskIds } },
        req.body
      );

      res.json({ message: 'Bulk updated' });
    } catch (err) {
      next(err);
    }
  },

  bulkDeleteTasks: async (req, res, next) => {
    try {
      await Task.deleteMany({ _id: { $in: req.body.taskIds } });
      res.json({ message: 'Bulk deleted' });
    } catch (err) {
      next(err);
    }
  },

  // ---------------- ASSIGN ----------------
 // Add these to your assign/unassign methods
assignTask: async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { assigneeId: req.body.userId }, { new: true });
    
    // LOG HISTORY
    await createHistory({
      task,
      userId: getUserId(req), // Use helper consistently
      action: 'assigned',
      field: 'assigneeId',
      newValue: req.body.userId
    });

    res.json(task);
  } catch (err) { next(err); }
},

  unassignTask: async (req, res, next) => {
    try {
      const task = await Task.findByIdAndUpdate(
        req.params.id,
        { assigneeId: null },
        { new: true }
      );

      res.json(task);
    } catch (err) {
      next(err);
    }
  },

  // ---------------- HISTORY ----------------
getHistory: async (req, res, next) => {
  try {
    const history = await TaskHistory.find({ taskId: req.params.id })
      .populate('userId', 'name avatar') // Ensure User model supports 'name' and 'avatar'
      .sort({ createdAt: -1 })
      .lean();

    const result = history.map((h) => ({
      ...h,
      // Use optional chaining to safely check for name
      message: `${h.userId?.name || 'System'} ${
        h.action === 'status_changed'
          ? `changed status from ${h.oldValue ?? 'empty'} → ${h.newValue ?? 'empty'}`
          : h.action === 'created' 
            ? 'created this task'
            : 'updated task'
      }`
    }));
    res.json(result);
  } catch (err) {
    next(err);
  }
},

  // ---------------- LABELS ----------------
  getLabels: async (req, res, next) => {
    try {
      const labels = await Label.find();
      res.json(labels);
    } catch (err) {
      next(err);
    }
  },

  createLabel: async (req, res, next) => {
    try {
      const label = await Label.create(req.body);
      res.status(201).json(label);
    } catch (err) {
      next(err);
    }
  },

  // ---------------- STUBS (prevent undefined routes) ----------------
  addSubtask: async (req, res) => res.json({ message: 'ok' }),
  updateSubtask: async (req, res) => res.json({ message: 'ok' }),
  deleteSubtask: async (req, res) => res.json({ message: 'ok' }),

  getComments: async (req, res) => res.json([]),
  addComment: async (req, res) => res.json({ message: 'ok' }),
  updateComment: async (req, res) => res.json({ message: 'ok' }),
  deleteComment: async (req, res) => res.json({ message: 'ok' }),

  getAttachments: async (req, res) => res.json([]),
  uploadAttachment: async (req, res) => res.json({ message: 'ok' }),
  deleteAttachment: async (req, res) => res.json({ message: 'ok' }),

  getTimeEntries: async (req, res) => res.json([]),
  addTimeEntry: async (req, res) => res.json({ message: 'ok' }),
  startTimer: async (req, res) => res.json({ message: 'ok' }),
  stopTimer: async (req, res) => res.json({ message: 'ok' }),
};

module.exports = taskController;