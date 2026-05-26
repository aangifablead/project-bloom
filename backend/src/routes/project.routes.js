const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware.js');
const { 
  getAllProjects, 
  createProject, 
  getProjectById,
  updateProject,
  deleteProject,
  archiveProject,
  restoreProject,
  cloneProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
  updateProjectMemberRole,
  getProjectTemplates,
  createProjectFromTemplate,
  getProjectMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone
} = require('../controllers/project.controller'); 

// --- Core Template Routes ---
router.route('/templates').get(protect, getProjectTemplates);
router.route('/from-template').post(protect, createProjectFromTemplate);

// --- Core Project Actions ---
router.route('/')
  .get(protect, getAllProjects)    
  .post(protect, createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .patch(protect, updateProject)
  .delete(protect, deleteProject);

router.route('/:id/archive').post(protect, archiveProject);
router.route('/:id/restore').post(protect, restoreProject);
router.route('/:id/clone').post(protect, cloneProject);

// --- Sub-Resource: Members Routing Matrix ---
router.route('/:id/members')
  .get(protect, getProjectMembers)
  .post(protect, addProjectMember);

router.route('/:id/members/:userId')
  .patch(protect, updateProjectMemberRole)
  .delete(protect, removeProjectMember);

// --- Sub-Resource: Milestones Routing Matrix ---
router.route('/:id/milestones')
  .get(protect, getProjectMilestones)
  .post(protect, createMilestone);

router.route('/:id/milestones/:milestoneId')
  .patch(protect, updateMilestone)
  .delete(protect, deleteMilestone);

  // Add this to backend/routes/project.routes.js
router.patch('/:id', async (req, res) => {
    try {
        const { repoOwner, repoName } = req.body;
        // Update project with the new repository details
        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id, 
            { repoOwner, repoName }, 
            { new: true }
        );
        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ error: "Failed to update repository link" });
    }
});

module.exports = router;