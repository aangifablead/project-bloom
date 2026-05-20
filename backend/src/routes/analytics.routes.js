const express = require('express');
const router = express.Router();

const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/dashboard', authenticate, analyticsController.getDashboardStats);

router.get('/projects', authenticate, analyticsController.getAllProjectsAnalytics);
router.get('/projects/:id', authenticate, analyticsController.getProjectAnalytics);

router.get('/team/productivity', authenticate, analyticsController.getTeamProductivity);

router.get('/tasks/trends', authenticate, analyticsController.getTaskTrends);

router.get('/time-reports', authenticate, analyticsController.getTimeReports);

router.get('/timesheets', authenticate, analyticsController.getTimesheets);

router.post('/timesheets/:id/submit', authenticate, analyticsController.submitTimesheet);
router.post('/timesheets/:id/approve', authenticate, analyticsController.approveTimesheet);
router.post('/timesheets/:id/reject', authenticate, analyticsController.rejectTimesheet);

router.get('/activity', authenticate, analyticsController.getRecentActivity);

router.get('/export', authenticate, analyticsController.exportReport);

module.exports = router;