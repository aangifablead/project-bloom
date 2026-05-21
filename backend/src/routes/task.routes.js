const express = require('express');
const router = express.Router();

const taskController = require('../controllers/task.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// =========================================
// TASKS
// =========================================
router.get('/', authenticate, taskController.getAllTasks);

router.get('/:id', authenticate, taskController.getTaskById);

router.post('/', authenticate, taskController.createTask);

router.patch('/:id', authenticate, taskController.updateTask);

router.patch('/:id/status', authenticate, taskController.updateStatus);

router.delete('/:id', authenticate, taskController.deleteTask);

// =========================================
// BULK
// =========================================
router.patch('/bulk/update', authenticate, taskController.bulkUpdateTasks);

router.delete('/bulk/delete', authenticate, taskController.bulkDeleteTasks);

// =========================================
// ASSIGNMENT
// =========================================
router.patch('/:id/assign', authenticate, taskController.assignTask);

router.patch('/:id/unassign', authenticate, taskController.unassignTask);

// =========================================
// HISTORY
// =========================================
router.get('/:id/history', authenticate, taskController.getHistory);

// =========================================
// LABELS
// =========================================
router.get('/labels/all', authenticate, taskController.getLabels);

// =========================================
// SUBTASKS
// =========================================
router.post('/:id/subtasks', authenticate, taskController.addSubtask);

router.patch('/:id/subtasks/:subtaskId', authenticate, taskController.updateSubtask);

router.delete('/:id/subtasks/:subtaskId', authenticate, taskController.deleteSubtask);

// =========================================
// COMMENTS
// =========================================
router.get('/:id/comments', authenticate, taskController.getComments);

router.post('/:id/comments', authenticate, taskController.addComment);

router.patch('/:id/comments/:commentId', authenticate, taskController.updateComment);

router.delete('/:id/comments/:commentId', authenticate, taskController.deleteComment);

// =========================================
// ATTACHMENTS
// =========================================
router.get('/:id/attachments', authenticate, taskController.getAttachments);

router.post('/:id/attachments', authenticate, taskController.uploadAttachment);

router.delete('/:id/attachments/:attachmentId', authenticate, taskController.deleteAttachment);

// =========================================
// TIME TRACKING
// =========================================
router.get('/:id/time-entries', authenticate, taskController.getTimeEntries);

router.post('/:id/time-entries', authenticate, taskController.addTimeEntry);

router.post('/:id/start-timer', authenticate, taskController.startTimer);

router.post('/:id/stop-timer', authenticate, taskController.stopTimer);

module.exports = router;