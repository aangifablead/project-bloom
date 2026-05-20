const Task = require('../models/task.model');
const { Project } = require('../models/project.model');
const Timesheet = require('../models/timesheet.model');
const Activity = require('../models/activity.model');
const mongoose = require('mongoose');

/**
 * GET /api/analytics/dashboard
 */
exports.getDashboardStats = async (req, res) => {
  const [totalTasks, completedTasks, totalProjects] = await Promise.all([
    Task.countDocuments(),
    Task.countDocuments({ status: 'done' }),
    Project.countDocuments()
  ]);

  const overdueTasks = await Task.countDocuments({
    dueDate: { $lt: new Date() },
    status: { $ne: 'done' },
  });

  // Aggregate tasks by status
  const tasksByStatus = await Task.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $project: { _id: 0, status: "$_id", count: 1 } }
  ]);

  // Aggregate tasks by priority
  const tasksByPriority = await Task.aggregate([
    { $group: { _id: "$priority", count: { $sum: 1 } } },
    { $project: { _id: 0, priority: "$_id", count: 1 } }
  ]);

  res.json({
    totalTasks,
    completedTasks,
    overdueTasks,
    totalProjects,
    completionRate: totalTasks ? (completedTasks / totalTasks) * 100 : 0,
    tasksByStatus,
    tasksByPriority,
    recentActivity: [] // Add logic to fetch latest logs
  });
};

/**
 * GET /api/analytics/projects/:id
 */
exports.getProjectAnalytics = async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id);
  const tasks = await Task.find({ projectId: id });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const overdueTasks = tasks.filter(
    t => t.dueDate < new Date() && t.status !== 'done'
  ).length;

  res.json({
    projectId: id,
    projectName: project?.name,
    totalTasks,
    completedTasks,
    overdueTasks,
    completionRate: totalTasks ? (completedTasks / totalTasks) * 100 : 0,
    averageTaskDuration: 0,
    burndownData: [],
    velocityData: [],
  });
};

/**
 * GET /api/analytics/projects
 */
exports.getAllProjectsAnalytics = async (req, res) => {
  const projects = await Project.find();

  const result = await Promise.all(
    projects.map(async (p) => {
      const tasks = await Task.find({ projectId: p._id });

      const completed = tasks.filter(t => t.status === 'done').length;

      return {
        projectId: p._id,
        projectName: p.name,
        totalTasks: tasks.length,
        completedTasks: completed,
        overdueTasks: tasks.filter(
          t => t.dueDate < new Date() && t.status !== 'done'
        ).length,
        completionRate: tasks.length ? (completed / tasks.length) * 100 : 0,
        averageTaskDuration: 0,
        burndownData: [],
        velocityData: [],
      };
    })
  );

  res.json(result);
};

/**
 * GET /api/analytics/team/productivity
 */
exports.getTeamProductivity = async (req, res) => {
  const users = await Task.aggregate([
    {
      $group: {
        _id: '$assignedTo',
        tasksCompleted: {
          $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
        },
      },
    },
  ]);

  res.json(users.map(u => ({
    userId: u._id,
    userName: 'User',
    tasksCompleted: u.tasksCompleted,
    hoursLogged: 0,
    averageCompletionTime: 0,
    onTimeDeliveryRate: 0,
  })));
};

/**
 * GET /api/analytics/tasks/trends
 */
exports.getTaskTrends = async (req, res) => {
  const { period } = req.query;

  // simplified mock aggregation
  res.json([
    { date: '2026-01-01', completed: 10, created: 15 },
    { date: '2026-01-02', completed: 12, created: 18 },
  ]);
};

/**
 * GET /api/analytics/time-reports
 */
exports.getTimeReports = async (req, res) => {
  const timesheets = await Timesheet.find();
  res.json(timesheets);
};

/**
 * GET /api/analytics/timesheets
 */
exports.getTimesheets = async (req, res) => {
  const { status } = req.query;

  const query = status ? { status } : {};
  const timesheets = await Timesheet.find(query);

  res.json(timesheets);
};

/**
 * POST /api/analytics/timesheets/:id/submit
 */
exports.submitTimesheet = async (req, res) => {
  const ts = await Timesheet.findByIdAndUpdate(
    req.params.id,
    { status: 'submitted', submittedAt: new Date() },
    { new: true }
  );

  res.json(ts);
};

/**
 * POST /api/analytics/timesheets/:id/approve
 */
exports.approveTimesheet = async (req, res) => {
  const ts = await Timesheet.findByIdAndUpdate(
    req.params.id,
    {
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: req.user?.id,
    },
    { new: true }
  );

  res.json(ts);
};

/**
 * POST /api/analytics/timesheets/:id/reject
 */
exports.rejectTimesheet = async (req, res) => {
  const { reason } = req.body;

  const ts = await Timesheet.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected', rejectionReason: reason },
    { new: true }
  );

  res.json(ts);
};

/**
 * GET /api/analytics/activity
 */
exports.getRecentActivity = async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;

  const activity = await Activity.find()
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json(activity);
};

/**
 * GET /api/analytics/export
 */
exports.exportReport = async (req, res) => {
  const { type, format } = req.query;

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    return res.send('id,name,value\n1,test,100');
  }

  res.json({ message: 'Export generated', type, format });
};