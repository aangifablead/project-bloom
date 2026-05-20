// routes/task.routes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');

// Optional: Import an authentication middleware if required
// const { protect } = require('../middlewares/auth.middleware');
// router.use(protect); 

// --- Labels (Not bound to individual tasks) ---
router.route('/labels')
  .get(taskController.getLabels)
  .post(taskController.createLabel);

// --- Bulk Operations (Placed before /:id) ---
router.route('/bulk')
  .patch(taskController.bulkUpdateTasks)
  .delete(taskController.bulkDeleteTasks);

// --- Base Task Operations ---
router.route('/')
  .get(taskController.getAllTasks)
  .post(taskController.createTask);

router.route('/:id')
  .get(taskController.getTaskById)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);

// --- Status & Assignment ---
router.patch('/:id/status', taskController.updateStatus);

router.route('/:id/assign')
  .post(taskController.assignTask)
  .delete(taskController.unassignTask);

// --- Subtasks ---
router.post('/:id/subtasks', taskController.addSubtask);
router.patch('/:id/subtasks/:subtaskId', taskController.updateSubtask);
router.delete('/:id/subtasks/:subtaskId', taskController.deleteSubtask);

// --- Comments ---
router.route('/:id/comments')
  .get(taskController.getComments)
  .post(taskController.addComment);

router.route('/:id/comments/:commentId')
  .patch(taskController.updateComment)
  .delete(taskController.deleteComment);

// --- Attachments ---
router.route('/:id/attachments')
  .get(taskController.getAttachments)
  .post(taskController.uploadAttachment); // Add file uploading middleware here if needed

router.delete('/:id/attachments/:attachmentId', taskController.deleteAttachment);

// --- Time Tracking ---
router.route('/:id/time-entries')
  .get(taskController.getTimeEntries)
  .post(taskController.addTimeEntry);

router.post('/:id/time-entries/start', taskController.startTimer);
router.post('/:id/time-entries/stop', taskController.stopTimer);

// --- History ---
router.get('/:id/history', taskController.getHistory);

module.exports = router;