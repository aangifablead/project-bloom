const Task = require('../models/task.model');
const TaskHistory = require('../models/taskHistory.model');
const Label = require('../models/label.model');

const taskController = {
  // GET /api/tasks
  getAllTasks: async (req, res, next) => {
    try {
      const { projectId, status, priority, assigneeId, search } = req.query;
      const query = {};

      if (projectId) query.projectId = projectId;
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (assigneeId) query.assigneeId = assigneeId === 'null' ? null : assigneeId;

      if (search) {
        query.title = { $regex: search, $options: 'i' };
      }

      const tasks = await Task.find(query)
        .populate('assigneeId', 'name email')
        .populate('labels')
        .sort({ updatedAt: -1 });

      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/tasks/:id
  getTaskById: async (req, res, next) => {
    try {
      const task = await Task.findById(req.params.id)
        .populate('assigneeId', 'name email')
        .populate('labels')
        .populate('comments.userId', 'name');

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/tasks
  createTask: async (req, res, next) => {
    try {
      const task = new Task(req.body);
      await task.save();

      // FALLBACK CHAIN: 
      // 1. Try logged-in user session (req.user?.id)
      // 2. Try the task assignee (task.assigneeId)
      // 3. Fall back to a default system/owner placeholder to prevent a database validation crash
      const actorId = req.user?.id || task.assigneeId || "6a06fb97920dba4ec9e01ce3";

      // Log initial historical footprint
      await task.logHistory(actorId, 'created');

      res.status(201).json({ message: 'Task created successfully', data: task });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/tasks/:id
  updateTask: async (req, res, next) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });

      // Track modifications for logging
      const updates = req.body;
      Object.assign(task, updates);
      await task.save();

      await task.logHistory(req.user?.id, 'updated');
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/tasks/:id
  deleteTask: async (req, res, next) => {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });

      // Clean historical entries cascadingly
      await TaskHistory.deleteMany({ taskId: req.params.id });

      res.status(200).json({ message: `Task ${req.params.id} deleted successfully` });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/tasks/:id/status
  updateStatus: async (req, res, next) => {
    try {
      let { status } = req.body;

      // 1. Unified Mapping Strategy: Map all possible incoming strings to your Database Enum
      const statusMap = {
        'backlog': 'backlog',
        'todo': 'todo',
        'to-do': 'todo',
        'in-progress': 'in-progress',
        'inProgress': 'inProgress',
        'review': 'review',
        'done': 'done'
      };

      const mappedStatus = statusMap[status];

      if (!mappedStatus) {
        return res.status(400).json({ message: `Invalid status value: ${status}` });
      }

      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });

      const oldStatus = task.status;
      task.status = mappedStatus; // Assign the mapped (valid) status
      await task.save();

      await task.logHistory(req.user?.id, 'status_changed', {
        field: 'status',
        oldValue: oldStatus,
        newValue: mappedStatus
      });

      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/tasks/:id/assign
  assignTask: async (req, res, next) => {
    try {
      const { userId } = req.body;
      const task = await Task.findByIdAndUpdate(
        req.params.id,
        { $set: { assigneeId: userId } },
        { new: true, runValidators: true }
      );
      if (!task) return res.status(404).json({ message: 'Task not found' });

      await task.logHistory(req.user?.id, 'assigned', { field: 'assigneeId', newValue: userId });
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/tasks/:id/assign
  unassignTask: async (req, res, next) => {
    try {
      const task = await Task.findByIdAndUpdate(
        req.params.id,
        { $set: { assigneeId: null } },
        { new: true }
      );
      if (!task) return res.status(404).json({ message: 'Task not found' });

      await task.logHistory(req.user?.id, 'assigned', { field: 'assigneeId', oldValue: 'assigned' });
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/tasks/bulk
  bulkUpdateTasks: async (req, res, next) => {
    try {
      const { taskIds, ...updateData } = req.body;
      await Task.updateMany(
        { _id: { $in: taskIds } },
        { $set: updateData },
        { runValidators: true }
      );
      res.status(200).json({ message: 'Tasks updated successfully', updatedIds: taskIds });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/tasks/bulk
  bulkDeleteTasks: async (req, res, next) => {
    try {
      const { taskIds } = req.body;
      await Task.deleteMany({ _id: { $in: taskIds } });
      await TaskHistory.deleteMany({ taskId: { $in: taskIds } });
      res.status(200).json({ message: 'Tasks deleted successfully', deletedIds: taskIds });
    } catch (error) {
      next(error);
    }
  },

  // --- Subtasks ---
  addSubtask: async (req, res, next) => {
    try {
      const { title } = req.body;
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });

      task.subtasks.push({ title, completed: false });
      await task.save();

      res.status(201).json(task.subtasks[task.subtasks.length - 1]);
    } catch (error) {
      next(error);
    }
  },

  updateSubtask: async (req, res, next) => {
    try {
      const { id, subtaskId } = req.params;
      const task = await Task.findOne({ _id: id, 'subtasks._id': subtaskId });
      if (!task) return res.status(404).json({ message: 'Subtask link context missing' });

      const subtask = task.subtasks.id(subtaskId);
      Object.assign(subtask, req.body);
      await task.save();

      res.status(200).json(subtask);
    } catch (error) {
      next(error);
    }
  },

  deleteSubtask: async (req, res, next) => {
    try {
      const { id, subtaskId } = req.params;
      const task = await Task.findByIdAndUpdate(
        id,
        { $pull: { subtasks: { _id: subtaskId } } },
        { new: true }
      );
      if (!task) return res.status(404).json({ message: 'Task context target structural error' });
      res.status(200).json({ message: `Subtask ${subtaskId} deleted` });
    } catch (error) {
      next(error);
    }
  },

  // --- Comments ---
  getComments: async (req, res, next) => {
    try {
      const task = await Task.findById(req.params.id).populate('comments.userId', 'name');
      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.status(200).json(task.comments);
    } catch (error) {
      next(error);
    }
  },

  addComment: async (req, res, next) => {
    try {
      const { content, mentions } = req.body;
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });

      const newComment = { userId: req.user?.id, content, mentions };
      task.comments.push(newComment);
      await task.save();

      await task.logHistory(req.user?.id, 'commented');
      res.status(201).json(task.comments[task.comments.length - 1]);
    } catch (error) {
      next(error);
    }
  },

  updateComment: async (req, res, next) => {
    try {
      const { id, commentId } = req.params;
      const task = await Task.findOne({ _id: id, 'comments._id': commentId });
      if (!task) return res.status(404).json({ message: 'Comment context mapping mismatch' });

      const comment = task.comments.id(commentId);
      comment.content = req.body.content;
      await task.save();

      res.status(200).json(comment);
    } catch (error) {
      next(error);
    }
  },

  deleteComment: async (req, res, next) => {
    try {
      const { id, commentId } = req.params;
      await Task.findByIdAndUpdate(id, { $pull: { comments: { _id: commentId } } });
      res.status(200).json({ message: `Comment ${commentId} deleted` });
    } catch (error) {
      next(error);
    }
  },

  // --- Attachments ---
  getAttachments: async (req, res, next) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.status(200).json(task.attachments);
    } catch (error) {
      next(error);
    }
  },

  uploadAttachment: async (req, res, next) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });

      const attachment = {
        name: req.file?.originalname || req.body.name,
        url: req.file?.path || req.body.url, // Adapts seamlessly to file or text body URL links
        size: req.file?.size || req.body.size,
        uploadedBy: req.user?.id
      };

      task.attachments.push(attachment);
      await task.save();

      await task.logHistory(req.user?.id, 'attachment_added');
      res.status(201).json(task.attachments[task.attachments.length - 1]);
    } catch (error) {
      next(error);
    }
  },

  deleteAttachment: async (req, res, next) => {
    try {
      const { id, attachmentId } = req.params;
      await Task.findByIdAndUpdate(id, { $pull: { attachments: { _id: attachmentId } } });
      res.status(200).json({ message: `Attachment ${attachmentId} deleted` });
    } catch (error) {
      next(error);
    }
  },

  // --- Time Tracking ---
  getTimeEntries: async (req, res, next) => {
    try {
      const task = await Task.findById(req.params.id);
      res.status(200).json(task ? task.timeEntries : []);
    } catch (error) {
      next(error);
    }
  },

  startTimer: async (req, res, next) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });

      const newEntry = { userId: req.user?.id, startTime: new Date() };
      task.timeEntries.push(newEntry);
      await task.save();

      res.status(200).json(task.timeEntries[task.timeEntries.length - 1]);
    } catch (error) {
      next(error);
    }
  },

  stopTimer: async (req, res, next) => {
    try {
      const { id } = req.params;
      const task = await Task.findOne({ _id: id, 'timeEntries.userId': req.user?.id, 'timeEntries.endTime': null });
      if (!task) return res.status(400).json({ message: 'No running timer sequence found for this user' });

      // Find the active time entry that hasn't ended yet
      const entry = task.timeEntries.find(e => e.userId.toString() === req.user?.id && !e.endTime);
      entry.endTime = new Date();
      await task.save(); // pre-save middleware handles duration computation instantly

      res.status(200).json(entry);
    } catch (error) {
      next(error);
    }
  },

  addTimeEntry: async (req, res, next) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });

      const manualEntry = { userId: req.user?.id, ...req.body };
      task.timeEntries.push(manualEntry);
      await task.save();

      res.status(201).json(task.timeEntries[task.timeEntries.length - 1]);
    } catch (error) {
      next(error);
    }
  },

  // --- History ---
  getHistory: async (req, res, next) => {
    try {
      const history = await TaskHistory.find({ taskId: req.params.id })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
      res.status(200).json(history);
    } catch (error) {
      next(error);
    }
  },

  // --- Labels ---
  getLabels: async (req, res, next) => {
    try {
      const labels = await Label.find({});
      res.status(200).json(labels);
    } catch (error) {
      next(error);
    }
  },

  createLabel: async (req, res, next) => {
    try {
      const label = new Label(req.body);
      await label.save();
      res.status(201).json(label);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = taskController;